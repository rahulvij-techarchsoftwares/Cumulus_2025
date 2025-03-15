require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { frontend_URL, backend_URL } = require('../config/apiConfig');
const prices = {
  legacyPremiumAnnual: 'price_1R1LqpJ7Fy59EZyjdOgMSCD0',   // Replace with actual price ID from Stripe
  foundationStandardAnnual: 'price_1R1LpnJ7Fy59EZyjrhTX9Dcs', // Replace with actual price ID from Stripe
  legacyPremiumMonthly: 'price_1R1Lq3J7Fy59EZyjgvpROjGN',    // Replace with actual price ID from Stripe
  foundationStandardMonthly: 'price_1R1LnnJ7Fy59EZyjUppahszo', // Replace with actual price ID from Stripe
};

exports.createCheckoutSession = async (sessionData) => {
  try {
    const { planType, duration ,user_id,subscription_id} = sessionData;
    console.log("planType:", planType);
    console.log("duration:", duration);
        let priceId;

    if (!user_id) throw new Error("User ID is required");

    if (planType === "legacyPremium") {
      priceId = duration === "monthly" ? prices.legacyPremiumMonthly : prices.legacyPremiumAnnual;
    } else if (planType === "foundationStandard") {
      priceId = duration === "monthly" ? prices.foundationStandardMonthly : prices.foundationStandardAnnual;
    } else {
      throw new Error("Invalid plan type");
    }

    // 📅 Get the current date
    const startDate = new Date();
    const endDate = new Date(startDate);

    // Add duration based on plan type
    if (duration === "monthly") {
      endDate.setDate(endDate.getDate() + 30);
    } else if (duration === "yearly") {
      endDate.setDate(endDate.getDate() + 365);
    } else {
      throw new Error("Invalid duration type");
    }

    // Format dates (YYYY-MM-DD)
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    // 🏦 Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${frontend_URL}/enterdashboard`,
      cancel_url: `${frontend_URL}/Subscription`,
      metadata: {
        user_id,
        planType,
        duration,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        subscription_id: subscription_id || "",
      },
    });

    return session;
  } catch (err) {
    throw new Error(`Error creating checkout session: ${err.message}`);
  }
};