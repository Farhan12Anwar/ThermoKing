// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/Product");
const Invoice = require("./models/Invoice");
// require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    `mongodb+srv://anwarfarhan339:cannonx100@cluster0.yhseakx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ========== Product Routes ==========

// Fetch all products (with search)
app.get("/products", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { partNumber: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Add a new product
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Failed to add product" });
  }
});

// Update an existing product
app.put("/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

// Delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete product" });
  }
});

// ========== Invoice Routes ==========

// Create a new invoice
app.post("/invoice", async (req, res) => {
  try {
    const { items, invoiceNumber, customer } = req.body;

    if (!items || !invoiceNumber || !customer) {
      return res.status(400).json({ error: "Missing invoice data" });
    }

    let total = 0;

    for (let item of items) {
      const product = await Product.findById(item._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for ${
            product?.description || "unknown item"
          }`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      total += item.priceWithGST * item.quantity;
    }

    const invoice = new Invoice({
      items,
      total,
      date: new Date(),
      invoiceNumber,
      customer,
    });

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// Update an invoice by invoice number
app.put("/invoice/:invoiceNumber", async (req, res) => {
  try {
    const updated = await Invoice.findOneAndUpdate(
      { invoiceNumber: req.params.invoiceNumber },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update invoice" });
  }
});

// Fetch a specific invoice (for detailed view)
app.get("/invoice/:invoiceNumber", async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// Search invoice by invoice number (alternative route)
app.get("/api/invoices/search/:invoiceNumber", async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to search invoice" });
  }
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
