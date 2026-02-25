# AutoParts E-commerce Platform

A full-stack e-commerce application for auto parts, featuring a Next.js frontend and Express backend integrated with Shopify.

## 🚀 Features

- **Product Catalog**: Browse auto parts from Shopify with images and details
- **Advanced Search**: Search products by title, description, or tags
- **Price Filters**: Filter products by min/max price range
- **Product Details**: View detailed product information with image gallery
- **Shopping Cart**: Add/remove items, adjust quantities, persistent cart storage
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Real-time Shopify Integration**: Products pulled directly from your Shopify store

## 📋 Prerequisites

- Node.js 18+ installed
- A Shopify store with Admin API access
- MongoDB database (for backend data)

## 🛠️ Installation

### 1. Backend Setup (Port 4000)

```bash
cd part-integration-service
npm install

# Configure environment variables
# Edit the .env file with your Shopify credentials:
# - SHOPIFY_STORE_DOMAIN
# - SHOPIFY_ADMIN_TOKEN
# - SHOPIFY_API_VERSION
# - MONGO_URI

npm run dev
```

The backend API will run on `http://localhost:4000`

### 2. Frontend Setup (Port 3000)

```bash
cd AutoParts/autoparts-app
npm install

# Environment is already configured in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000

npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 Usage

1. **Start Backend**: Open a terminal and run the backend server on port 4000
2. **Start Frontend**: Open another terminal and run the Next.js app on port 3000
3. **Browse Products**: Visit `http://localhost:3000` and click "Shop Now"
4. **Search & Filter**: Use the search bar and price filters on the products page
5. **View Details**: Click any product to see full details
6. **Add to Cart**: Click "Add to Cart" on product detail pages
7. **Checkout**: View your cart at `/cart` and proceed to checkout

## 📁 Project Structure

```
AutoParts/
├── autoparts-app/          # Next.js frontend (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Products listing
│   │   │   │   └── [id]/page.tsx  # Product details
│   │   │   └── cart/page.tsx      # Shopping cart
│   │   ├── components/
│   │   │   ├── Header.tsx         # Navigation with cart
│   │   │   ├── Hero.tsx           # Homepage hero
│   │   │   └── Footer.tsx
│   │   └── contexts/
│   │       └── CartContext.tsx    # Cart state management
│   └── .env.local

part-integration-service/   # Express backend (Port 4000)
├── src/
│   ├── app.ts              # API routes
│   ├── server.ts           # Server entry point
│   └── shopify/
│       └── shopifyClient.ts # Shopify API client
└── .env
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products with optional filters
  - Query params: `search`, `minPrice`, `maxPrice`, `limit`
- `GET /api/products/:id` - Get single product by ID

### Testing
- `GET /health` - Health check
- `GET /shopify/test` - Shopify integration test interface

## 🎨 Key Features Implemented

### Frontend
- ✅ Product listing page with grid layout
- ✅ Search functionality
- ✅ Price range filters
- ✅ Product detail page with image gallery
- ✅ Shopping cart with persistence (localStorage)
- ✅ Cart badge in header showing item count
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Loading states and error handling

### Backend
- ✅ Shopify API integration
- ✅ Product fetching with filters
- ✅ Search across title, description, and tags
- ✅ Price range filtering
- ✅ CORS enabled for frontend communication

### Cart Features
- Add/remove items
- Update quantities
- Persistent storage (survives page refresh)
- Real-time total calculation
- Clear cart functionality

## 🧪 Testing the Integration

Visit `http://localhost:4000/shopify/test` to test Shopify integration with buttons to:
- Fetch products from Shopify
- Create test products

## 🔧 Configuration

### Shopify Setup
1. Get your Shopify Admin API access token
2. Note your store domain (e.g., `yourstore.myshopify.com`)
3. Update `.env` in `part-integration-service/`:
   ```
   SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
   SHOPIFY_ADMIN_TOKEN=shpat_xxxxx
   SHOPIFY_API_VERSION=2024-01
   ```

### Port Configuration
- **Frontend**: Port 3000 (Next.js default)
- **Backend**: Port 4000 (configured in server.ts)

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd AutoParts/autoparts-app
npm run build
```

### Backend (Any Node.js host)
```bash
cd part-integration-service
npm run build
npm start
```

## 📝 Notes

- Cart data is stored in browser localStorage
- Products are fetched from Shopify in real-time
- Images are loaded from Shopify CDN
- Checkout functionality is a placeholder (alerts total)

## 🐛 Troubleshooting

**Backend not connecting?**
- Verify backend is running on port 4000
- Check Shopify credentials in `.env`

**No products showing?**
- Ensure you have products in your Shopify store
- Check browser console for API errors
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

**Images not loading?**
- Check Shopify product images are public
- Verify CORS settings allow image loading

## 🔜 Future Enhancements

- User authentication
- Order processing
- Payment gateway integration
- Wishlist functionality
- Product reviews and ratings
- Advanced filtering (by category, brand, etc.)
- Inventory management
