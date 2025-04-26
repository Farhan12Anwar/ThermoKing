import React, { useState, useEffect, useRef } from "react";
import "./App.css";
// import ReactToPrint from "react-to-print";

import PrintableInvoice from "./components/PrintableInvoice";

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

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [serviceCharges, setServiceCharges] = useState([]); // Array to store multiple service charges
  const [serviceCharge, setServiceCharge] = useState({
    description: "",
    price: 0,
  });

  useEffect(() => {
    if (!invoiceNumber && invoiceItems.length > 0) {
      const newInvoiceNumber = `MH-SO-${Date.now()}`;
      setInvoiceNumber(newInvoiceNumber);
    }
  }, [invoiceItems]);
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
    if (product.stock <= 0) {
      alert("Out of stock!");
      return;
    }

    // Check if already added
    const existingItemIndex = invoiceItems.findIndex(
      (item) => item._id === product._id
    );

    let updatedItems;
    if (existingItemIndex > -1) {
      updatedItems = [...invoiceItems];
      updatedItems[existingItemIndex].quantity += 1;
    } else {
      updatedItems = [
        ...invoiceItems,
        {
          ...product,
          quantity: 1,
          priceWithGST: product.originalPrice * (1 + Number(product.gst) / 100),
        },
      ];
    }

    setInvoiceItems(updatedItems);

    // Decrease stock in products list
    const updatedProducts = products.map((p) =>
      p._id === product._id ? { ...p, stock: p.stock - 1 } : p
    );
    setProducts(updatedProducts);
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      const response = await fetch("api/customer");
      const data = await response.json();
      setCustomer(data);
    };

    fetchCustomerData();
  }, []);

  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    pan: "",
    gstin: "",
    placeOfSupply: "",
    vehicleRegistrationNo: "",
    unitModel: "",
    hourMeter: "",
  });

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    const customerData = {
      name: customer.name,
      address: customer.address,
      pan: customer.pan,
      gstin: customer.gstin,
      placeOfSupply: customer.placeOfSupply,
      vrno: customer.vehicleRegistrationNo, // corrected
      unitmodel: customer.unitModel, // corrected
      hourmeter: customer.hourMeter, // corrected
    };

    // Update the invoice with customer data (could be a setState, API call, or any data management logic)
    setCustomer(customerData);
  };

  const handleServiceChargeSubmit = (e) => {
    e.preventDefault();
    // Add the new service charge to the serviceCharges array
    setServiceCharges((prev) => [
      ...prev,
      { description: serviceCharge.description, price: serviceCharge.price },
    ]);
    // Clear the service charge input fields
    setServiceCharge({ description: "", price: 0 });
  };

  const generateInvoice = () => {
    if (!printRef.current) {
      alert("Invoice content not available to print.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=900");

    printWindow.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <link rel="stylesheet" type="text/css" href="${window.location.origin}/App.css">
        <style>
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${printRef.current.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const done = async () => {
    console.log("Sending Invoice Data:", {
      items: invoiceItems,
      invoiceNumber,
      customer,
      paymentType,
      amountPaid: paymentType === "partial" ? amountPaid : null,
    });

    if (!paymentType) {
      alert("Please select a payment type before saving.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: invoiceItems,
          invoiceNumber,
          customer,
          paymentType,
          amountPaid: paymentType === "partial" ? amountPaid : null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert("Error saving invoice: " + err.error);
        return;
      }

      alert("Invoice saved successfully!");

      // Reset form
      setInvoiceItems([]);
      setInvoiceNumber("");
      setCustomer({
        name: "",
        address: "",
        pan: "",
        gstin: "",
        placeOfSupply: "",
        vrno: "",
        unitmodel: "",
        hourmeter: "",
      });

      fetchProducts(); // Refresh products
    } catch (err) {
      alert("Something went wrong while saving the invoice.");
      console.error(err);
    }
  };

  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [searchedInvoice, setSearchedInvoice] = useState(null);

  const [editablePaymentType, setEditablePaymentType] = useState("");
  const [editableAmountPaid, setEditableAmountPaid] = useState("");

  const handleSearch = async () => {
    if (!searchInvoiceNumber) return alert("Please enter an invoice number");

    try {
      const response = await fetch(
        `http://localhost:5000/invoice/${searchInvoiceNumber}`
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        setSearchedInvoice(null);
        return;
      }

      setSearchedInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Error fetching invoice.");
    }
  };

  const cellStyle = {
    border: "1px solid #000",
    padding: "10px",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleUpdatePayment = async () => {
    if (!searchedInvoice) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/invoices/${searchedInvoice._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentType: editablePaymentType,
            amountPaid:
              editablePaymentType === "partial" ? editableAmountPaid : null,
          }),
        }
      );

      const updated = await response.json();
      alert("Payment info updated!");
      setSearchedInvoice(updated);
    } catch (err) {
      console.error("Error updating payment type:", err);
      alert("Failed to update payment details.");
    }
  };

  const calculateTotal = () => {
    const totalWithoutServiceCharge = invoiceItems.reduce(
      (total, item) => total + item.priceWithGST * item.quantity,
      0
    );

    const totalServiceCharges = serviceCharges.reduce(
      (total, charge) => total + charge.price,
      0
    );

    return totalWithoutServiceCharge + totalServiceCharges;
  };

  return (
    <div>
      <div className="container">
        <div className="left-side">
          <h1>Inventory Management</h1>
          <div>
            <div>🔎</div>
            <input
              type="text"
              placeholder="Search by part number or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-bar"
            />
          </div>
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
            {[
              "name",
              "address",
              "pan",
              "gstin",
              "placeOfSupply",
              "vehicleRegistrationNo",
              "unitModel",
              "hourMeter",
            ].map((field) => (
              <div key={field} className="input-group">
                <label htmlFor={field}>{field}</label>
                <input
                  id={field}
                  name={field}
                  value={customer[field]}
                  onChange={handleCustomerChange}
                  required
                />
              </div>
            ))}

            <div>
              <h3>Add Service Charges</h3>
              <form onSubmit={handleServiceChargeSubmit}>
                <div>
                  <label>Service Charge Description:</label>
                  <input
                    type="text"
                    value={serviceCharge.description}
                    onChange={(e) =>
                      setServiceCharge((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter service charge description"
                    required
                  />
                </div>

                <div>
              <label>Service Charge Price (₹):</label>
              <input
                type="number"
                value={serviceCharge.price}
                onChange={(e) =>
                  setServiceCharge((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                placeholder="Enter service charge price"
              />
            </div>
            
                <button type="button" onClick={handleServiceChargeSubmit}>
                  Add Service Charge
                </button>
              </form>
              
            </div>

            
          </form>

          {invoiceItems.length > 0 && (
            <div>
              <PrintableInvoice
                ref={printRef}
                items={invoiceItems}
                customer={customer}
                invoiceNumber={invoiceNumber}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                amountPaid={amountPaid}
                setAmountPaid={setAmountPaid}
                serviceCharges={serviceCharges} // ✅ important
              />

              <div>
                <button onClick={generateInvoice}>Generate & Print</button>

                <button onClick={done} disabled={!paymentType}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="right-side">
          <ul className="product-list">
            {currentProducts.map((product) => (
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
                    <div>
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button onClick={() => handleDelete(product._id)}>
                        Remove
                      </button>
                      <button
                        onClick={() => addToInvoice(product)}
                        disabled={product.stock <= 0}
                      >
                        {product.stock <= 0 ? "Out of Stock" : "Add to Invoice"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <div>
        <h3>🔎 Search Invoice by Invoice Number</h3>
        <input
          type="text"
          placeholder="Enter Invoice Number (e.g., MH-...)"
          value={searchInvoiceNumber}
          onChange={(e) => setSearchInvoiceNumber(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>

        {searchedInvoice && (
          <>
            <div>
              <h4>Payment Details</h4>
              <div>
                {["cash", "credit", "partial"].map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="editPaymentType"
                      value={type}
                      checked={editablePaymentType === type}
                      onChange={(e) => setEditablePaymentType(e.target.value)}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>

              {editablePaymentType === "partial" && (
                <div>
                  <label>Amount Paid:</label>
                  <input
                    type="number"
                    value={editableAmountPaid}
                    onChange={(e) => setEditableAmountPaid(e.target.value)}
                    placeholder="Enter amount paid"
                  />
                </div>
              )}

              <button onClick={() => handleUpdatePayment()}>
                Save Payment Changes
              </button>
            </div>

            <div>
              <h2>TAX INVOICE</h2>
              <p>
                GSTIN: <strong>36 cispm5742f1zu</strong>
              </p>
              <p>
                Invoice No.: <strong>{searchedInvoice.invoiceNumber}</strong>
              </p>

              <div>
                <div>
                  <strong>Customer Details:</strong>
                  <br />
                  <strong>Name:</strong> {searchedInvoice.customer.name}
                  <br />
                  <strong>Address:</strong> {searchedInvoice.customer.address}
                  <br />
                  <strong>PAN:</strong> {searchedInvoice.customer.pan}
                  <br />
                  <strong>GSTIN:</strong> {searchedInvoice.customer.gstin}
                  <br />
                  <strong>Place of Supply:</strong>
                  {searchedInvoice.customer.placeOfSupply}
                  <br />
                  <strong>vrno:</strong> {searchedInvoice.customer.vrno}
                  <br /> <br />
                  <strong>unitModel:</strong> {searchedInvoice.customer.name}
                  <br /> <br />
                  <strong>hourMeter:</strong> {searchedInvoice.customer.name}
                  <br />
                </div>

                <div>
                  <h4>Invoice Items</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>GST</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.originalPrice}</td>
                          <td>{item.gst}%</td>
                          <td>₹{item.priceWithGST * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <strong>Total Amount: ₹{calculateTotal().toFixed(2)}</strong>
                </div>
                <div>
                  <h4>Payment Details</h4>
                  <div>
                    {["cash", "credit", "partial"].map((type) => (
                      <label key={type}>
                        <input
                          type="radio"
                          name="editPaymentType"
                          value={type}
                          checked={editablePaymentType === type}
                          onChange={(e) =>
                            setEditablePaymentType(e.target.value)
                          }
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>

                  {editablePaymentType === "partial" && (
                    <div>
                      <label>Amount Paid:</label>
                      <input
                        type="number"
                        value={editableAmountPaid}
                        onChange={(e) => setEditableAmountPaid(e.target.value)}
                        placeholder="Enter amount paid"
                      />
                    </div>
                  )}

                  <button onClick={() => handleUpdatePayment()}>
                    Save Payment Changes
                  </button>

                  {searchedInvoice && (
                    <div>
                      <p>
                        <strong>Amount Paid:</strong> ₹
                        {searchedInvoice.amountPaid.toFixed(2)}
                      </p>
                      <p>
                        <strong>Due Amount:</strong>{" "}
                        {searchedInvoice.dueAmount > 0
                          ? `₹${searchedInvoice.dueAmount.toFixed(2)}`
                          : "No Due Amount"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
