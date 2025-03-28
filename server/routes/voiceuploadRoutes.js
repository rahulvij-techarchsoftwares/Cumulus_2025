const router = require("express").Router();
const mongoose = require("mongoose");
const { Activity } = require("../models/activityModel");
const { Userlogin } = require("../models/userModel");
const multer = require("multer");
const { PutObjectCommand, HeadObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner'); 
const { encryptvoice, decryptvoice } = require("../utilities/voiceencryptionUtils");
const Voice = require("../models/uservoiceUpload");
const { authenticateToken } = require("../routes/userRoutes");
const s3 = require("../config/s3Client");
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
// Set up storage for the uploaded file
const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept MP3 and M4A file types
    if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp4" || file.mimetype === 'audio/mp3') {
      return cb(null, true); // Accept the file
    } else {
      return cb(new Error("Only MP3 or M4A files are allowed"), false); // Reject other types
    }
  },
}).single("voice_file"); // Adjust field name to match the form key
router.post("/upload-voice", authenticateToken, upload, async (req, res) => {
  const { voice_name, duration } = req.body;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Extract user_id from the decoded token
  const user_id = req.user ? req.user.user_id : null;
  if (!user_id) {
    return res.status(401).json({ error: "User ID not found in token" });
  }
  try {
    const existingVoices = await Voice.find({ user_id });
    const decryptedVoiceNames = existingVoices.map(voice => decryptvoice(voice.voice_name, voice.iv_voice_name));
    // ✅ Check if the entered voice name already exists
    if (decryptedVoiceNames.includes(voice_name)) {
      return res.status(400).json({ error: `A voice named "${voice_name}" already exists` });
    }
    // Generate unique S3 key and link for the file
    const aws_file_key = `${user_id}/voicerecording_folder/${voice_name}_${Date.now()}.m4a`;
    const aws_file_link = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${aws_file_key}`;
    // Upload the file to AWS S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: aws_file_key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: "AES256",
      ACL: 'public-read',
    };
    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3.send(uploadCommand);
    // Fetch file metadata from S3 to get the exact file size
    const headParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: aws_file_key,
    };
    const headCommand = new HeadObjectCommand(headParams);
    const metadata = await s3.send(headCommand);
    const fileSizeInBytes = metadata.ContentLength; // Size in bytes
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2); // Convert to KB and keep 2 decimal places
    // Encrypt the AWS file link and voice name
    const encryptedAwsFileLink = encryptvoice(aws_file_link);
    const encryptedVoiceName = encryptvoice(voice_name);
    // Create and save the voice recording metadata in the database
    const newVoiceRecording = new Voice({
      user_id,
      voice_name: encryptedVoiceName.encryptedData, // Store encrypted voice name
      duration: duration || 0, // If no duration is passed, set it to 0
      file_size: fileSizeInKB, // Store the file size in KB
      aws_file_link: encryptedAwsFileLink.encryptedData, // Store encrypted file link
      iv_file_link: encryptedAwsFileLink.iv, // Store IV for the file link
      iv_voice_name: encryptedVoiceName.iv, // Store IV for the voice name
    });
    await newVoiceRecording.save();
     // Fetch user's email from the Users table
     const user = await Userlogin.findById(user_id);
     if (!user) {
       return res.status(404).json({ error: "User not found" });
     }
     const toEmail = user.email;
    // Add activity to the activity history
    const voiceActivity = {
      voiceId: newVoiceRecording._id,
      action: "Voice-Uploaded",
      timestamp: new Date(),
    };
    let activity = await Activity.findOne({ toEmail });
    if (activity) {
      // Append to existing activity
      activity.voiceActivities.push(voiceActivity);
    } else {
      // Create a new activity document
      activity = new Activity({
        toEmail,
        voiceActivities: [voiceActivity],
      });
    }
    await activity.save();
    res.status(201).json({
      message: "Voice recording uploaded successfully",
      voice: {
        user_id,
        voice_name,
        file_size: fileSizeInKB, // Send the file size in KB
        aws_file_link,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading voice recording" });
  }
});


// Retrieve voice data API
router.get("/get-recordings", authenticateToken, async (req, res) => {
  try {
    // Extract user_id from the authenticated token
    const user_id = req.user.user_id;
    // Fetch voice recordings for the authenticated user
    const voiceRecordings = await Voice.find({ user_id: user_id });
    if (!voiceRecordings || voiceRecordings.length === 0) {
      return res.status(404).json({ message: "No voice recordings found." });
    }
    // Decrypt fields like voice name and file link with error handling
    const decryptedRecordings = voiceRecordings.map(recording => {
      try {
        // Decrypt the fields if available
        const voiceName = recording.voice_name ? decryptvoice(recording.voice_name, recording.iv_voice_name) : null;
        const awsFileLink = recording.aws_file_link ? decryptvoice(recording.aws_file_link, recording.iv_file_link) : null;
        return {
          ...recording.toObject(),  // Convert the mongoose document to a plain JavaScript object
          voice_name: voiceName,     // Decrypted voice name
          aws_file_link: awsFileLink, // Decrypted file link
          file_size: recording.file_size, // Display file size in KB
          duration: recording.duration,   // Include duration if needed
        };
      } catch (err) {
        console.error("Error decrypting recording:", err.message);
        return {
          ...recording.toObject(),
          voice_name: "Decryption failed", // If decryption fails, return a fallback value
          aws_file_link: "Decryption failed", // Fallback for file link
        };
      }
    });
    // Return the decrypted voice recordings
    res.status(200).json(decryptedRecordings);
  } catch (error) {
    console.error("Error retrieving voice recordings:", error);
    res.status(500).json({ message: "Error retrieving voice recordings.", error: error.message });
  }
});


router.post("/listen-recording", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;  // Extract user_id from the authenticated token
    const { voice_id } = req.body;  // Get the voice_id from the request body
    if (!voice_id) {
      return res.status(400).json({ message: "voice_id is required in the request body." });
    }
    // Fetch the specific voice recording by voice_id and user_id (to ensure the user is authorized)
    const voiceRecording = await Voice.findOne({ user_id: user_id, _id: voice_id });
    if (!voiceRecording) {
      return res.status(404).json({ message: "Voice recording not found or unauthorized access." });
    }
    // Decrypt the AWS file link
    const awsFileLink = decryptvoice(voiceRecording.aws_file_link, voiceRecording.iv_file_link);
    if (!awsFileLink) {
      return res.status(500).json({ message: "Failed to decrypt audio file link." });
    }
    // Check MIME type of the file and determine appropriate audio format
    const mimeType = voiceRecording.mime_type; // Assuming you store MIME type in DB
    // Send the file link and MIME type for playback
    res.status(200).json({
      voice_name: decryptvoice(voiceRecording.voice_name, voiceRecording.iv_voice_name), // Decrypted voice name
      audio_url: awsFileLink,  // URL of the file for playback
      mime_type: mimeType, // MIME type for proper playback
      file_size: voiceRecording.file_size, // File size in KB
      duration: voiceRecording.duration,   // Duration of the voice recording
    });
  } catch (error) {
    console.error("Error retrieving voice recording:", error);
    res.status(500).json({ message: "Error retrieving voice recording.", error: error.message });
  }
});
// Delete voice memo API
router.delete("/delete-voice", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;  // Extract user_id from the authenticated token
    const { voice_id } = req.body;     // Get the voice_id from the request body
    if (!voice_id) {
      return res.status(400).json({ message: "voice_id is required in the request body." });
    }
    // Fetch the voice recording by voice_id and user_id to ensure it's the right recording
    const voiceRecording = await Voice.findOne({ user_id: user_id, _id: voice_id });
    if (!voiceRecording) {
      return res.status(404).json({ message: "Voice recording not found or unauthorized access." });
    }
    const voicename = decryptvoice(voiceRecording.voice_name, voiceRecording.iv_voice_name);
    // Decrypt the AWS file link to get the file key
    const awsFileLink = decryptvoice(voiceRecording.aws_file_link, voiceRecording.iv_file_link);
    if (!awsFileLink) {
      return res.status(500).json({ message: "Failed to decrypt AWS file link." });
    }
    // Extract the S3 file key from the decrypted link
    const fileKey = awsFileLink.split(".amazonaws.com/")[1];  // Get the file key from the URL
    // Delete the voice file from AWS S3
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);  // Delete the file from S3
    // Delete the voice recording metadata from the database
    await Voice.deleteOne({ _id: voice_id });
     // 🔹 Fetch user email for activity tracking
     const user = await Userlogin.findById(user_id);
     if (!user) {
       console.log("User not found!");
       return res.status(404).json({ error: "User not found" });
     }
     const toEmail = user.email;
    //  console.log("User email:", toEmail);
 
     // 🔹 Check if an activity record already exists for the user
     let activity = await Activity.findOne({ toEmail });
    //  console.log("Existing Activity:", activity);
 
     // 🔹 Create voice deletion activity log
     const voiceActivity = {
       voiceId: voice_id,
       action: `Voice-Deleted: ${voicename}`,
       timestamp: new Date(),
     };
 
     if (activity) {
      //  console.log("Activity found, updating...");
       if (!Array.isArray(activity.voiceActivities)) {
         activity.voiceActivities = []; // Ensure it's an array
       }
       activity.voiceActivities.push(voiceActivity);
       await activity.save();
      //  console.log("Updated Activity:", activity);
     } else {
      //  console.log("No existing activity found. Creating a new one...");
       activity = new Activity({ toEmail, voiceActivities: [voiceActivity] });
       await activity.save();
      //  console.log("New Activity Created:", activity);
     }
 
     // Respond with success message
     res.status(200).json({ message: "Voice memo deleted successfully." });
   } catch (error) {
     console.error("Error deleting voice memo:", error);
     res.status(500).json({ message: "Error deleting voice memo.", error: error.message });
   }
});


// Route to edit the name of a voice memo
router.post("/edit-voice-name", async (req, res) => {
  const { voice_id, new_voice_name, email } = req.body; // Voice memo ID, new name, and email
  // Validate input
  if (!voice_id || !new_voice_name || !email) {
    return res.status(400).json({ error: "Voice memo ID, new voice name, and email are required" });
  }
  try {
    // Find the voice memo by ID
    const voiceMemo = await Voice.findById(voice_id);
    if (!voiceMemo) {
      return res.status(404).json({ error: "Voice memo not found" });
    }
    // Encrypt the new voice name
    const encryptedVoiceName = encryptvoice(new_voice_name);
    // Update the voice name and its IV
    voiceMemo.voice_name = encryptedVoiceName.encryptedData;
    voiceMemo.iv_voice_name = encryptedVoiceName.iv;
    await voiceMemo.save();
    // Log the activity in the Activity schema
    const voiceActivity = {
      voiceId: voice_id,
      action: `Voice memo renamed to "${new_voice_name}"`,
      timestamp: new Date(),
    };
    let activity = await Activity.findOne({ toEmail: email });
    if (activity) {
      // Append to existing activity
      activity.voiceActivities = activity.voiceActivities || [];
      activity.voiceActivities.push(voiceActivity);
    } else {
      // Create a new activity document
      activity = new Activity({
        toEmail: email,
        voiceActivities: [voiceActivity],
      });
    }
    await activity.save();
    res.status(200).json({
      message: "Voice memo name updated successfully",
      updated_voice: {
        id: voiceMemo._id,
        new_voice_name,
      },
    });
  } catch (error) {
    console.error("Error updating voice memo name:", error);
    res.status(500).json({ error: "Error updating voice memo name" });
  }
});


router.post("/download-voice", async (req, res) => {
  const { voice_id, email } = req.body; // Extract voice_id and email from the request body
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!voice_id) {
    return res.status(400).json({ error: "Voice ID is required" });
  }
  try {
    // Find the voice recording metadata in the database by voice_id
    const voiceRecording = await Voice.findOne({ _id: voice_id });
    if (!voiceRecording) {
      return res.status(404).json({ error: "Voice recording not found" });
    }
    // Decrypt the voice name using the decryptvoice function
    const decryptedVoiceName = decryptvoice(voiceRecording.voice_name, voiceRecording.iv_voice_name);
    // Decrypt the AWS file link stored in the database
    const decryptedAwsFileLink = decryptvoice(voiceRecording.aws_file_link, voiceRecording.iv_file_link);
    // Extract the actual file key from the decrypted link (remove the S3 URL part)
    const fileKey = decryptedAwsFileLink.split("amazonaws.com/")[1];
    // Determine the content type and file extension based on the file
    let contentType = "audio/mpeg"; // Default to MP3
    let fileExtension = ".mp3"; // Default to MP3 extension
    if (fileKey.endsWith(".wav")) {
      contentType = "audio/wav"; // Set WAV content type if the file is WAV
      fileExtension = ".wav"; // Set WAV extension
    }
    // Ensure the voice name is safe for use in a file download
    const safeFileName = decryptedVoiceName.replace(/[^a-zA-Z0-9_.-]/g, "_"); // Sanitize the name if necessary
    // Create the S3 download params with 'attachment' to force download
    const downloadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ResponseCacheControl: "no-store", // Optional: Prevents caching of the file
      ResponseContentDisposition: `attachment; filename="${safeFileName}${fileExtension}"`, // Use the decrypted voice name
      ResponseContentType: contentType, // Set the correct content type based on file format
    };
    // Create the GetObjectCommand for the file download
    const command = new GetObjectCommand(downloadParams);
    // Generate the pre-signed URL for the download using the getSignedUrl function
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
    // Log the download action in the Activity schema
    const voiceActivity = {
      voiceId: voice_id,
      action: `Voice memo downloaded as "${decryptedVoiceName}"`,
      timestamp: new Date(),
    };
    let activity = await Activity.findOne({ toEmail: email });
    if (activity) {
      // Append to existing activity
      activity.voiceActivities = activity.voiceActivities || [];
      activity.voiceActivities.push(voiceActivity);
    } else {
      // Create a new activity document
      activity = new Activity({
        toEmail: email,
        voiceActivities: [voiceActivity],
      });
    }
    await activity.save();
    // Send the signed URL as the response
    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    console.error("Error in download-voice route:", error);
    res.status(500).json({ error: "Error generating download URL" });
  }
});



module.exports = router;
