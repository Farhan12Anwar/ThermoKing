const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://anwarfarhan339:cannonx100@cluster0.yhseakx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/products', async (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query = {
      $or: [
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };
  }
  const products = await Product.find(query);
  res.json(products);
});

app.post('/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.put('/products/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

app.post('/invoice', async (req, res) => {
  const { items } = req.body;
  let total = 0;
  for (let item of items) {
    const product = await Product.findById(item._id);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ error: `Not enough stock for ${product.description}` });
    }
    product.stock -= item.quantity;
    await product.save();
    total += item.priceWithGST * item.quantity;
  }
  const invoice = new Invoice({ items, total, date: new Date() });
  await invoice.save();
  res.json(invoice);
});

app.listen(5000, () => console.log('Server started on port 5000'));
