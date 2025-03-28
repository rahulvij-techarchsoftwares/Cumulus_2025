const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Role, SecurityQuestion, Userlogin, UserQuestion, ProfilePicture, Designee } = require("../models/userModel");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require('crypto');
const { generateOTP, sendEmail } = require('../email/emailUtils')
const router = express.Router();
const otpStore = new Map();
const s3 = require("../config/s3Client");
const sessionTracker = require('../services/sessionTracker');
const Subscription = require("../models/userSubscriptions");
const { encryptField, decryptField } = require("../utilities/encryptionUtils");
const { Folder, File } = require("../models/userUpload");
const Admin = require("../models/adminModel");
const Voice = require("../models/uservoiceUpload");
const { encryptvoice, decryptvoice } = require("../utilities/voiceencryptionUtils");
const JWT_SECRET = crypto.randomBytes(64).toString('hex');
const REFRESH_TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
const HeritagePlan = require("../models/heritageModel");

router.post("/create-question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "The 'question' field is required." });
  }

  try {
    const newQuestion = new SecurityQuestion({ question });
    await newQuestion.save();
    res.status(201).json({ message: "Security question created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating security question." });
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '5h' });  // Access token expires in 15 minutes
}

// Helper function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });  // Refresh token expires in 7 days
}

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Generate OTP and set expiration (5 minutes)
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    otpStore.set(email, { otp, expiresAt });
    console.log("Stored OTP for email:", email, otpStore.get(email));

    // Pass an object with 'to', 'subject', and 'body' to sendEmail
    const emailResponse = await sendEmail({
      to: email,
      subject: 'Your OTP Code',
      body: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    if (emailResponse.success) {
      res.status(200).json({
        message: "OTP sent successfully.",
        otp, // For testing only; remove in production
        previewURL: emailResponse.previewURL,
      });
    } else {
      res.status(500).json({ message: "Error sending OTP email.", error: emailResponse.error });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error generating or sending OTP.", error: error.message });
  }
});



router.post("/confirm-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    console.error("Email or OTP missing.");
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    console.log("Looking for OTP for email:", email);
    const storedOtp = otpStore.get(email);
    console.log("Stored OTP details:", storedOtp);

    if (!storedOtp) {
      console.error("OTP not found for email:", email);
      return res.status(400).json({ message: "OTP not found or expired." });
    }

    if (Date.now() > storedOtp.expiresAt) {
      console.error("OTP expired for email:", email);
      otpStore.delete(email); // Remove expired OTP
      return res.status(400).json({ message: "OTP expired." });
    }

    if (storedOtp.otp !== otp) {
      console.error("Invalid OTP for email:", email);
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP is valid, remove it from the store
    otpStore.delete(email);
    console.log("OTP verified successfully for email:", email);

    // Further actions (e.g., account verification, password reset, etc.)
    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error confirming OTP:", error);
    res.status(500).json({ message: "Error confirming OTP.", error: error.message });
  }
});


// Example backend route for checking phone number
router.post('/check-phone', async (req, res) => {
  const { phoneNumber } = req.body;
  try {
      // Query to check if the phone number exists in the collection
      const existingUser = await Userlogin.findOne({ phoneNumber });

      if (existingUser) {
          return res.status(200).json({ message: "Phone number already registered." });
      } else {
          return res.status(200).json({ message: "Phone number is available." });
      }
  } catch (error) {
      console.error("Error checking phone number:", error);
      res.status(500).json({ message: "Error checking phone number.", error: error.message });
  }
});

router.post('/token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Generate new access token
      const accessToken = generateAccessToken({ username: decoded.username });

      res.json({ accessToken });
  });
});


  // POST API to add a role
router.post("/add-roles", async (req, res) => {
  try {
    const { roleName } = req.body;

   
    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    
    const role = new Role({ roleName });
    await role.save();

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Error creating role", error: error.message });
  }
});

router.get("/security-questions", async (req, res) => {
  try {
    // Fetch all security questions
    const questions = await SecurityQuestion.find();

    // Check if questions are found
    if (questions.length === 0) {
      return res.status(404).json({ message: "No security questions found." });
    }

    // Send response with questions
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching security questions:", error);
    res.status(500).json({ message: "Error fetching security questions", error: error.message });
  }
});


  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) return res.status(401).json({ message: 'Token not provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = decoded; 
        next(); 
    });
}

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await Userlogin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Fetch the default 'User' role from the Role collection
    const defaultRole = await Role.findOne({ roleName: "User" });
    if (!defaultRole) {
      return res.status(400).json({ message: "Default 'User' role not found" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new Userlogin({
      username,
      email,
      password: hashedPassword,
      roles: [
        {
          role_id: defaultRole._id,
          roleName: defaultRole.roleName,
        },
      ],
    });

    // Save the new user
    await newUser.save();

    // Generate the access token
    const accessToken = jwt.sign({ user_id: newUser._id }, JWT_SECRET, { expiresIn: "5h" });

    // Generate the refresh token
    const refreshToken = jwt.sign({ user_id: newUser._id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });


    await sendEmail({
      to: email,
      subject: "🎉 Welcome to Cumulus – Secure Your Legacy Today!",
      body: `
        <p>Hi ${username},</p>
        <p>Welcome to <strong>Cumulus</strong>!<br>
        We’re excited to have you on board. With Cumulus, you can securely store, manage, and transfer important documents with ease.</p>

        <h3>✅ What’s next?</h3>
        <ul>
          <li>🔹 Upload your important documents</li>
          <li>🔹 Assign designees for future access</li>
          <li>🔹 Explore security features for safe storage</li>
        </ul>

        <p>📖 Need help? Reach out to us at <a href="mailto:support@cumulus.com">support@cumulus.com</a></p>
        <p>If you have any questions, reply to this email—we’re here for you!</p>

        <p>Best,<br>
        <strong>The Cumulus Team</strong></p>
      `,
    });

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      user: {
        user_id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles.map((role) => ({
          role_id: role.role_id,
          roleName: role.roleName,
        })),
        phoneNumber: newUser.phoneNumber || null, 
        googleDrive: newUser.googleDrive || null,  
        dropbox: newUser.dropbox || null
      },
    });    
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Error during signup", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {

    if (!password) {
      let user = await Admin.findOne({ email }) || await Userlogin.findOne({ email }).populate("roles.role_id");
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }
      return res.status(200).json({
          message: "User found",
          user: {
              user_id: user._id,
              username: user.username,
              email: user.email,
              roles: user.roles ? user.roles.map((role) => ({
                  role_id: role.role_id?._id || "admin",
                  roleName: role.role_id?.roleName || "Admin",
              })) : [{ role_id: "admin", roleName: "Admin" }],
              phoneNumber: user.phoneNumber,
          }
      });
  }
      // Check in Admin collection first
      let user = await Admin.findOne({ email });
      let role = "admin";
      let questionExists = false;
      if (!user) {
          user = await Userlogin.findOne({ email }).populate("roles.role_id");
          role = "user";
      }
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(password || "", user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: "Invalid password" });
      }
      if (role === "user") {
          questionExists = await UserQuestion.exists({ user_id: user._id });
      }
      // Generate the access token
      const accessToken = jwt.sign({ user_id: user._id }, JWT_SECRET, { expiresIn: "5h" });
      // Generate the refresh token
      const refreshToken = jwt.sign({ user_id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
      // Send the refresh token as an HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      let membershipsWithHeritage = [];
      if (role === "user" && user.memberships) {
          membershipsWithHeritage = await Promise.all(
              user.memberships.map(async (membership) => {
                  const heritageDetails = await HeritagePlan.findOne({ membership_id: membership._id });
                  return {
                      ...membership.toObject(),
                      heritageDetails: heritageDetails || null, 
                  };
              })
          );
      }

      res.status(200).json({
          message: "Login successful.",
          accessToken,
          user: {
              user_id: user._id,
              username: user.username,
              email: user.email,
              roles: role === "admin" ? [{ role_id: "admin", roleName: "Admin" }] : user.roles.map((role) => ({
                  role_id: role.role_id._id,
                  roleName: role.role_id.roleName,
              })),
              questions: role === "user" ? !!questionExists : undefined,
              phoneNumber: user.phoneNumber,
          },
          memberships: role === "user" ? membershipsWithHeritage : undefined,
          activeMembership: role === "user" ? user.activeMembership : undefined,
          googleDrive: role === "user" ? user.googleDrive : undefined,
          dropbox: role === "user" ? user.dropbox : undefined,
      });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error during login", error: error.message });
  }
});





router.post("/set-questions", async (req, res) => {
  const { userId, securityAnswers } = req.body;

  try {
    // Find the user by userId
    const user = await Userlogin.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate and save security answers
    const validAnswers = [];
    for (const answer of securityAnswers) {
      const question = await SecurityQuestion.findById(answer.question_id);
      if (!question) {
        return res.status(400).json({ message: `Invalid question ID: ${answer.question_id}` });
      }
      validAnswers.push({ question_id: question._id, answer: answer.answer });
    }

    if (validAnswers.length > 0) {
      // Save UserQuestion data
      await UserQuestion.create({
        user_id: user._id,
        questions: validAnswers,
      });

      // Update user's `questions` field
      user.questions = true;
      await user.save();

      res.status(200).json({ message: "Security questions answered successfully" });
    } else {
      res.status(400).json({ message: "No valid answers provided" });
    }
  } catch (error) {
    console.error("Error during setting questions:", error);
    res.status(500).json({ message: "Error during setting questions", error: error.message });
  }
});

router.post("/update-phone", async (req, res) => {
  const { email, phoneNumber } = req.body;
  console.log("Received request payload:", req.body); // For debugging

  try {
    // Check if the phone number already exists
    const existingUserWithPhone = await Userlogin.findOne({ phoneNumber });
    if (existingUserWithPhone) {
      console.log("Phone number already registered:", phoneNumber); // Debugging
      return res.status(400).json({ message: "This phone number is already registered." });
    }

    // Find the user by email
    const user = await Userlogin.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email); // Debugging
      return res.status(404).json({ message: "User not found with this email." });
    }

    // Update the phone number
    user.phoneNumber = phoneNumber;
    await user.save();

    console.log("Phone number updated for user:", email); // Debugging
    res.status(200).json({ message: "Phone number updated successfully." });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).json({ message: "Error updating phone number.", error: error.message });
  }
});

router.post("/add-membership", async (req, res) => {
  try {
    const { email, subscriptionId, active } = req.body;

    if (!email || !subscriptionId) {
      return res.status(400).json({ message: "Email and subscriptionId are required." });
    }

    const user = await Userlogin.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    // Check if the user already has the membership
    const membershipIndex = user.memberships.findIndex(membership => membership.subscription_id.toString() === subscriptionId);

    if (membershipIndex > -1) {
      // Update the existing membership
      user.memberships[membershipIndex].active = active;
    } else {
      // Add new membership
      user.memberships.push({
        subscription_id: subscription._id,
        subscription_name: subscription.subscription_name,
        cost: subscription.cost,
        features: subscription.features,
        active: active,
      });
    }

    // Save the user with updated membership
    await user.save();

    return res.status(200).json({ message: "Membership added/updated successfully.", user });
  } catch (error) {
    console.error("Error adding/updating membership:", error);
    return res.status(500).json({ message: "Error adding/updating membership.", error: error.message });
  }
});







// POST Route for Updating Password
router.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("Phone number already registered:", newPassword,email); // Debugging
  try {
    
    const user = await Userlogin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();


    const body = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${user.username},</h2>
      <h2 style="color: #007bff;">🔒 Your Password Has Been Reset</h2>
      <p>Your password has been successfully reset. If you made this change, you can safely ignore this email.</p>
      <p>However, if you didn’t request this, please <strong>reset your password</strong> immediately or contact our support team.</p>
      <p>For added security, always keep your password confidential.</p>
      <p>Need help? Reach out to our support team at <a href="mailto:support@cumulus.com">support@cumulus.com</a></p>
      <br/>
      <p>Stay secure,</p>
      <p><strong>The Cumulus Team</strong></p>
    </div>
  `;

  const emailResponse = await sendEmail({
    to: email,
    subject: "🔒 Password Reset Confirmation - Cumulus",
    body,
  });

  if (!emailResponse.success) {
    console.error("Error sending confirmation email:", emailResponse.error);
  }
  
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
});
router.get("/get-all-users", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let search=req.query.q;
    console.log(search);
    const user = await Userlogin.find({username: { $regex: new RegExp(search, 'i') }}); // Use user ID to find the user
    const designee = await Designee.find({name: { $regex: new RegExp(search, 'i') }});
    for(var i=0; i<designee.length; i++){
      user.push({username: designee[i].name, _id: designee[i].email});
    }
    if (user) {
      return res.json({ user });
    } else {
      return res.json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data.", error: error.message });
  }
});
router.get("/get-user", authenticateToken, async (req, res) => {
  try {
    let user_id = req.query.id || req.user?.user_id; 
    if (!user_id) {
      return res.status(400).json({ message: "User ID or token is required." });
    }
    const user = await Userlogin.findById(user_id)
    .populate("memberships.subscription_id") // Populate subscription details
    .exec();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const memberships = user.memberships || [];
    if (memberships.length === 0) {
      return res.status(200).json({ user, memberships: [] }); // No memberships, return empty array
    }
    // Fetch all matching heritage details
    const heritageDetails = await HeritagePlan.find({
      membership_id: { $in: memberships.map(m => m._id) }, // Extract membership _id
    });
    const updatedMemberships = memberships.map(membership => {
      const matchingHeritage = heritageDetails.filter(h => h.membership_id.toString() === membership._id.toString());
      return {
        ...membership.toObject(),
        subscription_id: {
          ...membership.subscription_id.toObject(), // Ensure subscription_id is a plain object
          heritageDetails: matchingHeritage.length > 0 ? matchingHeritage : undefined, // Attach if exists
        },
      };
    });
    return res.status(200).json({ user, memberships: updatedMemberships });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data.", error: error.message });
  }
});



router.post("/signout", (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure in production
      sameSite: "strict", // CSRF protection
    });

    res.status(200).json({ message: "Successfully signed out." });
  } catch (error) {
    console.error("Error during signout:", error);
    res.status(500).json({ message: "Error signing out.", error: error.message });
  }
});


router.post("/update-user-details", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user; // Extracted from the token by the middleware
    const { username, email, phoneNumber } = req.body;

    // Validate input
    if (!username && !email && !phoneNumber) {
      return res.status(400).json({ message: "Please provide at least one field to update." });
    }

    // Build the update object dynamically
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    // Update user in the database
    const updatedUser = await Userlogin.findByIdAndUpdate(
      user_id,
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated document and validate fields
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use." });
    }
    res.status(500).json({ message: "Internal server error." });
  }
});


router.get("/get-personaluser-details", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user; // Extracted from the token by the middleware

    // Fetch user details
    const user = await Userlogin.findById(user_id, "username email phoneNumber roles");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User details retrieved successfully.",
      user: {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Ensure the 'uploads' directory exists
const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true }); // Create the 'uploads' directory if it doesn't exist
}

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Store images in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with a unique name
  },
});

const upload = multer({ storage: storage });

router.post(
  "/upload-profile-picture",
  authenticateToken,
  upload.single("profilePicture"), // This should handle the file upload
  async (req, res) => {
    const file = req.file;
    console.log("File object received:", file); // Debugging log

    const user_id = req.user ? req.user.user_id : null;

    if (!user_id) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    if (!file) {
      return res.status(400).json({ error: "Profile picture file is required" });
    }

    try {

      if (file && file.path) {
        console.log(`File size: ${file.size} bytes`);
        console.log(`File MIME type: ${file.mimetype}`);
      } else {
        return res.status(400).json({ error: "File path is missing or invalid" });
      }

     
      const existingProfilePicture = await ProfilePicture.findOne({ user_id });


      if (existingProfilePicture) {
        const oldFileName = decryptField(existingProfilePicture.profilePicture, existingProfilePicture.iv).split('/').pop();
        const oldAwsFileKey = `${user_id}/profilepicture/${oldFileName}`;


        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldAwsFileKey,
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
      }

      // Sanitize the file name (replace any special characters to avoid issues with S3)
      const fileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const aws_file_key = `${user_id}/profilepicture/${fileName}`;
      const aws_file_link = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${aws_file_key}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: aws_file_key,
        Body: fs.createReadStream(file.path), // Use the local file path to upload to S3
        ContentType: file.mimetype,  // Ensure the correct MIME type is used
        ServerSideEncryption: "AES256",
        ACL: "public-read",
      };

      // Upload the new file to S3
      const command = new PutObjectCommand(params);
      await s3.send(command);

      // Encrypt the AWS file link
      const encryptedFileLink = encryptField(aws_file_link);

      // Update or create the profile picture entry in MongoDB
      const profilePicture = await ProfilePicture.findOneAndUpdate(
        { user_id },
        {
          profilePicture: encryptedFileLink.encryptedData,
          iv: encryptedFileLink.iv,
        },
        { upsert: true, new: true }
      );

      res.status(201).json({
        message: "Profile picture updated successfully",
        profilePicture: {
          user_id,
          file_name: fileName,
          aws_file_link,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error uploading profile picture" });
    }
  }
);
router.get("/get-profile-picture", authenticateToken, async (req, res) => {
  const user_id = req.user ? req.user.user_id : null;

  if (!user_id) {
    return res.status(401).json({ error: "User ID not found in token" });
  }

  try {

    const profilePictureDoc = await ProfilePicture.findOne({ user_id });

    if (!profilePictureDoc) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    const decryptedLink = decryptField(profilePictureDoc.profilePicture, profilePictureDoc.iv);
    
    
    res.status(200).json({
      message: "Profile picture retrieved successfully",
      profilePicture: decryptedLink, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving profile picture" });
  }
});

// API to get details of all users
router.get("/user-details", async (req, res) => {
  try {

    const users = await Userlogin.find()
      .populate("roles.role_id", "roleName") // Populate roles with roleName
      .populate("memberships.subscription_id", "subscriptionName"); // Populate memberships with subscription details

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }


    const userDetails = users.map(user => ({
      user_id: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roles: user.roles.map(role => ({
        role_id: role.role_id ? role.role_id._id : null,
        roleName: role.roleName,
      })),
      questions: user.questions,
      memberships: user.memberships.map(membership => ({
        subscription_id: membership.subscription_id ? membership.subscription_id._id : null,
        subscriptionName: membership.subscription_id ? membership.subscription_id.subscriptionName : null,
        buyingDate: membership.buyingDate,
        planTime: membership.planTime,
        expiryDate: membership.expiryDate,
      })),
      activeMembership: user.activeMembership,
      deathDate: user.deathDate,
    }));


    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "An error occurred while fetching user details.", error: error.message });
  }
});




// router.get("/get-user-folders-and-files", authenticateToken, async (req, res) => {
//   try {
//     const user_id = req.user.user_id; 


//     const folders = await Folder.find({ user_id }).lean();

//     if (!folders || folders.length === 0) {
//       return res.status(404).json({ message: "No folders found for the user." });
//     }


//     const foldersWithFiles = await Promise.all(
//       folders.map(async (folder) => {
//         const files = await File.find({ folder_id: folder._id, user_id }).lean();


//         const decryptedFolder = {
//           folder_id: folder._id,
//           folder_name: decryptField(folder.folder_name, folder.iv_folder_name),
//           aws_folder_link: decryptField(folder.aws_folder_link, folder.iv_folder_link),
//           created_at: folder.created_at,
//         };

//         const decryptedFiles = files.map((file) => ({
//           file_id: file._id,
//           file_name: decryptField(file.file_name, file.iv_file_name),
//           aws_file_link: decryptField(file.aws_file_link, file.iv_file_link),
//           date_of_upload: file.date_of_upload,
//           tags: file.tags,
//           sharing_contacts: file.sharing_contacts,
//         }));

//         return {
//           ...decryptedFolder,
//           files: decryptedFiles,
//         };
//       })
//     );

//     res.status(200).json({ folders: foldersWithFiles });
//   } catch (error) {
//     console.error("Error retrieving folders and files:", error);
//     res.status(500).json({ message: "Error retrieving folders and files.", error: error.message });
//   }
// });


router.get("/get-user-folders-and-files", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Fetch folders associated with the user
    const folders = await Folder.find({ user_id }).lean();

    if (!folders || folders.length === 0) {
      return res.status(404).json({ message: "No folders found for the user." });
    }

    // Process folders and their files
    const foldersWithFiles = await Promise.all(
      folders.map(async (folder) => {
        const files = await File.find({ folder_id: folder._id, user_id }).lean();

        const decryptedFolder = {
          folder_id: folder._id,
          folder_name: decryptField(folder.folder_name, folder.iv_folder_name),
          aws_folder_link: decryptField(folder.aws_folder_link, folder.iv_folder_link),
          created_at: folder.created_at,
        };

        const decryptedFiles = files.map((file) => ({
          file_id: file._id,
          file_name: decryptField(file.file_name, file.iv_file_name),
          aws_file_link: decryptField(file.aws_file_link, file.iv_file_link),
          date_of_upload: file.date_of_upload,
          tags: file.tags,
          sharing_contacts: file.sharing_contacts,
        }));

        return {
          ...decryptedFolder,
          files: decryptedFiles,
        };
      })
    );

    // Fetch and decrypt voice memos associated with the user
    const voiceRecordings = await Voice.find({ user_id: user_id });

    const decryptedVoiceMemos = voiceRecordings.map((recording) => {
      try {
        return {
          voice_id: recording._id,
          voice_name: decryptvoice(recording.voice_name, recording.iv_voice_name),
          duration: recording.duration,
          file_size: recording.file_size,
          aws_file_link: decryptvoice(recording.aws_file_link, recording.iv_file_link),
          date_of_upload: recording.date_of_upload,
        };
      } catch (err) {
        console.error("Error decrypting voice memo:", err.message);
        return {
          voice_id: recording._id,
          voice_name: "Decryption failed",
          aws_file_link: "Decryption failed",
        };
      }
    });

    res.status(200).json({
      folders: foldersWithFiles,
      voice_memos: decryptedVoiceMemos,
    });
  } catch (error) {
    console.error("Error retrieving folders, files, and voice memos:", error);
    res.status(500).json({
      message: "Error retrieving folders, files, and voice memos.",
      error: error.message,
    });
  }
});




router.post("/update-cloud-connections", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id; 
    const { googleDriveConnected, googleDriveToken, dropboxConnected, dropboxToken } = req.body;

    if (googleDriveConnected === undefined && dropboxConnected === undefined) {
      return res.status(400).json({ message: "Provide at least one connection update." });
    }

    const updateFields = {};

    if (googleDriveConnected !== undefined) {
      if (googleDriveConnected) {
        if (!googleDriveToken) {
          return res.status(400).json({ message: "Google Drive access token is required when connecting." });
        }
        updateFields.googleDrive = [{ accessToken: googleDriveToken, connected: true }];
      } else {
        updateFields.googleDrive = [{ accessToken: "", connected: false }];
      }
    }

    if (dropboxConnected !== undefined) {
      if (dropboxConnected) {
        if (!dropboxToken) {
          return res.status(400).json({ message: "Dropbox access token is required when connecting." });
        }
        updateFields.dropbox = [{ accessToken: dropboxToken, connected: true }];
      } else {
        updateFields.dropbox = [{ accessToken: "", connected: false }];
      }
    }

    const updatedUser = await Userlogin.findByIdAndUpdate(user_id, updateFields, { new: true });

    res.status(200).json({
      message: "Cloud connection updated successfully",
      user: {
        googleDrive: updatedUser.googleDrive,
        dropbox: updatedUser.dropbox,
      },
    });
  } catch (error) {
    console.error("Error updating cloud connection:", error);
    res.status(500).json({ message: "Error updating cloud connection.", error: error.message });
  }
});

router.get("/get-all-users-data",  async (req, res) => {
  try {
    // const user_id = req.user.user_id;
    
    const user = await Userlogin.find({})
    .populate("memberships.subscription_id") // Populate subscription details
    .exec();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const memberships = user.memberships || [];
    if (memberships.length === 0) {
      return res.status(200).json({ user, memberships: [] }); // No memberships, return empty array
    }
    // Fetch all matching heritage details

    const updatedMemberships = memberships.map(membership => {
      return {
        ...membership.toObject(),
        subscription_id: {
          ...membership.subscription_id.toObject(), // Ensure subscription_id is a plain object
        },
      };
    });
    return res.status(200).json({ user, memberships: updatedMemberships });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data.", error: error.message });
  }
});

module.exports = { router, authenticateToken };
