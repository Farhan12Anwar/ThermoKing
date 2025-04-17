import React, { useState, useEffect, useRef } from "react";
import "./App.css";



const PrintableInvoice = React.forwardRef(({ items, customer }, ref) => {


  const total = items.reduce(
    (sum, item) => sum + item.priceWithGST * item.quantity,
    0
  );
  const date = new Date().toLocaleDateString();
  

  const thStyle = {
    border: "1px solid #000",
    padding: "10px 8px",
    backgroundColor: "#f0f0f0",
    textAlign: "left",
    fontWeight: "bold",
  };

  const tdStyle = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "left",
    verticalAlign: "top",
  };

  return (
    <div
      ref={ref}
      style={{
        border: "1px solid #333",
        padding: "2rem",
        margin: "2rem auto",
        maxWidth: "850px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: "13px",
        color: "#000",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        TAX INVOICE
      </h2>
      <p style={{ textAlign: "center", marginTop: 0, fontSize: "12px" }}>
        GSTIN: <strong>123456789012345</strong>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "2rem",
          borderBottom: "1px solid #ccc",
          paddingBottom: "1rem",
        }}
      >
        <div>
          <img src="/logo192.png" alt="Company Logo" width="100" />
        </div>
        <div style={{ textAlign: "right", lineHeight: "1.6" }}>
          <strong style={{ fontSize: "14px" }}>
            Trane Technologies India Private Limited
          </strong>
          <br />
          Door No 116, Deveneri Village Road
          <br />
          Ponneri Taluk Thiruvallur, TN, CHENNAI, INDIA
          <br />
          <strong>Invoice No.:</strong> MH-SO-2526100074
          <br />
          <strong>Invoice Date:</strong> {date}
          <br />
          <strong>Place of Supply:</strong> Tamil Nadu, India
          <br />
          <strong>Invoice Type:</strong> Tax Invoice
        </div>
      </div>

      {/* Customer Details Section */}
      <div
        style={{
          marginTop: "2rem",
          borderBottom: "1px solid #ccc",
          paddingBottom: "1rem",
        }}
      >
        <strong>Customer Details:</strong>
        <br />
        <strong>Name:</strong> {customer.name}
        <br />
        <strong>Address:</strong> {customer.address}
        <br />
        <strong>PAN:</strong> {customer.pan}
        <br />
        <strong>GSTIN:</strong> {customer.gstin}
        <br />
        <strong>Place of Supply:</strong> {customer.placeOfSupply}
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "2rem",
          border: "1px solid #000",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              S. No
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              Part # / HSN/SAC Code
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              Description
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              Qty
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              Unit Price
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              GST %
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              GST Amount
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "10px",
                backgroundColor: "#f0f0f0",
              }}
            >
              Total (With GST)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {item.partNumber} / {item.hsnCode}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {item.description}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {item.quantity}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                ₹{item.originalPrice.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                {item.gst}%
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                ₹
                {(
                  (item.originalPrice * item.quantity * item.gst) /
                  100
                ).toFixed(2)}
              </td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                ₹{(item.priceWithGST * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            borderTop: "1px solid #000",
            paddingTop: "0.5rem",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          <p>Taxable Value: ₹{total.toFixed(2)}</p>
          <p>GST @ 18%: ₹{(total * 0.18).toFixed(2)}</p>
          <p>
            <strong>Grand Total: ₹{(total + total * 0.18).toFixed(2)}</strong>
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          textAlign: "center",
          fontSize: "12px",
        }}
      >
        <p>
          <strong>Authorized Signatory</strong>
        </p>
        <p style={{ fontSize: "10px" }}>
          This is a computer-generated document and does not require a physical
          signature.
        </p>
      </div>
    </div>
  );
});

const App = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    partNumber: "",
    description: "",
    originalPrice: "",
    gst: "",
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
      gst: Number(form.gst),
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
      gst: "",
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
      gst: Number(editForm.gst),
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

    const priceWithGST =
      product.originalPrice * (1 + Number(product.gst) / 100);

    if (existing) {
      setInvoiceItems(
        invoiceItems.map((i) =>
          i._id === product._id ? { ...i, quantity: totalQty } : i
        )
      );
    } else {
      setInvoiceItems([
        ...invoiceItems,
        { ...product, priceWithGST, quantity: 1 },
      ]);
    }
  };

  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    pan: "",
    gstin: "",
    placeOfSupply: "",
  });

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    // You can store or validate customer details here
    console.log("Customer Details Submitted:", customer);
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
      `<html><head><title>Invoice</title>
      <style>
        body{font-family:sans-serif;padding:20px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #000;padding:8px;text-align:left}
        h2{text-align:center}
        .total{text-align:right;font-weight:bold;margin-top:10px}
      </style></head><body>`
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
        {["partNumber", "description", "originalPrice", "gst", "stock"].map(
          (field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field}
              required
            />
          )
        )}
        <button type="submit">Add Product</button>
      </form>

      <form onSubmit={handleCustomerSubmit} className="form">
        <h3>Customer Details</h3>
        {["name", "address", "pan", "gstin", "placeOfSupply"].map((field) => (
          <input
            key={field}
            name={field}
            value={customer[field]}
            onChange={handleCustomerChange}
            placeholder={field}
            required
          />
        ))}
        <button type="submit">Save Customer Details</button>
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
                  "gst",
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
                  {(
                    product.originalPrice *
                    (1 + Number(product.gst) / 100)
                  ).toFixed(2)}
                </p>
                <p>GST: {product.gst}%</p>
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
         <PrintableInvoice ref={printRef} items={invoiceItems} customer={customer} />

          <button onClick={generateInvoice} style={{ marginTop: "1rem" }}>
            Generate & Print
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
