import express, {Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import XLSX from "xlsx";
import { downloadPartsByMake, downloadPartsByServiceId } from "./db/intractor";
import { convertToExcel } from "./utils/helper";
import fs from "fs";
import { all_makes } from "./constants/makes";
import { shopifyClient } from "./shopify/shopifyClient";
import axios from "axios";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------------------------------------------------------
// Multer config
// ------------------------------------------------------------------
const upload = multer({
  dest: path.join(__dirname, "uploads"),
});

// health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ------------------------------------------------------------------
// Shopify OAuth Routes
// ------------------------------------------------------------------
app.get("/shopify/install", (_req: Request, res: Response) => {
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = `${process.env.NGROK_URL}/shopify/callback`;
  const scopes = "write_products,read_products,write_inventory,read_inventory";

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
  
  res.redirect(installUrl);
});

app.get("/shopify/callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  
  try {
    const tokenResponse = await axios.post(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code
      }
    );

    const accessToken = tokenResponse.data.access_token;
    
    res.send(`
      <html>
        <head><title>Success!</title></head>
        <body style="font-family: Arial; padding: 50px;">
          <h1 style="color: green;">✅ Success!</h1>
          <p>Copy this token to your .env file:</p>
          <pre style="background: #f4f4f4; padding: 20px; border-radius: 5px; font-size: 14px;">SHOPIFY_ACCESS_TOKEN=${accessToken}</pre>
          <p>Then restart your server and test at <a href="/shopify/test">/shopify/test</a></p>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`<h1>Error</h1><pre>${JSON.stringify(error.response?.data || error.message, null, 2)}</pre>`);
  }
});

// ------------------------------------------------------------------
// Shopify Test Interface
// ------------------------------------------------------------------
app.get("/shopify/test", (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopify Integration Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            button { padding: 10px 20px; margin: 10px 5px; cursor: pointer; background: #5c6ac4; color: white; border: none; border-radius: 4px; }
            button:hover { background: #4a5ab3; }
            .result { margin-top: 20px; padding: 15px; background: #f4f6f8; border-radius: 4px; white-space: pre-wrap; }
            .error { background: #ffebe9; color: #bf0711; }
            .success { background: #e3f1df; color: #108043; }
        </style>
    </head>
    <body>
        <h1>Shopify Integration Test</h1>
        <div>
            <button onclick="fetchProducts()">Fetch Products</button>
            <button onclick="createProduct()">Create Dummy Product</button>
        </div>
        <div id="result" class="result"></div>

        <script>
            const resultDiv = document.getElementById('result');

            async function fetchProducts() {
                resultDiv.textContent = 'Loading...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch('/shopify/products');
                    const data = await response.json();
                    resultDiv.textContent = JSON.stringify(data, null, 2);
                    resultDiv.className = 'result success';
                } catch (error) {
                    resultDiv.textContent = 'Error: ' + error.message;
                    resultDiv.className = 'result error';
                }
            }

            async function createProduct() {
                resultDiv.textContent = 'Creating product...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch('/shopify/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await response.json();
                    resultDiv.textContent = JSON.stringify(data, null, 2);
                    resultDiv.className = 'result success';
                } catch (error) {
                    resultDiv.textContent = 'Error: ' + error.message;
                    resultDiv.className = 'result error';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// ------------------------------------------------------------------
// Fetch Shopify Products (GET)
// ------------------------------------------------------------------
app.get("/shopify/products", async (_req: Request, res: Response) => {
  try {
    const response = await shopifyClient.get("/products.json?limit=5");
    res.status(200).json({
      success: true,
      count: response.data.products.length,
      products: response.data.products
    });
  } catch (error: any) {
    console.error("Error fetching products:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ------------------------------------------------------------------
// Create Dummy Product (POST)
// ------------------------------------------------------------------
app.post("/shopify/products", async (_req: Request, res: Response) => {
  const dummyProduct = {
    product: {
      title: `Test Auto Part - ${Date.now()}`,
      body_html: "<strong>Test product for integration testing</strong>",
      vendor: "AutoParts Test",
      product_type: "Auto Parts",
      tags: ["test", "auto-parts"],
      variants: [
        {
          price: "29.99",
          sku: `TEST-${Date.now()}`,
          inventory_quantity: 10,
          inventory_management: "shopify"
        }
      ]
    }
  };

  try {
    const response = await shopifyClient.post("/products.json", dummyProduct);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: response.data.product
    });
  } catch (error: any) {
    console.error("Error creating product:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// Root upload form
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload Excel/CSV File</title>
    </head>
    <body>
        <h1>Upload Excel/CSV File</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="excelFile" accept=".xlsx, .xls, .csv" required />
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
  `);
});

// ------------------------------------------------------------------
// Upload Excel / CSV
// ------------------------------------------------------------------
// app.post(
//   "/upload",
//   upload.single("excelFile"),
//   async (req: Request, res: Response) => {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).send("No file uploaded.");
//     }

//     try {
//       const workbook = XLSX.readFile(file.path);
//       const sheetName = workbook.SheetNames[0];
//       const data = XLSX.utils.sheet_to_json<any>(
//         workbook.Sheets[sheetName],
//         { header: true }
//       );

//       console.log(data);

//       if (!data.length) {
//         return res
//           .status(400)
//           .send("The uploaded file is empty or invalid.");
//       }

//       if (!Object.prototype.hasOwnProperty.call(
//         data[0],
//         "OEM REF NO LONGFORM"
//       )) {
//         return res
//           .status(400)
//           .send('Column "OEM REF NO LONGFORM" not found.');
//       }

//       const processedData = await Promise.all(
//         data.map(async (row: any) => {
//           let temp;
//           const oemRefNo = row["OEM REF NO LONGFORM"];
//           if (!oemRefNo) return row;

//           try {
//             const response = await fetchPartDetails(oemRefNo);
//             const API_Response = response[0];
//             temp = { ...row, ...API_Response };
//           } catch (error) {
//             temp = { row, error };
//           }

//           return temp;
//         })
//       );

//       const newWorkbook = XLSX.utils.book_new();
//       const newWorksheet =
//         XLSX.utils.json_to_sheet(processedData);

//       XLSX.utils.book_append_sheet(
//         newWorkbook,
//         newWorksheet,
//         "Processed Data"
//       );

//       const outputFilePath = path.join(
//         __dirname,
//         "uploads",
//         "ProcessedData.xlsx"
//       );

//       XLSX.writeFile(newWorkbook, outputFilePath);

//       res.download(outputFilePath, "ProcessedData.xlsx", (err) => {
//         if (err) console.error("Error sending file:", err);
//         fs.unlinkSync(file.path);
//         fs.unlinkSync(outputFilePath);
//       });
//     } catch (error) {
//       console.error("Error processing file:", error);
//       res.status(500).send("Error processing the file.");
//     }
//   }
// );

// ------------------------------------------------------------------
// Parts by Make (GET form)
// ------------------------------------------------------------------
app.get("/parts-by-make", (_req: Request, res: Response) => {
  const options = all_makes
    .map(
      (make: any) =>
        `<option value="${make.Id}">${make.Value}</option>`
    )
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Select Make</title>
    </head>
    <body>
        <h1>Select Vehicle Make</h1>
        <form action="/parts-by-make" method="post">
            <label for="make">Choose a make:</label>
            <select id="make" name="make" required>
                ${options}
            </select>
            <button type="submit">Download Parts</button>
        </form>
    </body>
    </html>
  `);
});

// ------------------------------------------------------------------
// Parts by Service Line (GET form)
// ------------------------------------------------------------------
app.get(
  "/parts-by-service-line",
  (_req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Select Service Line</title>
      </head>
      <body>
          <h1>Select Service Line</h1>
          <form action="/parts-by-service-line" method="post">
              <label for="serviceLine">Enter serviceLine ID:</label>
              <input id="serviceLine" name="serviceLine" type="text" required />
              <button type="submit">Download Parts</button>
          </form>
      </body>
      </html>
    `);
  }
);

// ------------------------------------------------------------------
// Parts by Make (POST)
// ------------------------------------------------------------------
app.post(
  "/parts-by-make",
  async (req: Request, res: Response) => {
    const makeId = parseInt(req.body.make, 10);
    const make = all_makes.find(
      (m: any) => m.Id == makeId
    );

    if (!makeId || !make) {
      return res.status(400).send("Invalid make selected.");
    }

    try {
      const partsArray = await downloadPartsByMake(
        makeId,
        false,
        true
      );

      if (!partsArray || partsArray.length === 0) {
        return res
          .status(404)
          .send("No parts found for the selected make.");
      }

      const fileName_ = `${make.Value}-PartsDetails.xlsx`;
      const fileName = path.join(__dirname, fileName_);

      convertToExcel(partsArray, fileName);

      res.download(fileName, fileName_, (err) => {
        if (err) console.error("Error sending file:", err);
        fs.unlinkSync(fileName);
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res
        .status(500)
        .send("An error occurred while processing your request.");
    }
  }
);

// ------------------------------------------------------------------
// Parts by Service Line (POST)
// ------------------------------------------------------------------
app.post(
  "/parts-by-service-line",
  async (req: Request, res: Response) => {
    const serviceLine: string = req.body.serviceLine;

    if (!serviceLine) {
      return res
        .status(400)
        .send("Invalid serviceLine received.");
    }

    try {
      const partsArray =
        await downloadPartsByServiceId(serviceLine);

      if (!partsArray || partsArray.length === 0) {
        return res
          .status(404)
          .send("No parts found for the selected service line.");
      }

      const fileName_ = `${serviceLine}-PartsDetails.xlsx`;
      const fileName = path.join(__dirname, fileName_);

      convertToExcel(partsArray, fileName);

      res.download(fileName, fileName_, (err) => {
        if (err) console.error("Error sending file:", err);
        fs.unlinkSync(fileName);
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res
        .status(500)
        .send("An error occurred while processing your request.");
    }
  }
);

export default app;
