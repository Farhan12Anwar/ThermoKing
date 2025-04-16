const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  items: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      partNumber: String,
      description: String,
      priceWithGST: Number,
      quantity: Number,
    },
  ],
  total: Number,
  date: Date,
});

module.exports = mongoose.model('Invoice', invoiceSchema);
