// === FILE: client/src/App.js ===
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const PrintableInvoice = React.forwardRef(({ items }, ref) => {
  const total = items.reduce(
    (sum, item) => sum + item.priceWithGST * item.quantity,
    0
  );
  const date = new Date().toLocaleDateString();

  return (
    <div ref={ref} className="print-invoice">
      <h3>TAX INVOICE Page 1 of 1</h3>
      <p>Rule 46, Sec 31 of The Central Goods and Services Tax Act, 2017</p>
      <p>
        <strong>EXTRA COPY</strong>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <div>
          <img src="/logo192.png" alt="Company Logo" width="100" />
        </div>
        <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
          <strong>Trane Technologies India Private Limited</strong>
          <br />
          Door No 116, Deveneri Village road
          <br />
          Ponneri Taluk Thiruvallur, TN, CHENNAI, INDIA
          <br />
          Invoice No.: MH-SO-2526100074
          <br />
          Invoice Date: {date}
          <br />
          Ack No.: 122526231670766
          <br />
          Ack Date: {date}
          <br />
          IRN: 667417984b6a0aa0daf51775889f63d880e
          <br />
          9c1e87560a3a11e139fd13a7f3155
        </div>
      </div>

      <table className="invoice-table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>S. No</th>
            <th>Part #</th>
            <th>Description</th>
            <th>Qty</th>
            <th>GST %</th>
            <th>GST Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.partNumber}</td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>18%</td>
              <td>₹{(item.priceWithGST * item.quantity * 0.18).toFixed(2)}</td>
              <td>₹{(item.priceWithGST * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total" style={{ marginTop: "1rem", textAlign: "right" }}>
        <strong>GRAND TOTAL: ₹{total.toFixed(2)}</strong>
      </p>
    </div>
  );
});

const App = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    partNumber: "",
    description: "",
    originalPrice: "",
    priceWithGST: "",
    stock: "",
  });
  const [search, setSearch] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const printRef = useRef();

  const fetchProducts = () => {
    fetch(`http://localhost:5000/products?search=${search}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = {
      ...form,
      originalPrice: Number(form.originalPrice),
      priceWithGST: Number(form.priceWithGST),
      stock: Number(form.stock),
    };
    const res = await fetch("http://localhost:5000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    const saved = await res.json();
    setProducts([...products, saved]);
    setForm({
      partNumber: "",
      description: "",
      originalPrice: "",
      priceWithGST: "",
      stock: "",
    });
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/products/${id}`, { method: "DELETE" });
    setProducts(products.filter((p) => p._id !== id));
  };

  const handleEdit = (product) => {
    setEditForm({ ...product });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = {
      ...editForm,
      originalPrice: Number(editForm.originalPrice),
      priceWithGST: Number(editForm.priceWithGST),
      stock: Number(editForm.stock),
    };
    const res = await fetch(`http://localhost:5000/products/${editForm._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const result = await res.json();
    setProducts(products.map((p) => (p._id === result._id ? result : p)));
    setEditForm(null);
  };

  const addToInvoice = (product) => {
    const existing = invoiceItems.find((i) => i._id === product._id);
    const totalQty = existing ? existing.quantity + 1 : 1;
    if (product.stock < totalQty) {
      alert(
        `Cannot add more than available stock (${product.stock}) for ${product.description}`
      );
      return;
    }
    if (existing) {
      setInvoiceItems(
        invoiceItems.map((i) =>
          i._id === product._id ? { ...i, quantity: totalQty } : i
        )
      );
    } else {
      setInvoiceItems([...invoiceItems, { ...product, quantity: 1 }]);
    }
  };

  const generateInvoice = async () => {
    await fetch("http://localhost:5000/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: invoiceItems }),
    });

    const printContents = printRef.current.innerHTML;
    const newWindow = window.open("", "", "width=800,height=900");
    newWindow.document.write(
      "<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:20px}.center{text-align:center}.invoice-table{width:100%;border-collapse:collapse}.invoice-table th,.invoice-table td{border:1px solid #000;padding:8px;text-align:center}.total{text-align:right;font-weight:bold;margin-top:10px}</style></head><body>"
    );
    newWindow.document.write(printContents);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();

    setInvoiceItems([]);
    fetchProducts();
  };

  return (
    <div className="container">
      <h1>Inventory Management</h1>
      <input
        type="text"
        placeholder="Search by part number or description"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      <form onSubmit={handleSubmit} className="form">
        {[
          "partNumber",
          "description",
          "originalPrice",
          "priceWithGST",
          "stock",
        ].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
            required
          />
        ))}
        <button type="submit">Add Product</button>
      </form>

      <ul className="product-list">
        {products.map((product) => (
          <li key={product._id} className="product-item">
            {editForm && editForm._id === product._id ? (
              <form onSubmit={handleEditSubmit} className="form">
                {[
                  "partNumber",
                  "description",
                  "originalPrice",
                  "priceWithGST",
                  "stock",
                ].map((field) => (
                  <input
                    key={field}
                    name={field}
                    value={editForm[field]}
                    onChange={handleEditChange}
                    required
                  />
                ))}
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditForm(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p>
                  <strong>{product.description}</strong> (Part #
                  {product.partNumber})
                </p>
                <p>
                  Original: ₹{product.originalPrice} | With GST: ₹
                  {product.priceWithGST}
                </p>
                <p>Stock: {product.stock}</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => handleEdit(product)}>Edit</button>
                  <button onClick={() => handleDelete(product._id)}>
                    Remove
                  </button>
                  <button onClick={() => addToInvoice(product)}>
                    Add to Invoice
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {invoiceItems.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <PrintableInvoice ref={printRef} items={invoiceItems} />
          <button onClick={generateInvoice} style={{ marginTop: "1rem" }}>
            Generate & Print
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
