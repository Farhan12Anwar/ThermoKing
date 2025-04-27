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
    margin: "", // 🛠 add margin
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
  
    fetchProducts(); // 👈 call fetchProducts here too on mount
  }, [invoiceItems]);
  
  const fetchProducts = () => {
    fetch(`http://localhost:5000/products?search=${search}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Failed to fetch products:", error));
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
  
    if (!form) {
      console.error("Form is empty or null!");
      return;
    }
  
    const newProduct = {
      partNumber: form.partNumber || "",
      description: form.description || "",
      originalPrice: Number(form.originalPrice ?? 0),
      gst: Number(form.gst ?? 0),
      margin: Number(form.margin ?? 0),
      stock: Number(form.stock ?? 0),
    };
  
    try {
      const response = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save product to database");
      }
  
      const savedProduct = await response.json(); // Get the saved product returned from backend
  
      setProducts([...products, savedProduct]); // Update your local products list
      setForm({
        partNumber: "",
        description: "",
        originalPrice: "",
        gst: "",
        margin: "",
        stock: "",
      });
  
      console.log("Product saved successfully ✅");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product!");
    }
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
    try {
      await fetch(`/api/products/${editForm._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      // 🔥 After successful update, update your local products state
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === editForm._id ? { ...editForm } : product
        )
      );

      setEditForm(null); // exit edit mode
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const addToInvoice = (product) => {
    if (!product) {
      console.error("Product is null or undefined!");
      return;
    }

    if (product.stock <= 0) {
      alert("Out of stock!");
      return;
    }

    const marginPercent = Number(product?.margin ?? 0);
    const gstPercent = Number(product?.gst ?? 0);
    const originalPrice = Number(product?.originalPrice ?? 0);

    const unitPrice = originalPrice * (1 + marginPercent / 100);
    const priceWithGST = unitPrice * (1 + gstPercent / 100);

    const existingItemIndex = invoiceItems.findIndex(
      (item) => item._id === product._id
    );

    let updatedItems;
    if (existingItemIndex > -1) {
      updatedItems = [...invoiceItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].totalPrice = Number(
        updatedItems[existingItemIndex].quantity *
          updatedItems[existingItemIndex].priceWithGST
      );
    } else {
      updatedItems = [
        ...invoiceItems,
        {
          ...product,
          quantity: 1,
          unitPrice: Number(unitPrice.toFixed(2)),
          priceWithGST: Number(priceWithGST.toFixed(2)),
          totalPrice: Number(priceWithGST.toFixed(2)),
        },
      ];
    }

    setInvoiceItems(updatedItems);

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
    });

    try {
      const response = await fetch("http://localhost:5000/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: invoiceItems,
          invoiceNumber,
          customer,
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

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

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
            {[
              "partNumber",
              "description",
              "originalPrice",
              "gst",
              "margin",
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

                <button onClick={done}>Done</button>
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
                      "margin",
                      "stock",
                    ].map((field) => (
                      <div key={field} className="input-group">
                        <label htmlFor={field}>{field}</label>
                        <input
                          id={field}
                          name={field}
                          type={
                            field === "originalPrice" ||
                            field === "gst" ||
                            field === "margin" ||
                            field === "stock"
                              ? "number"
                              : "text"
                          }
                          value={editForm[field] || ""}
                          onChange={handleEditChange}
                          placeholder={`Enter ${field}`}
                          required
                        />
                      </div>
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
                      <p>
                        Original: ₹{product.originalPrice} | Final Price: ₹
                        {(
                          Number(product.originalPrice) *
                          (1 +
                            ((Number(product.gst) || 0) +
                              (Number(product.margin) || 0)) /
                              100)
                        ).toFixed(2)}
                      </p>
                    </p>

                    <p>
                      GST: {product.gst}% | Margin: {product.margin}%
                    </p>

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
    </div>
  );
};

export default App;
