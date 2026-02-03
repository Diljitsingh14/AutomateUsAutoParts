
export interface ShopifyProduct {
  _id: string;
  shopifyId: string;
  partNumber: string;
  title: string;
  description: string;
  price: number;
  msrp: number;
  sku: string;
  inventory: number;
  imageUrl: string;
  make: string;
  model: string;
  serviceLines: string[];
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date;
  lastError?: string;
}

export interface SyncStatus {
  _id: string;
  syncType: 'products' | 'inventory' | 'orders';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  itemsProcessed: number;
  itemsFailed: number;
  errorMessage?: string;
}
