import React, { useEffect, useState } from "react";
import "./PrintableInvoice.css";

const PrintableInvoice = React.forwardRef(
  (
    { items, customer, invoiceNumber, paymentType, amountPaid, serviceCharges },
    ref
  ) => {
    const [localItems, setLocalItems] = useState(items);

    useEffect(() => {
      // Initialize localItems with original prices
      const initializedItems = items.map((item) => ({
        ...item,
        margin: item.margin || 0,
        originalPrice: item.originalPrice ?? item.price ?? 0,
      }));
      setLocalItems(initializedItems);
    }, [items]);

    const date = new Date().toLocaleDateString();

    const handleMarginChange = (index, newMargin) => {
      const updatedItems = [...localItems];
      updatedItems[index].margin = parseFloat(newMargin) || 0;
      setLocalItems(updatedItems);
    };

    const totalServiceCharges = serviceCharges.reduce(
      (sum, charge) => sum + (charge.price || 0),
      0
    );

    // Calculate all totals properly
    const totals = localItems.reduce(
      (acc, item) => {
        const quantity = item.quantity ?? 1;
        const basePrice = (item.originalPrice ?? 0) * quantity;
        const gstAmount =
          (((item.originalPrice ?? 0) * (item.gst ?? 0)) / 100) * quantity;
        const marginAmount =
          (((item.originalPrice ?? 0) * (item.margin ?? 0)) / 100) * quantity;

        acc.taxableValue += basePrice;
        acc.totalGST += gstAmount;
        acc.totalMargin += marginAmount;
        return acc;
      },
      { taxableValue: 0, totalGST: 0, totalMargin: 0 }
    );

    const grandTotal =
      totals.taxableValue +
      totals.totalGST +
      totals.totalMargin +
      totalServiceCharges;

    const cellStyle = {
      border: "1px solid #000",
      padding: "8px",
    };

    return (
      <>
       {/* Margin Editing Section */}
       <div className="edit-margins-section" style={{ marginBottom: "20px" }}>
          <h3>Edit Margins</h3>
          {localItems.map((item, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>{item.description}</strong> (Part #: {item.partNumber}) -
              Margin:{" "}
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.margin || 0}
                onChange={(e) => handleMarginChange(index, e.target.value)}
                style={{ width: "60px", marginLeft: "10px" }}
              />
              %
            </div>
          ))}
        </div>
      
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
              page-break-before: always;
            }
            .invoice-title { text-align: center; margin-bottom: 0.3rem; font-size: 16px; font-weight: bold; }
            .gstin-info, .invoice-number { text-align: center; font-size: 11px; }
            .header-section { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .company-logo img { max-width: 150px; height: auto; }
            .company-info { text-align: right; padding-left: 20px; }
            .customer-details { display: flex; margin-top: 1rem; font-size: 11px; border-top: 1px solid #000; border-bottom: 1px solid #000; }
            .customer-left, .customer-right { width: 48%; padding: 8px; }
            .customer-left { padding-right: 8px; border-right: 1px solid black; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 1rem; border: 1px solid #000; font-size: 11px; }
            .items-table th, .items-table td { padding: 4px 6px; text-align: left; border: 1px solid #000; vertical-align: middle; white-space: nowrap; }
            .items-table th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .service-charges-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 11px; }
            .service-charges-table th, .service-charges-table td { padding: 4px 8px; text-align: center; border: 1px solid #000; }
            .total-section { margin-top: 10px; display: flex; justify-content: flex-end; }
            .total-values { border: 1px solid black; padding: 8px 12px; font-size: 12px; font-weight: bold; width: 200px; text-align: right; background-color: #f9f9f9; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; font-family: 'Times New Roman', Times, serif; }
          }
        `}
        </style>

       

        {/* Invoice Header */}
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
              width="250"
            />
          </div>
          <div className="company-info">
            <strong>Telangana Refrigeration & Air Conditioning Services</strong>
            <br />
            ThermoKing Authorized Service Center
            <br />
            Plot No.2-24/2, Gagilapur Village, Dundigal
            <br />
            Hyderabad, Telangana - 500043
            <br />
            <strong>Invoice Date:</strong> {date}
            <br />
            <strong>Invoice Type:</strong> GST Invoice
            <br />
            {paymentType === "Partial" && (
              <p>
                <strong>Amount Paid:</strong> ₹{amountPaid}
              </p>
            )}
          </div>
        </div>

        {/* Customer Details */}
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
              <th style={cellStyle}>S. No</th>
              <th style={cellStyle}>Part # / HSN/SAC Code</th>
              <th style={cellStyle}>Description</th>
              <th style={cellStyle}>Qty</th>
              <th style={cellStyle}>Unit Price (₹)</th>
              <th style={cellStyle}>GST %</th>
              <th style={cellStyle}>GST Amount (₹)</th>
              <th style={cellStyle}>Line Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item, index) => {
              const quantity = item.quantity ?? 1;
              const basePrice = (item.originalPrice ?? 0) * quantity;
              const gstAmount =
                (((item.originalPrice ?? 0) * (item.gst ?? 0)) / 100) *
                quantity;
              const lineTotal = basePrice + gstAmount;

              return (
                <tr key={index}>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>
                    {item.partNumber} / {item.hsnCode}
                  </td>
                  <td style={cellStyle}>{item.description}</td>
                  <td style={cellStyle}>{quantity}</td>
                  <td style={cellStyle}>
                    ₹{(item.originalPrice ?? 0).toFixed(2)}
                  </td>
                  <td style={cellStyle}>{item.gst}%</td>
                  <td style={cellStyle}>₹{gstAmount.toFixed(2)}</td>
                  <td style={cellStyle}>₹{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Service Charges Section */}
        {serviceCharges.length > 0 && (
          <div className="service-charge-section">
            <h4>Service Charges:</h4>
            <table className="service-charges-table">
              <thead>
                <tr>
                  <th style={cellStyle}>Description</th>
                  <th style={cellStyle}>Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {serviceCharges.map((charge, index) => (
                  <tr key={index}>
                    <td style={cellStyle}>{charge.description}</td>
                    <td style={cellStyle}>₹{charge.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Section */}
        <div className="total-section">
          <div className="total-values">
            <p>Taxable Value: ₹{totals.taxableValue.toFixed(2)}</p>
            <p>GST Total: ₹{totals.totalGST.toFixed(2)}</p>
            <p>Margin Added: ₹{totals.totalMargin.toFixed(2)}</p>
            <p>Service Charges: ₹{totalServiceCharges.toFixed(2)}</p>
            <p>
              <strong>Grand Total: ₹{grandTotal.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      </div>
      </>
    );
  }
);

export default PrintableInvoice;
