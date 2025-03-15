const express = require("express");
require("dotenv").config();
const twilio = require("twilio");
const mongoose = require("mongoose");
const Otp = require("../models/otpModel");
const router = express.Router();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio Phone:", process.env.TWILIO_PHONE_NUMBER);
const sendOTP = async (phoneNumber) => {
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
      console.log("Generated OTP:", otpCode);
      await Otp.findOneAndUpdate(
        { phoneNumber },
        { otp: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
      );
      console.log("Attempting to send OTP via Twilio...");
      const message = await client.messages.create({
        body: `Your OTP code is ${otpCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      console.log("Twilio Response:", message);
      return { success: true, message: "OTP sent successfully" };
    } catch (error) {
      console.error("Twilio Error:", error);
      return { success: false, message: error.message };
    }
  };
const verifyOTP = async (phoneNumber, otp) => {
  const record = await Otp.findOne({ phoneNumber });
  if (!record) return { success: false, message: "OTP expired or not found" };
  if (record.otp === otp) {
    await Otp.deleteOne({ phoneNumber });
    return { success: true, message: "OTP verified successfully" };
  } else {
    await Otp.deleteOne({ phoneNumber });
    return { success: false, message: "Invalid OTP" };
  }
};
router.post("/send-otp", async (req, res) => {
    console.log("Incoming request to /send-otp:", req.body);
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    const response = await sendOTP(phoneNumber);
    res.status(response.success ? 200 : 500).json(response);
  });
router.post("/verify-otp", async (req, res) => {
    console.log("Incoming request to /verify-otp:", req.body);
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
    }
    const response = await verifyOTP(phoneNumber, otp);
    res.status(response.success ? 200 : 400).json(response);
  });
module.exports = router;