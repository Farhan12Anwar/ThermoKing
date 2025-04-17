const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  date: Date,
  invoiceNumber: String,
  customer: {
    name: String,
    address: String,
    pan: String,
    gstin: String,
    placeOfSupply: String,
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
