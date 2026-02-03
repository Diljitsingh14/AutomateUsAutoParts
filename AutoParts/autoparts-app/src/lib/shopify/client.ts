import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: [
    'write_products',
    'read_inventory',
    'write_inventory',
    'read_orders',
  ],
  hostName: Buffer.from(process.env.SHOPIFY_HOST || '', 'base64').toString(),
  apiVersion: ApiVersion.January24,
  isEmbeddedApp: false,
});

export default shopify;
