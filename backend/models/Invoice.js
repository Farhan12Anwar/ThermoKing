const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  items: [Object],
  total: Number,
  date: Date,
  invoiceNumber: String,
  customer: Object,
});

module.exports = mongoose.model("Invoice", invoiceSchema);
