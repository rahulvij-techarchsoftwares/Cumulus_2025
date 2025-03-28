const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const { Userlogin } = require("../models/userModel");
const { sendEmail } = require("../email/emailUtils");
const { frontend_URL, backend_URL } = require('../config/apiConfig');

router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
  const event = req.body;

  try {
    // Step 1: Handle successful payment
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const amount_paid = invoice.amount_paid / 100;
      const currency = invoice.currency;
      const email = invoice.customer_email;
      const invoice_url = invoice.hosted_invoice_url;

      if (!email) {
        throw new Error("Customer email not found in invoice.");
      }

      // Send success email
      await sendEmail({
        to: email,
        subject: "✅ Payment Successful – Invoice Attached!",
        body: `<p>Hi,</p>
          <p>Your payment has been successfully processed.</p>
          <h3>📜 Invoice Details:</h3>
          <ul>
            <li>💰 Amount Paid: <strong>${amount_paid} ${currency.toUpperCase()}</strong></li>
          </ul>
          <p>📄 <strong>Download your invoice:</strong> <a href="${invoice_url}" target="_blank">View Invoice</a></p>
          <p>Thank you for your payment!</p>`,
      });

      console.log("✅ Payment successful email sent.");
    }

    // Step 2: Run checkout completion logic AFTER successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Extract metadata
      const {
        user_id,
        planType,
        subscription_id, // MongoDB subscription ID
        duration,
        startDate,
        endDate
      } = session.metadata;

      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new Error(`Invalid User ID: ${user_id}`);
      }

      if (!mongoose.Types.ObjectId.isValid(subscription_id)) {
        throw new Error(`Invalid Subscription ID: ${subscription_id}`);
      }

      // Find the user
      const user = await Userlogin.findById(user_id);
      if (!user) {
        throw new Error(`User not found: ${user_id}`);
      }

      // Update membership details
      user.memberships = user.memberships || [];
      user.memberships.push({
        subscription_id,
        planType,
        buyingDate: new Date(startDate),
        planTime: duration,
        expiryDate: new Date(endDate),
      });
      user.activeMembership = true;
      await user.save();

      console.log("✅ User membership updated successfully.");

      // Send membership confirmation email
      await sendEmail({
        to: user.email, // Assuming user's email is stored in DB
        subject: "✅ Payment Confirmed – Your Cumulus Subscription is Active!",
        body: `<p>Hi ${user.name},</p>
          <p>Thank you for subscribing to Cumulus! Your payment has been successfully processed.</p>
          <h3>📜 Subscription Details:</h3>
          <ul>
            <li>• Plan: <strong>${planType}</strong></li>
            <li>• Amount Paid: <strong>$${session.amount_total / 100}</strong></li>
            <li>• Next Billing Date: <strong>${new Date(endDate).toDateString()}</strong></li>
          </ul>
          <p>You can manage your subscription anytime in your <a href='${frontend_URL}/my-profile'>Account Settings</a>.</p>
          <p>Have any questions? Our support team is happy to help!</p>
          <p>Best,<br>The Cumulus Team</p>`,
      });

      console.log("✅ Membership confirmation email sent.");

      res.json({ success: true });
    }

    // Step 3: Handle payment failure
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const email = invoice.customer_email;
      const invoice_url = invoice.hosted_invoice_url;
      const reason = invoice.failure_reason || "Payment failed due to insufficient funds or other issues.";

      if (!email) {
        throw new Error("Customer email not found in invoice.");
      }

      // Send failure email
      await sendEmail({
        to: email,
        subject: "❌ Payment Failed – Action Required!",
        body: `<p>Hi,</p>
          <p>Unfortunately, your payment has failed.</p>
          <h3>🚨 Reason:</h3>
          <p>${reason}</p>
          <p>📄 <strong>Check your invoice:</strong> <a href="${invoice_url}" target="_blank">View Invoice</a></p>
          <p>Please update your payment details and try again.</p>`,
      });

      console.log("❌ Payment failure email sent.");
      res.json({ success: false });
    }

  } catch (error) {
    // Handle any errors and send a debug email
    await sendEmail({
      to: "support@cumulus.rip",
      subject: "🚨 Webhook Error!",
      body: `<p><strong>Error Context:</strong> ${event.type}</p><p><strong>Error:</strong> ${error.message}</p>`,
    });

    console.error(`❌ Webhook error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
