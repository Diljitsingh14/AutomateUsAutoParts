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
import { shopifyClient, shopifyService } from "./shopify/shopifyClient";
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
// Multer config for image uploads
// ------------------------------------------------------------------
const imageUpload = multer({
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

const upload = multer({
  dest: path.join(__dirname, "uploads"),
});

// health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ------------------------------------------------------------------
// Test Shopify Service Utility (Direct Function Calls)
// ------------------------------------------------------------------
app.get("/shopify/test-utility", async (_req: Request, res: Response) => {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // Test 1: Create Product
    results.tests.push({ step: 1, action: "Creating product..." });
    const product = await shopifyService.createDummyProduct();
    results.tests.push({ 
      step: 1, 
      action: "Create Product", 
      status: "✅ SUCCESS", 
      productId: product.id,
      title: product.title 
    });

    // Test 2: Get Product
    results.tests.push({ step: 2, action: "Getting product..." });
    const fetchedProduct = await shopifyService.getProduct(product.id);
    results.tests.push({ 
      step: 2, 
      action: "Get Product", 
      status: "✅ SUCCESS", 
      title: fetchedProduct.title 
    });

    // Test 3: Update Product
    results.tests.push({ step: 3, action: "Updating product..." });
    const updatedProduct = await shopifyService.updateProduct(product.id, {
      title: "UPDATED - Test Product",
      price: "49.99",
      inventory_quantity: 25
    });
    results.tests.push({ 
      step: 3, 
      action: "Update Product", 
      status: "✅ SUCCESS", 
      newTitle: updatedProduct.title,
      newPrice: updatedProduct.variants[0].price 
    });

    // Test 4: Add Image by URL
    results.tests.push({ step: 4, action: "Adding image..." });
    const imageUrl = "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png";
    const image = await shopifyService.addImageByUrl(product.id, imageUrl);
    results.tests.push({ 
      step: 4, 
      action: "Add Image by URL", 
      status: "✅ SUCCESS", 
      imageId: image.id,
      imageSrc: image.src 
    });

    // Test 5: Get All Products
    results.tests.push({ step: 5, action: "Getting all products..." });
    const products = await shopifyService.getProducts(5);
    results.tests.push({ 
      step: 5, 
      action: "Get All Products", 
      status: "✅ SUCCESS", 
      count: products.length 
    });

    // Test 6: Keep Product (Don't Delete - Check Shopify Admin)
    results.tests.push({ 
      step: 6, 
      action: "Product Kept for Verification", 
      status: "✅ SUCCESS", 
      message: `Product ID ${product.id} kept in Shopify. Check Admin Portal!`,
      shopifyAdminUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`
    });

    results.summary = {
      totalTests: 6,
      passed: 6,
      failed: 0,
      status: "✅ ALL TESTS PASSED",
      note: "Product was NOT deleted. Check your Shopify Admin to verify!",
      productId: product.id,
      shopifyAdminUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/products/${product.id}`
    };

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopify Utility Test Results</title>
        <style>
          body { font-family: Arial; max-width: 900px; margin: 50px auto; padding: 20px; background: #f9fafb; }
          h1 { color: #202223; }
          .success { color: #108043; font-weight: bold; }
          .test { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #008060; }
          .summary { background: #e3f1df; padding: 20px; border-radius: 8px; margin-top: 20px; }
          pre { background: #f4f6f8; padding: 15px; border-radius: 4px; overflow-x: auto; }
          .badge { background: #008060; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🧪 Shopify Service Utility Test Results</h1>
        <p>Testing direct usage of <code>shopifyService</code> utility functions</p>
        
        ${results.tests.filter((t: any) => t.status).map((test: any) => `
          <div class="test">
            <span class="badge">Step ${test.step}</span>
            <strong>${test.action}</strong>: <span class="success">${test.status}</span>
            <pre>${JSON.stringify(test, null, 2)}</pre>
          </div>
        `).join('')}
        
        <div class="summary">
          <h2>${results.summary.status}</h2>
          <p>Total Tests: ${results.summary.totalTests}</p>
          <p>Passed: ✅ ${results.summary.passed}</p>
          <p>Failed: ❌ ${results.summary.failed}</p>
          <p style="background: #fff3cd; padding: 15px; border-radius: 4px; margin-top: 15px;">
            <strong>👉 IMPORTANT:</strong> ${results.summary.note}<br>
            <strong>Product ID:</strong> ${results.summary.productId}<br>
            <a href="${results.summary.shopifyAdminUrl}" target="_blank" style="color: #5c6ac4; font-weight: bold;">
              🔗 View Product in Shopify Admin
            </a>
          </p>
        </div>
        
        <h3>Full Results (JSON):</h3>
        <pre>${JSON.stringify(results, null, 2)}</pre>
        
        <p><a href="/shopify/test">← Back to Interactive Test Interface</a></p>
      </body>
      </html>
    `);

  } catch (error: any) {
    results.summary = {
      status: "❌ TEST FAILED",
      error: error.message
    };
    res.status(500).send(`
      <html>
      <body style="font-family: Arial; padding: 50px;">
        <h1>❌ Test Failed</h1>
        <pre>${JSON.stringify(results, null, 2)}</pre>
        <pre>${error.stack}</pre>
      </body>
      </html>
    `);
  }
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
        <title>Shopify CRUD Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; background: #f9fafb; }
            h1 { color: #202223; }
            h2 { color: #5c6ac4; font-size: 18px; margin-top: 30px; border-bottom: 2px solid #5c6ac4; padding-bottom: 10px; }
            .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            button { padding: 10px 20px; margin: 5px; cursor: pointer; background: #5c6ac4; color: white; border: none; border-radius: 4px; font-size: 14px; }
            button:hover { background: #4a5ab3; }
            button.danger { background: #d82c0d; }
            button.danger:hover { background: #bf0711; }
            button.secondary { background: #008060; }
            button.secondary:hover { background: #006e52; }
            input, textarea { padding: 10px; margin: 5px 0; border: 1px solid #c9cccf; border-radius: 4px; font-size: 14px; width: 100%; max-width: 400px; }
            label { display: block; margin-top: 10px; font-weight: 600; color: #202223; }
            .result { margin-top: 20px; padding: 15px; background: #f4f6f8; border-radius: 4px; white-space: pre-wrap; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
            .error { background: #ffebe9; color: #bf0711; border-left: 4px solid #d82c0d; }
            .success { background: #e3f1df; color: #108043; border-left: 4px solid #008060; }
            .form-group { margin: 15px 0; }
            #updateForm { display: none; }
        </style>
    </head>
    <body>
        <h1>🛍️ Shopify CRUD Test Interface</h1>
        
        <!-- SECTION 1: CREATE & LIST -->
        <div class="section">
            <h2>📋 Create & List Products</h2>
            <button onclick="fetchProducts()">Fetch Products</button>
            <button onclick="createProduct()" class="secondary">Create Dummy Product</button>
        </div>

        <!-- SECTION 2: MANAGE BY ID -->
        <div class="section">
            <h2>🔍 Manage Product by ID</h2>
            <div class="form-group">
                <label for="productId">Product ID:</label>
                <input type="text" id="productId" placeholder="Enter Product ID (e.g., 9876543210)" />
            </div>
            <button onclick="getProduct()">Get Product</button>
            <button onclick="deleteProduct()" class="danger">Delete Product</button>
        </div>

        <!-- SECTION 2.5: ADD PRODUCT IMAGE -->
        <div class="section">
            <h2>📷 Add Product Image</h2>
            <div class="form-group">
                <label>Option 1: Image URL</label>
                <input type="text" id="imageUrl" placeholder="https://example.com/image.jpg" />
                <button onclick="addImageByUrl()" class="secondary">Add Image from URL</button>
            </div>
            <div class="form-group" style="margin-top: 20px;">
                <label>Option 2: Upload File (Max 20MB)</label>
                <input type="file" id="imageFile" accept="image/jpeg,image/png,image/gif,image/webp" />
                <button onclick="uploadImageFile()" class="secondary">Upload Image File</button>
            </div>
            <div id="imagePreview" style="margin-top: 15px; display: none;">
                <label>Preview:</label><br>
                <img id="previewImg" style="max-width: 200px; border: 1px solid #c9cccf; border-radius: 4px; margin-top: 10px;" />
            </div>
        </div>

        <!-- SECTION 3: UPDATE FORM -->
        <div class="section" id="updateForm">
            <h2>✏️ Update Product</h2>
            <div class="form-group">
                <label for="updateTitle">Title:</label>
                <input type="text" id="updateTitle" placeholder="Product Title" />
            </div>
            <div class="form-group">
                <label for="updatePrice">Price:</label>
                <input type="text" id="updatePrice" placeholder="29.99" />
            </div>
            <div class="form-group">
                <label for="updateQuantity">Inventory Quantity:</label>
                <input type="number" id="updateQuantity" placeholder="10" />
            </div>
            <div class="form-group">
                <label for="updateVendor">Vendor:</label>
                <input type="text" id="updateVendor" placeholder="Vendor Name" />
            </div>
            <div class="form-group">
                <label for="updateDescription">Description:</label>
                <textarea id="updateDescription" rows="3" placeholder="Product description"></textarea>
            </div>
            <button onclick="updateProduct()" class="secondary">Submit Update</button>
            <button onclick="clearForm()">Clear Form</button>
        </div>

        <!-- RESULTS -->
        <div class="section">
            <h2>📊 Results</h2>
            <div id="result" class="result">Results will appear here...</div>
        </div>

        <script>
            const resultDiv = document.getElementById('result');
            const updateForm = document.getElementById('updateForm');
            const productIdInput = document.getElementById('productId');

            function showResult(data, isError = false) {
                resultDiv.textContent = JSON.stringify(data, null, 2);
                resultDiv.className = isError ? 'result error' : 'result success';
                
                // Auto-populate product ID if created
                if (data.product && data.product.id && !isError) {
                    productIdInput.value = data.product.id;
                }
            }

            async function fetchProducts() {
                resultDiv.textContent = 'Loading...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch('/shopify/products');
                    const data = await response.json();
                    showResult(data, !data.success);
                } catch (error) {
                    showResult({ error: error.message }, true);
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
                    showResult(data, !data.success);
                } catch (error) {
                    showResult({ error: error.message }, true);
                }
            }

            async function getProduct() {
                const productId = productIdInput.value.trim();
                if (!productId) {
                    alert('Please enter a Product ID');
                    return;
                }

                resultDiv.textContent = 'Fetching product...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch(\`/shopify/products/\${productId}\`);
                    const data = await response.json();
                    showResult(data, !data.success);
                    
                    // Populate update form
                    if (data.success && data.product) {
                        updateForm.style.display = 'block';
                        document.getElementById('updateTitle').value = data.product.title || '';
                        document.getElementById('updatePrice').value = data.product.variants?.[0]?.price || '';
                        document.getElementById('updateQuantity').value = data.product.variants?.[0]?.inventory_quantity || '';
                        document.getElementById('updateVendor').value = data.product.vendor || '';
                        document.getElementById('updateDescription').value = data.product.body_html || '';
                    }
                } catch (error) {
                    showResult({ error: error.message }, true);
                }
            }

            async function updateProduct() {
                const productId = productIdInput.value.trim();
                if (!productId) {
                    alert('Please enter a Product ID');
                    return;
                }

                const updateData = {
                    title: document.getElementById('updateTitle').value,
                    price: document.getElementById('updatePrice').value,
                    inventory_quantity: parseInt(document.getElementById('updateQuantity').value),
                    vendor: document.getElementById('updateVendor').value,
                    body_html: document.getElementById('updateDescription').value
                };

                resultDiv.textContent = 'Updating product...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch(\`/shopify/products/\${productId}\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });
                    const data = await response.json();
                    showResult(data, !data.success);
                } catch (error) {
                    showResult({ error: error.message }, true);
                }
            }

            async function deleteProduct() {
                const productId = productIdInput.value.trim();
                if (!productId) {
                    alert('Please enter a Product ID');
                    return;
                }

                if (!confirm(\`Are you sure you want to delete product \${productId}?\`)) {
                    return;
                }

                resultDiv.textContent = 'Deleting product...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch(\`/shopify/products/\${productId}\`, {
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    showResult(data, !data.success);
                    if (data.success) {
                        clearForm();
                    }
                } catch (error) {
                    showResult({ error: error.message }, true);
                }
            }

            function clearForm() {
                productIdInput.value = '';
                document.getElementById('updateTitle').value = '';
                document.getElementById('updatePrice').value = '';
                document.getElementById('updateQuantity').value = '';
                document.getElementById('updateVendor').value = '';
                document.getElementById('updateDescription').value = '';
                updateForm.style.display = 'none';
            }

            async function addImageByUrl() {
                const productId = productIdInput.value.trim();
                const imageUrl = document.getElementById('imageUrl').value.trim();

                if (!productId) {
                    alert('Please enter a Product ID');
                    return;
                }
                if (!imageUrl) {
                    alert('Please enter an Image URL');
                    return;
                }

                resultDiv.textContent = 'Adding image...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch(\`/shopify/products/\${productId}/images/url\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl })
                    });
                    const data = await response.json();
                    showResult(data, !data.success);
                    
                    if (data.success && data.image) {
                        showImagePreview(data.image.src);
                        document.getElementById('imageUrl').value = '';
                    }
                } catch (error) {
                    showResult({ error: error.message }, true);
                }
            }

            async function uploadImageFile() {
                const productId = productIdInput.value.trim();
                const fileInput = document.getElementById('imageFile');
                const file = fileInput.files[0];

                if (!productId) {
                    alert('Please enter a Product ID');
                    return;
                }
                if (!file) {
                    alert('Please select an image file');
                    return;
                }

                // Check file size (20MB)
                if (file.size > 20 * 1024 * 1024) {
                    alert('File size must be less than 20MB');
                    return;
                }

                const formData = new FormData();
                formData.append('image', file);

                resultDiv.textContent = 'Uploading image...';
                resultDiv.className = 'result';
                try {
                    const response = await fetch(\`/shopify/products/\${productId}/images/upload\`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    showResult(data, !data.success);
                    
                    if (data.success && data.image) {
                        showImagePreview(data.image.src);
                        fileInput.value = '';
                    }
                } catch (error) {
                    showResult({ error: error.message }, true);
                }
            }

            function showImagePreview(imageSrc) {
                const preview = document.getElementById('imagePreview');
                const img = document.getElementById('previewImg');
                img.src = imageSrc;
                preview.style.display = 'block';
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
    const products = await shopifyService.getProducts(10);
    res.status(200).json({
      success: true,
      count: products.length,
      products
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
// Get Single Product by ID (GET)
// ------------------------------------------------------------------
app.get("/shopify/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const product = await shopifyService.getProduct(Array.isArray(id) ? id[0] : id);
    res.status(200).json({
      success: true,
      product
    });
  } catch (error: any) {
    console.error("Error fetching product:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ------------------------------------------------------------------
// Create Dummy Product (POST)
// ------------------------------------------------------------------
app.post("/shopify/products", async (_req: Request, res: Response) => {
  try {
    const product = await shopifyService.createDummyProduct();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
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
// Update Product by ID (PUT)
// ------------------------------------------------------------------
app.put("/shopify/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Array.isArray(id) ? id[0] : id;
  const { title, price, inventory_quantity, vendor, body_html } = req.body;

  try {
    const product = await shopifyService.updateProduct(productId, {
      title,
      price,
      inventory_quantity,
      vendor,
      body_html
    });
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error: any) {
    console.error("Error updating product:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ------------------------------------------------------------------
// Delete Product by ID (DELETE)
// ------------------------------------------------------------------
app.delete("/shopify/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Array.isArray(id) ? id[0] : id;

  try {
    const result = await shopifyService.deleteProduct(productId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error deleting product:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ------------------------------------------------------------------
// Add Image to Product by URL (POST)
// ------------------------------------------------------------------
app.post("/shopify/products/:id/images/url", async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Array.isArray(id) ? id[0] : id;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      error: "Image URL is required"
    });
  }

  try {
    const image = await shopifyService.addImageByUrl(productId, imageUrl);
    res.status(201).json({
      success: true,
      message: "Image added successfully",
      image
    });
  } catch (error: any) {
    console.error("Error adding image:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// ------------------------------------------------------------------
// Add Image to Product by File Upload (POST)
// ------------------------------------------------------------------
app.post("/shopify/products/:id/images/upload", imageUpload.single("image"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Array.isArray(id) ? id[0] : id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      error: "No image file uploaded"
    });
  }

  try {
    const image = await shopifyService.uploadImageFile(productId, file.path, file.originalname);
    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image
    });
  } catch (error: any) {
    // Clean up file on error
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    console.error("Error uploading image:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
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
