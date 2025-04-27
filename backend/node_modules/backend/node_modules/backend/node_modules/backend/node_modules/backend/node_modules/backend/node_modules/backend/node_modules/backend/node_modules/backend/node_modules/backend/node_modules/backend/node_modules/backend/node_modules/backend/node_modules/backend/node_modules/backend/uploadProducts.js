const xlsx = require("xlsx");
const fetch = require("node-fetch"); // v2

// 1. Read the Excel file
const workbook = xlsx.readFile("./data.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const products = xlsx.utils.sheet_to_json(worksheet);

// 2. Function to post a product
async function postProduct(product) {
  const newProduct = {
    partNumber: product["Part/Serial Number"] || "",
    description: product["Description/HSN Code"] || "", // corrected mapping
    originalPrice: Number(product["Unit Price (Rs.)"]) || 0,
    gst: 15,
    stock: Number(product["Stock (Qty)"]) || 0,
  };

  try {
    const res = await fetch("http://localhost:5000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Added: ${newProduct.partNumber}`);
    } else {
      console.error(`❌ Failed to add: ${newProduct.partNumber}`, data.error);
    }
  } catch (error) {
    console.error(`❌ Error adding: ${newProduct.partNumber}`, error.message);
  }
}

// 3. Loop through and add all products
async function main() {
  console.log(products[0]); // <-- Inspect this if needed
  for (let product of products) {
    await postProduct(product);
  }
}

main();
