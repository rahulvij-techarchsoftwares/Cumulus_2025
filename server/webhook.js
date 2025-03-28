const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const { Userlogin } = require("../models/userModel");
const PaymentDetails = require("../models/paymentDetailsModel");
const { sendEmail } = require("../email/emailUtils");

router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
  const event = req.body;
  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const user_id = session.metadata.user_id;
    const duration = session.metadata.duration;
    const subscription_id = session.metadata.subscription_id;
    const endDate = session.metadata.endDate;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      console.error("Invalid User ID:", user_id);
      return res.status(400).json({ error: "Invalid User ID" });
    }

    try {
      const user = await Userlogin.findById(user_id);
      if (!user) {
        console.error("User not found:", user_id);
        return res.status(404).json({ error: "User not found" });
      }

      // Store metadata inside the subscription
      await stripe.subscriptions.update(subscription_id, {
        metadata: {
          user_id,
          duration,
          endDate,
          email: user.email,
        },
      });

      user.memberships = user.memberships || [];
      user.memberships.push({
        subscription_id,
        buyingDate: new Date(),
        planTime: duration,
        expiryDate: new Date(endDate),
      });
      user.activeMembership = true;
      await user.save();

      console.log("✅ Subscription metadata stored successfully!");
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error updating subscription:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    let invoice = event.data.object;
    let subscription_id = invoice.subscription;
    let amount_paid = invoice.amount_paid / 100;
    let currency = invoice.currency;
    let invoice_url = invoice.hosted_invoice_url;
    let invoice_id = invoice.id;

    try {
      // Retrieve subscription details with metadata
      const subscription = await stripe.subscriptions.retrieve(subscription_id);
      const { user_id, email, duration, endDate } = subscription.metadata;

      if (!user_id) {
        console.error("❌ Subscription details not found in metadata!");
        return res.status(400).json({ error: "Subscription details not found" });
      }

      const user = await Userlogin.findById(user_id);
      if (!user) {
        console.error("❌ User not found:", user_id);
        return res.status(404).json({ error: "User not found" });
      }

      const expiryDate = new Date(endDate);

      // Update subscription metadata to ensure consistency
      await stripe.subscriptions.update(subscription_id, {
        metadata: {
          user_id,
          duration,
          endDate,
          email,
        },
      });

      const paymentDetails = new PaymentDetails({
        user_id,
        subscription_id,
        duration,
        amount_paid,
        currency,
        invoice_url,
        invoice_id,
        expiryDate,
      });
      await paymentDetails.save();
      console.log("✅ Payment Details Saved!");

      user.memberships = user.memberships || [];
      user.memberships.push({ subscription_id, buyingDate: new Date(), planTime: duration, expiryDate });
      user.activeMembership = true;
      await user.save();
      console.log("✅ User Subscription Updated!");

      const emailData = {
        to: email,
        subject: "✅ Payment Confirmed – Your Subscription is Active!",
        body: `<p>Hi ${user.username},</p><p>Your payment was successful.</p>
          <h3>📜 Subscription Details:</h3>
          <ul>
            <li>📌 Subscription ID: <strong>${subscription_id}</strong></li>
            <li>📅 Next Billing Date: <strong>${expiryDate.toDateString()}</strong></li>
          </ul>
          <p>📄 <strong>Download your invoice:</strong> <a href="${invoice_url}" target="_blank">View Invoice</a></p>
          <p>Thank you for subscribing!</p>`,
      };

      await sendEmail(emailData);
      console.log("📧 Invoice email sent to:", email);

      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error processing invoice:", error);
      return res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
