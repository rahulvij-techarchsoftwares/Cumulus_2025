const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Userlogin } = require("../models/userModel");

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("🔹 Webhook received!");

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("🔹 Event Received:", JSON.stringify(event, null, 2));
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    let session = event.data.object;
    let { user_id, planType, duration, subscription_id, startDate, endDate } = session.metadata || {};

    console.log("🟢 Webhook Extracted Metadata:");
    console.log("User ID:", user_id);
    console.log("Plan Type:", planType);
    console.log("Duration:", duration);
    console.log("Subscription ID:", subscription_id);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    if (!user_id || !planType || !duration || !subscription_id || !endDate) {
      console.error("❌ Missing required metadata in webhook:", { user_id, planType, duration, subscription_id, endDate });
      return res.status(400).json({ error: "Missing required metadata in webhook." });
    }

    if (session.payment_status !== "paid") {
      console.warn(`⚠️ Payment status is not 'paid' for user ID: ${user_id}`);
      return res.status(400).json({ error: "Payment not completed" });
    }

    try {
      const user = await Userlogin.findById(user_id);
      if (!user) {
        console.error("❌ User not found:", user_id);
        return res.status(404).json({ error: "User not found" });
      }

      const newMembership = {
        subscription_id: subscription_id,
        buyingDate: new Date(),
        planTime: duration,  // ✅ Use correct field
        expiryDate: new Date(endDate),  // ✅ Corrected field name
      };

      console.log("🔹 New Membership Data:", newMembership);

      // Ensure memberships array exists
      if (!Array.isArray(user.memberships)) {
        user.memberships = [];
      }

      user.memberships.push(newMembership);

      // Update main user fields
      user.activeMembership = true;
      user.planType = planType;
      user.expiryDate = new Date(endDate);  // ✅ Ensure correct field name is used

      await user.save();
      console.log("✅ User After Update:", await Userlogin.findById(user_id));

      res.status(200).json({ success: true, subscription_id });

    } catch (dbError) {
      console.error("❌ Error updating user subscription:", dbError);
      res.status(500).json({ error: "Internal server error", details: dbError.message });
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;