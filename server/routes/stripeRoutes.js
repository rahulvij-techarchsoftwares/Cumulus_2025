const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../services/stripeService");
const { sendEmail } = require("../email/emailUtils");

router.post("/create-checkout-session", async (req, res) => {
  console.log("📥 Received request body:", req.body);

  const { planType, duration, user_id, subscription_id, email } = req.body;

  if (!planType || !duration || !user_id || !subscription_id || !email) {
    console.log("❌ Missing required fields:", { planType, duration, user_id, subscription_id, email });
    return res.status(400).json({ error: "planType, duration, user_id, subscription_id, and email are required." });
  }

  try {
    // 🔹 Create Stripe Checkout Session
    const session = await createCheckoutSession({ planType, duration, user_id, subscription_id });

    console.log("✅ Stripe Session Created:", session.id);

    // 🔹 Send Confirmation Email Immediately
    const emailData = {
      to: email,
      subject: "🔔 Your Subscription Checkout Session is Ready!",
      body: `
        <p>Hello,</p>
        <p>Your checkout session has been successfully created.</p>
        <h3>📜 Subscription Details:</h3>
        <ul>
          <li>📌 Plan: <strong>${planType}</strong></li>
          <li>⏳ Duration: <strong>${duration} </strong></li>
          <li>🔗 <a href="${session.url}" target="_blank">Complete Payment</a></li>
        </ul>
        <p>Thank you for subscribing!</p>
      `,
    };

    const emailResponse = await sendEmail(emailData);
    if (!emailResponse.success) {
      console.error("❌ Email failed to send:", emailResponse.error);
    } else {
      // console.log("✅ Email sent successfully:", emailResponse.previewURL);
    }

    res.json({
      id: session.id,
      startDate: session.metadata.startDate,
      endDate: session.metadata.endDate,
      subscription_id: session.metadata.subscription_id,
    });

  } catch (error) {
    console.error("❌ Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
