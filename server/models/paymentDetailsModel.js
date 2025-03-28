const mongoose = require("mongoose");

const PaymentDetailsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Userlogin", required: true },
  subscription_id: String,
  planType: String,
  duration: String,
  amount_paid: Number,
  currency: String,
  payment_status: String,
  invoice_url: String,
  invoice_id: { type: String, unique: true },  // ❌ This prevents duplicate invoices
  expiryDate: Date,
});


module.exports = mongoose.model("PaymentDetails", PaymentDetailsSchema);

