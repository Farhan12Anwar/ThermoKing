const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  items: [Object],
  total: Number,
  date: Date,
  invoiceNumber: String,
  customer: Object,
  paymentType: String, // 'cash', 'credit', 'partial'
  amountPaid: Number, // for 'partial'
});

module.exports = mongoose.model("Invoice", invoiceSchema);
