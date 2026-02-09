import axios from "axios";
import fs from "fs";

const {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_ADMIN_TOKEN,
  SHOPIFY_API_VERSION,
} = process.env;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
  throw new Error("Shopify env vars not configured");
}

// ============================================================================
// SHOPIFY API CLIENT
// ============================================================================
export const shopifyClient = axios.create({
  baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`,
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ============================================================================
// SHOPIFY SERVICE - Unified utility for all Shopify operations
// ============================================================================

/**
 * ShopifyService class - Handles CRUD operations and media management
 */
export class ShopifyService {
  
  /**
   * Create a new product in Shopify
   * @param productData - Product details (title, price, vendor, variants, etc.)
   * @returns Created product data
   */
  async createProduct(productData: any) {
    const response = await shopifyClient.post("/products.json", { product: productData });
    return response.data.product;
  }

  /**
   * Get list of products from Shopify
   * @param limit - Maximum number of products to fetch (default: 10)
   * @returns Array of products
   */
  async getProducts(limit: number = 10) {
    const response = await shopifyClient.get(`/products.json?limit=${limit}`);
    return response.data.products;
  }

  /**
   * Get a single product by ID
   * @param productId - Shopify product ID
   * @returns Product data
   */
  async getProduct(productId: string) {
    const response = await shopifyClient.get(`/products/${productId}.json`);
    return response.data.product;
  }

  /**
   * Update an existing product
   * @param productId - Shopify product ID
   * @param updates - Fields to update (title, price, inventory_quantity, vendor, body_html)
   * @returns Updated product data
   */
  async updateProduct(productId: string, updates: {
    title?: string;
    price?: string;
    inventory_quantity?: number;
    vendor?: string;
    body_html?: string;
  }) {
    const updateData: any = { product: {} };
    
    if (updates.title) updateData.product.title = updates.title;
    if (updates.vendor) updateData.product.vendor = updates.vendor;
    if (updates.body_html) updateData.product.body_html = updates.body_html;
    
    if (updates.price || updates.inventory_quantity !== undefined) {
      updateData.product.variants = [{}];
      if (updates.price) updateData.product.variants[0].price = updates.price;
      if (updates.inventory_quantity !== undefined) {
        updateData.product.variants[0].inventory_quantity = updates.inventory_quantity;
      }
    }

    const response = await shopifyClient.put(`/products/${productId}.json`, updateData);
    return response.data.product;
  }

  /**
   * Delete a product from Shopify
   * @param productId - Shopify product ID
   * @returns Success status
   */
  async deleteProduct(productId: string) {
    await shopifyClient.delete(`/products/${productId}.json`);
    return { success: true, message: `Product ${productId} deleted successfully` };
  }

  /**
   * Add image to product using a URL
   * @param productId - Shopify product ID
   * @param imageUrl - Public URL of the image
   * @returns Image data
   */
  async addImageByUrl(productId: string, imageUrl: string) {
    const response = await shopifyClient.post(`/products/${productId}/images.json`, {
      image: {
        src: imageUrl,
        alt: "Product image"
      }
    });
    return response.data.image;
  }

  /**
   * Upload image file to product
   * @param productId - Shopify product ID
   * @param filePath - Path to image file on server
   * @param filename - Original filename
   * @returns Image data
   */
  async uploadImageFile(productId: string, filePath: string, filename: string) {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await shopifyClient.post(`/products/${productId}/images.json`, {
      image: {
        attachment: base64Image,
        filename: filename
      }
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return response.data.image;
  }

  /**
   * Create a dummy test product (for testing purposes)
   * @returns Created product data
   */
  async createDummyProduct() {
    const dummyProduct = {
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
    };

    return await this.createProduct(dummyProduct);
  }
}

// Export singleton instance
export const shopifyService = new ShopifyService();

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Import the service
import { shopifyService } from './shopify/shopifyClient';

// EXAMPLE 1: Create a product
const product = await shopifyService.createProduct({
  title: "Premium Oil Filter",
  body_html: "<strong>High-quality oil filter</strong>",
  vendor: "AutoParts Pro",
  product_type: "Auto Parts",
  tags: ["oil-filter", "maintenance"],
  variants: [{
    price: "34.99",
    sku: "OIL-FILTER-001",
    inventory_quantity: 50,
    inventory_management: "shopify"
  }]
});

// EXAMPLE 2: Get all products
const products = await shopifyService.getProducts(20);

// EXAMPLE 3: Get single product
const product = await shopifyService.getProduct(productId);

// EXAMPLE 4: Update product
const updated = await shopifyService.updateProduct(productId, {
  title: "Updated Premium Oil Filter",
  price: "39.99",
  inventory_quantity: 75
});

// EXAMPLE 5: Delete product
await shopifyService.deleteProduct(productId);

// EXAMPLE 6: Add image by URL
const image = await shopifyService.addImageByUrl(
  productId,
  "https://example.com/image.jpg"
);

// EXAMPLE 7: Upload image file
const image = await shopifyService.uploadImageFile(
  productId,
  "/path/to/image.jpg",
  "product-image.jpg"
);

// EXAMPLE 8: Create dummy test product
const testProduct = await shopifyService.createDummyProduct();

// COMPLETE WORKFLOW
async function completeWorkflow() {
  // Create product
  const product = await shopifyService.createDummyProduct();
  
  // Add image
  await shopifyService.addImageByUrl(product.id, "https://...");
  
  // Update product
  await shopifyService.updateProduct(product.id, {
    price: "49.99",
    inventory_quantity: 100
  });
  
  // Get product
  const fetched = await shopifyService.getProduct(product.id);
  
  // Delete product
  await shopifyService.deleteProduct(product.id);
}
*/
