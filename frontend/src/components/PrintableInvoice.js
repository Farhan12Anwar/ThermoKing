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
      .invoice-container {
        padding: 20px 20px 20px 10px;
        margin: 0 auto;
        max-width: 800px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 13px;
        color: #000;
        background-color: #fff;
        page-break-before: always; /* Ensure page break before printing */
      }

      .invoice-title {
        text-align: center;
        margin-bottom: 0.3rem;
        font-size: 16px;
        font-weight: bold;
      }

      .gstin-info,
      .invoice-number {
        text-align: center;
        font-size: 11px;
      }

      .header-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px; /* Ensure there's spacing between sections */
      }

      .company-logo img {
        max-width: 150px !important; /* Reduced size */
        height: auto !important;
      }

      .company-info {
        text-align: right;
        padding-left: 20px;
      }

      .customer-details {
        display: flex;
        margin-top: 1rem;
        font-size: 11px;
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
      }

      .customer-left,
      .customer-right {
        width: 48%;
        padding: 8px;
      }

      .customer-left {
        padding-right: 8px;
        border-right: 1px solid black;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        border: 1px solid #000;
        font-size: 11px;
        padding:20px;
      }

      .items-table th,
      .items-table td {
        padding: 4px 6px;
        text-align: left;
        border: 1px solid #000;
        vertical-align: middle;
        white-space: nowrap;
      }

      .items-table th {
        background-color: #f0f0f0;
        font-weight: bold;
        text-align: center;
        align-items: center;
      }

      .service-charges-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        font-size: 11px;
        align-items: center;
      }

      .service-charges-table th,
      .service-charges-table td {
        padding: 4px 8px;
        text-align: center;
        border: 1px solid #000;
      }

      .total-section {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
      }

      .total-values {
        border: 1px solid black;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: bold;
        width: 200px;
        text-align: right;
        background-color: #f9f9f9;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        margin: 0;
        font-family: 'Times New Roman', Times, serif;
      }
    }
  `}
        </style>

        <h2 className="invoice-title">GST INVOICE</h2>
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
              Telangana Refrigeration & Air Conditioning Services
            </strong>
            <br />
            <strong className="company-name">
              ThermoKing Authorized Service Center
            </strong>
            <br />
            Plot No.2-24/2, Gagilapur Village, Dundigal
            <br />
            Hyderabad, Medchal, Malkajgiri District, Telangana - 500043
            <br />
            <strong>Invoice Date:</strong> {date}
            <br />
            <strong>Invoice Type:</strong> GST Invoice
            {/* <p>
              <strong>Payment Type:</strong> {paymentType}
            </p> */}
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
                  <th
                    className="desc"
                    style={{ border: "1px solid #000", padding: "5px" }}
                  >
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
