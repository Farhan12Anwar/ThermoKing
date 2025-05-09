const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  partNumber: String,
  description: String,
  originalPrice: Number,
  priceWithGST: Number,
  gst: Number,
  stock: Number,
});

module.exports = mongoose.model("Product", productSchema);
