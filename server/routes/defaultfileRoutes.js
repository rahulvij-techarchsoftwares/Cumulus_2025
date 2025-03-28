const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');
const { encryptField, decryptField } = require("../utilities/encryptionUtils"); 
const DefaultFile = require("../models/defaultfileModel"); 
const mime = require('mime-types');  // This imports the mime module
const { DeleteObjectCommand, CopyObjectCommand ,HeadObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const s3 = new S3({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
// Setup Multer to handle file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });
// Route to upload a file to AWS S3 and store details in MongoDB
router.post("/default-file-upload", upload.single("file"), async (req, res) => {
    try {
      const { file_name } = req.body; // Only file_name is provided
  
      // Validate input
      if (!req.file || !file_name) {
        return res.status(400).json({ message: "File and file_name are required" });
      }
  
      // Set the folder path
      const userFolder = "defaultfolder"; // Default folder name
  
      // Generate AWS S3 file path using timestamp for uniqueness
      const s3FileName = `${Date.now()}_${file_name}`;
      const awsFileKey = `${userFolder}/${s3FileName}`;
      const awsFileLink = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${awsFileKey}`;
  
      // Encrypt the file link and name
      const encryptedFileLink = encryptField(awsFileLink);
      const encryptedFileName = encryptField(file_name);
  
      // Prepare the parameters for uploading the file to S3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: awsFileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ServerSideEncryption: "AES256",
        ACL: "public-read", // Adjust ACL as needed (public-read for public access)
      };
  
      // Upload the file to AWS S3 using PutObjectCommand
      await s3.send(new PutObjectCommand(params));
  
      // Store the file details in MongoDB using the defaultFileSchema
      const newFile = new DefaultFile({
        file_name: encryptedFileName.encryptedData,
        iv_file_name: encryptedFileName.iv,
        aws_file_link: encryptedFileLink.encryptedData, // Encrypted S3 URL
        iv_file_link: encryptedFileLink.iv,
        date_of_upload: Date.now(),
      });
  
      await newFile.save();
  
      res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: newFile._id,
          name: file_name,
          link: awsFileLink,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file", error: error.message });
    }
  });
  router.get("/default-files", async (req, res) => {
    try {
      // Fetch all files from the DefaultFile collection
      const files = await DefaultFile.find();
  
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "No files found." });
      }
  
      // Decrypt the file name and AWS file link for each file
      const decryptedFiles = files.map((file) => {
        const decryptedFileName = decryptField(file.file_name, file.iv_file_name);
        const decryptedFileLink = decryptField(file.aws_file_link, file.iv_file_link);
  
        return {
          _id: file._id,
          file_name: decryptedFileName,
          aws_file_link: decryptedFileLink,
          date_of_upload: file.date_of_upload,
        };
      });
  
      // Return the decrypted files
      res.status(200).json({
        message: "Files retrieved successfully",
        files: decryptedFiles,
      });
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Error fetching files", error: error.message });
    }
  });
  // Route to get file details (name, URL, and MIME type)
  router.get("/view-file/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
  
      // Fetch the file record from the DefaultFile collection using fileId
      const file = await DefaultFile.findById(fileId);
  
      if (!file) {
        return res.status(404).json({ message: "File not found." });
      }
  
      // Decrypt the file name and AWS file link
      const decryptedFileName = decryptField(file.file_name, file.iv_file_name);
      const decryptedFileLink = decryptField(file.aws_file_link, file.iv_file_link);
  
      // Get the MIME type based on the file extension
      const mimeType = mime.lookup(decryptedFileName) || 'application/octet-stream';
  
      // Construct the response
      const fileInfo = {
        _id: file._id,
        file_name: decryptedFileName,
        aws_file_link: decryptedFileLink,
        mime_type: mimeType,
        date_of_upload: file.date_of_upload,
      };
  
      // Optionally, you can fetch the file content from AWS if needed
      // const fileContent = await axios.get(decryptedFileLink, { responseType: 'arraybuffer' });
  
      res.status(200).json({
        message: "File retrieved successfully",
        file: fileInfo,
      });
    } catch (error) {
      console.error("Error retrieving file:", error);
      res.status(500).json({ message: "Error retrieving file", error: error.message });
    }
  });

  router.delete("/delete-default-file/:fileId", async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID." });
        }
        
        const file = await DefaultFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }
        
        const decryptedFileLink = decryptField(file.aws_file_link, file.iv_file_link);
        if (!decryptedFileLink.includes("amazonaws.com/")) {
            return res.status(500).json({ message: "Invalid AWS file link." });
        }
        
        const awsFileKey = decryptedFileLink.split("amazonaws.com/")[1];
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: awsFileKey }));
        
        await DefaultFile.findByIdAndDelete(fileId);
        return res.status(200).json({ message: "File deleted successfully." });
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ message: "Error deleting file", error: error.message });
    }
});

// RENAME FILE IN S3 AND MONGODB
router.put("/rename-default-file/:fileId", async (req, res) => {
  try {
      const { fileId } = req.params;
      const { new_file_name } = req.body;

      if (!mongoose.Types.ObjectId.isValid(fileId)) {
          return res.status(400).json({ message: "Invalid file ID." });
      }
      if (!new_file_name) {
          return res.status(400).json({ message: "New file name is required." });
      }

      // Fetch file from DB
      const file = await DefaultFile.findById(fileId);
      if (!file) {
          return res.status(404).json({ message: "File not found." });
      }

      // Decrypt AWS file link
      const decryptedFileLink = decryptField(file.aws_file_link, file.iv_file_link);
      if (!decryptedFileLink.includes(".amazonaws.com/")) {
          return res.status(500).json({ message: "Invalid AWS file link." });
      }

      // Extract S3 file key from the decrypted URL
      const awsFileKey = decryptedFileLink.split(".amazonaws.com/")[1]; // Extract key after AWS domain
      if (!awsFileKey || awsFileKey.trim() === "") {
          return res.status(500).json({ message: "Invalid AWS file key extraction." });
      }

      console.log("Extracted awsFileKey:", awsFileKey); // Debugging log

      // Generate the new S3 key with the updated file name
      const newAwsFileKey = awsFileKey.replace(/[^/]+$/, new_file_name);

      // Check if the file exists in S3 before renaming
      try {
          await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: awsFileKey }));
      } catch (error) {
          if (error.name === "NotFound") {
              return res.status(404).json({ message: "File not found in S3." });
          }
          throw error; // Let other errors propagate
      }

      // Copy the file to the new key
      await s3.send(new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${awsFileKey}`,
          Key: newAwsFileKey,
          ACL: "public-read"
      }));

      // Delete the old file
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: awsFileKey }));

      // Generate new encrypted file link
      const newFileLink = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newAwsFileKey}`;
      const encryptedNewFileName = encryptField(new_file_name);
      const encryptedNewFileLink = encryptField(newFileLink);

      // Update DB with new file name and link
      file.file_name = encryptedNewFileName.encryptedData;
      file.iv_file_name = encryptedNewFileName.iv;
      file.aws_file_link = encryptedNewFileLink.encryptedData;
      file.iv_file_link = encryptedNewFileLink.iv;

      await file.save();

      return res.status(200).json({ message: "File renamed successfully", new_name: new_file_name });
  } catch (error) {
      console.error("Error renaming file:", error);
      return res.status(500).json({ message: "Error renaming file", error: error.message });
  }
});





  
module.exports = router;
