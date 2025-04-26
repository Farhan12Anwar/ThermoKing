import React from "react";
import "./PrintableInvoice.css";

const PrintableInvoice = React.forwardRef(
  (
    {
      items,
      customer,
      invoiceNumber,
      paymentType,
      setPaymentType,
      amountPaid,
      setAmountPaid,
      serviceCharges, // ✅ get it here
    },
    ref
  ) => {
    const total = items.reduce(
      (sum, item) => sum + item.priceWithGST * item.quantity,
      0
    );
    const date = new Date().toLocaleDateString();

    const cellStyle = {
      border: "1px solid #000",
      padding: "10px",
    };

    // Sum all service charges
    const totalServiceCharges = serviceCharges.reduce(
      (sum, charge) => sum + (charge.price || 0),
      0
    );

    const grandTotal = total + total * 0.18 + totalServiceCharges;
    // console.log(serviceChargesTotal, "service charges total");
    console.log(grandTotal, "grand total");
    return (
      <div className="invoice-container" ref={ref}>
        <style>
          {`
    @media print {
  .header-and-customer {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    border: none;
    justify-content: center;
  }

  .invoice-title {
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 18px;
    font-weight: bold;
}

.gstin-info {
    text-align: center;
    margin-top: 0;
    font-size: 12px;
}

.invoice-number {
    text-align: center;
    font-size: 14px;
    margin-top: 0.5rem;
}

  .header-section {
    flex: 2;
    display: flex;
    align-items: center;
  }

  .company-logo img {
    max-width: 150px !important;
    height: auto !important;
  }

  .company-info {
    line-height: 1.4;
     text-align: right;
     padding-left:130px;
  }

  .vertical-divider {
    width: 1px;
    background-color: black;
    height: auto;
    margin: 0 15px;
  }

  .customer-details {
    flex: 2;
    display: flex;
    flex-direction: row; /* Change to row instead of column */
    border: 1px solid black;
    font-size: 12px;
  }

  .total-values {
  text-align: right;
    border-top: 1px solid black;
    padding-top: 0.5rem;
    font-weight: bold;
    font-size: 15px;
}

  .customer-left,
  .customer-right {
    width: 48%;
    padding : 10px;
  }

  .customer-left {
    padding-right: 10px;
    border-right: 1px solid black;
  }

  .customer-right {
    padding-left: 10px;
    margin-left: auto; /* This pushes it to the right */
  }

  .customer-left p,
  .customer-right p {
    margin: 4px 0;
  }

  .total-section {
    margin-top: 1.5rem;
    display: flex
;
    justify-content: flex-end;
}

  .horizontal-divider {
    width: 100%;
    height: 1px;
    background-color: black;
    margin: 10px 0;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
  }
}

  `}
        </style>

        <h2 className="invoice-title">TAX INVOICE</h2>
        <p className="gstin-info">
          GSTIN: <strong>36cispm5742f1zu</strong>
        </p>
        <p className="invoice-number">
          <strong>Invoice No.:</strong> {invoiceNumber || "Loading..."}
        </p>
        <div className="header-section">
          <div className="company-logo">
            <img
              src="https://1000logos.net/wp-content/uploads/2022/12/Thermo-King-Logo-1965.png"
              alt="Company Logo"
              width="300"
            />
          </div>

          <div className="company-info">
            <strong className="company-name">
              Telangana Transport Refrigeration & Air Conditioning Services
            </strong>
            <br />
            Plot No.2-24/2, Gagilapur Village, Dundigal
            <br />
            Hyderabad, Medchal, Malkajgiri District, Telangana - 500043
            <br />
            <strong>Invoice Date:</strong> {date}
            <br />
            <strong>Invoice Type:</strong> Tax Invoice
            <p>
              <strong>Payment Type:</strong> {paymentType}
            </p>
            {paymentType === "Partial" && (
              <p>
                <strong>Amount Paid:</strong> ₹{amountPaid}
              </p>
            )}
          </div>
        </div>

        <div className="customer-details">
          <div className="customer-left">
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

          <div className="vertical-line"></div>

          <div className="customer-right">
            <strong>Vehicle Registration No.:</strong>{" "}
            {customer?.vehicleRegistrationNo}
            <br />
            <strong>Unit Model:</strong> {customer?.unitModel}
            <br />
            <strong>Hour Meter:</strong> {customer?.hourMeter}
          </div>
        </div>

        {/* Payment Type Section */}
        <div className="payment-type-section">
          <h4>Select Payment Type:</h4>
          <div className="payment-options">
            {["cash", "credit", "partial"].map((type) => (
              <label
                key={type}
                className={`payment-option ${
                  paymentType === type ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value={type}
                  checked={paymentType === type}
                  onChange={(e) => setPaymentType(e.target.value)}
                  style={{ display: "none" }}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>

          {paymentType === "partial" && (
            <div className="amount-paid-input">
              <label>Amount Paid:</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter amount paid"
              />
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              {[
                "S. No",
                "Part # / HSN/SAC Code",
                "Description",
                "Qty",
                "Unit Price",
                "GST %",
                "GST Amount",
                "Total (With GST)",
              ].map((header, idx) => (
                <th
                  key={idx}
                  style={{ ...cellStyle, backgroundColor: "#f0f0f0" }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const gstAmount =
                (item.originalPrice * item.quantity * item.gst) / 100;
              const totalWithGST = (item.priceWithGST ?? 0) * item.quantity;

              return (
                <tr key={index}>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>
                    {item.partNumber} {item.hsnCode}
                  </td>
                  <td style={cellStyle}>{item.description}</td>
                  <td style={cellStyle}>{item.quantity}</td>
                  <td style={cellStyle}>
                    ₹{item.priceWithGST ? item.priceWithGST.toFixed(2) : "0.00"}
                  </td>
                  <td style={cellStyle}>{item.gst}%</td>
                  <td style={cellStyle}>₹{gstAmount.toFixed(2)}</td>
                  <td style={cellStyle}>₹{totalWithGST.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Service Charges Section */}
        {serviceCharges.length > 0 && (
          <div className="service-charge-section">
            <h4>Service Charges:</h4>
            <table
              className="service-charges-table"
              style={{ marginTop: "10px" }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000", padding: "5px" }}>
                    Description
                  </th>
                  <th style={{ border: "1px solid #000", padding: "5px" }}>
                    Price (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceCharges.map((charge, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #000", padding: "5px" }}>
                      {charge.description}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "5px" }}>
                      ₹{charge.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Section */}
        <div className="total-section">
          <div className="total-values">
            <p>Taxable Value: ₹{total.toFixed(2)}</p>
            <p>GST @ 18%: ₹{(total * 0.18).toFixed(2)}</p>
            <p>Service Charges: ₹{totalServiceCharges.toFixed(2)}</p>
            <p>
              <strong>Grand Total: ₹{grandTotal.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default PrintableInvoice;
