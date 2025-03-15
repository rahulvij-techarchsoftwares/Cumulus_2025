const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {  Userlogin ,Designee  } = require("../models/userModel");
const Nominee = require("../models/nomineeModel");
const Subscription = require("../models/userSubscriptions");
const HeritagePlan = require("../models/heritageModel");
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Client");
router.post("/update-death-date", async (req, res) => {
  const { email, deathDate } = req.body;

  try {
    // Validate input fields
    if (!email || !deathDate) {
      return res.status(400).json({ message: "Email and death date are required." });
    }


    const parsedDate = new Date(deathDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid death date format." });
    }

    // Find user by email
    const user = await Userlogin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with the provided email not found." });
    }

    // Update deathDate
    user.deathDate = parsedDate;
    await user.save();

    res.status(200).json({
      message: "Death date updated successfully.",
      user: { email: user.email, deathDate: user.deathDate }, // R
    });
  } catch (error) {
    console.error("Error updating death date:", error);
    res.status(500).json({ message: "An error occurred while updating the death date." });
  }
});

router.get("/storage-usage", async (req, res) => {
    try {
      let totalSize = 0;
      let continuationToken = null;
      const bucketName = process.env.AWS_BUCKET_NAME;
      do {
        const params = { Bucket: bucketName, ContinuationToken: continuationToken };
        const command = new ListObjectsV2Command(params);
        const response = await s3.send(command);
        if (response.Contents) {
          totalSize += response.Contents.reduce((sum, obj) => sum + obj.Size, 0);
        }
        continuationToken = response.NextContinuationToken;
      } while (continuationToken);
      // Convert size dynamically
      let formattedSize;
      let unit;
      if (totalSize >= 999 * 1024 * 1024) {
        formattedSize = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
        unit = "GB";
      } else if (totalSize >= 1 * 1024 * 1024) {
        formattedSize = (totalSize / (1024 * 1024)).toFixed(2);
        unit = "MB";
      } else {
        formattedSize = (totalSize / 1024).toFixed(2);
        unit = "KB";
      }
      res.json({ totalStorageUsed: formattedSize, unit: unit });
    } catch (error) {
      console.error("Error fetching storage usage:", error);
      res.status(500).json({ message: "Error fetching storage usage.", error: error.message });
    }
  });


  router.post("/add-membership-details", async (req, res) => {
    console.log("Membership update API called.");
    try {

      const user_id = req.user ? req.user.user_id : null;
      if (!user_id) {
        return res.status(401).json({ error: "Unauthorized: User ID not found in token." });
      }
      const { subscription_id, planTime } = req.body;
      if (!subscription_id || !planTime) {
        return res.status(400).json({ error: "Missing required fields: subscription_id or planTime." });
      }
      // Find the user by ID
      const user = await Userlogin.findById(user_id).populate("memberships.subscription_id");
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      // Ensure memberships array exists
      if (!user.memberships) {
        user.memberships = [];
      }
      // Automatically set the buying date as the current date
      const buyingDate = new Date();
      // Add the membership details to the user's memberships array
      user.memberships.push({
        subscription_id,
        buyingDate,
        planTime,
      });
      await user.save();
      await user.populate("memberships.subscription_id");
      res.status(200).json({
        message: "Membership details added successfully",
        memberships: user.memberships,
      });
    } catch (error) {
      console.error("Error adding membership details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get('/get-folder-size', async (req, res) => {
    let userId = req.query.id || req.user?.user_id; 
    const folderName = `${userId}/`; 
    let totalSize = 0;
    let isTruncated = true;
    let continuationToken = null;
  
    try {
  
      while (isTruncated) {
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Prefix: folderName, 
          ContinuationToken: continuationToken, 
        };
  
        const command = new ListObjectsV2Command(params);
        const data = await s3.send(command);
        data.Contents.forEach((object) => {
          totalSize += object.Size;
        });
  
  
        isTruncated = data.IsTruncated;
        continuationToken = data.NextContinuationToken;
        
      }
      const totalSizeKB = totalSize / 1024;
      res.json({ totalSizeKB });
    } catch (error) {
      console.error('Error fetching folder size:', error);
      res.status(500).json({ error: 'Failed to retrieve folder size' });
    }
  });

  router.post("/admin/signup", async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;
    
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin email already in use" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
        });
        await newAdmin.save();
        const accessToken = jwt.sign({ admin_id: newAdmin._id }, JWT_SECRET, { expiresIn: "5h" });
        res.status(201).json({
            message: "Admin created successfully",
            accessToken,
            admin: {
                admin_id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                phoneNumber: newAdmin.phoneNumber,
                createdDate: newAdmin.createdDate,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Error during admin signup:", error);
        res.status(500).json({ message: "Error during admin signup", error: error.message });
    }
});

  router.get("/get-user-data", async (req, res) => {
    try {
        let user_id = req.query.id || req.user?.user_id;
        if (!user_id) {
            return res.status(400).json({ message: "User ID or token is required." });
        }
        const user = await Userlogin.findById(user_id).populate("memberships.subscription_id");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const nominees = await Nominee.find({ from_user_id: user_id });

        const to_email_ids = [...new Set(nominees.map(nominee => nominee.to_email_id))];
        const designees = await Designee.find({ email: { $in: to_email_ids } });

        return res.status(200).json({ 
            user, 
            designees 
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Error fetching user data.", error: error.message });
    }
});


  router.post("/admin-add-membership", async (req, res) => { 
    console.log("Membership update API called.");
    try {
      // Extract user details from request body
      const { email, subscription_id, planTime, expiryDate } = req.body;
      
      if (!email || !subscription_id || !planTime) {
        return res.status(400).json({ error: "Missing required fields: email, subscription_id, or planTime." });
      }

      // Find the user by email
      const user = await Userlogin.findOne({ email }).populate("memberships.subscription_id");
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      // Ensure memberships array exists
      if (!user.memberships) {
        user.memberships = [];
      }

      // Automatically set the buying date as the current date
      const buyingDate = new Date();
      let calculatedExpiryDate = null;

      // Only set expiry date if the plan is custom
      if (planTime === "custom") {
        if (!expiryDate) {
          return res.status(400).json({ error: "Expiry date is required for custom plans." });
        }
        calculatedExpiryDate = new Date(expiryDate);
        if (isNaN(calculatedExpiryDate)) {
          return res.status(400).json({ error: "Invalid expiry date format." });
        }
      }

      // Add the membership details to the user's memberships array
      user.memberships.push({
        subscription_id,
        buyingDate,
        planTime,
        expiryDate: calculatedExpiryDate, // Only assigned if planTime is "custom"
      });

      await user.save();
      await user.populate("memberships.subscription_id");

      res.status(200).json({
        message: "Membership details added successfully",
        memberships: user.memberships,
      });
    } catch (error) {
      console.error("Error adding membership details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});


  router.get("/get-subscriptions", async (req, res) => {
    try {
      const subscriptions = await Subscription.find();
      res.status(200).json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Error fetching subscriptions.", error: error.message });
    }
  });

 
  router.post("/add-custom-subscription", async (req, res) => {
    try {
      const { user_id, storage, googledrive_dropbox, membership_id, voice_memo } = req.body;
  
      if (!user_id || !storage || !membership_id) {
        return res.status(400).json({ error: "user_id, membership_id, and storage are required" });
      }
  
      const existingSubscription = await HeritagePlan.findOne({ user_id, membership_id });
  
      if (existingSubscription) {
        existingSubscription.storage = storage;
        existingSubscription.googledrive_dropbox = googledrive_dropbox ?? existingSubscription.googledrive_dropbox;
        existingSubscription.voice_memo = voice_memo ?? existingSubscription.voice_memo;
  
        await existingSubscription.save();
  
        return res.status(200).json({ message: "Subscription updated successfully", data: existingSubscription });
      }
  
      const newSubscription = new HeritagePlan({
        user_id,
        storage,
        googledrive_dropbox: googledrive_dropbox ?? false,
        voice_memo: voice_memo ?? false,
        membership_id,
      });
  
      await newSubscription.save();
  
      res.status(201).json({ message: "Subscription added successfully", data: newSubscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

  router.post("/get-custom-subscription-features", async (req, res) => {
    try {
      const { user_id, membership_id } = req.body;
  
      if (!user_id || !membership_id) {
        return res.status(400).json({ error: "user_id and membership_id are required" });
      }
  
      const subscription = await HeritagePlan.findOne({ user_id, membership_id });
  
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
  
      res.status(200).json({ data: subscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
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
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Error updating password", error: error.message });
    }
  });

module.exports = router;
