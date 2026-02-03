
import React from 'react';
import Link from 'next/link';

const ShopifyIntegrationPage = () => {
  return (
    <div>
      <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '10px' }}>Shopify Connection</h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
        Manage your Shopify store connection. Connect, monitor status, and ensure seamless data synchronization for your product catalog.
      </p>

      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', color: '#333', marginBottom: '15px', textAlign: 'center' }}>Shopify Connection Status</h2>
        <p style={{ fontSize: '14px', color: '#777', marginBottom: '20px', textAlign: 'center' }}>
          Connect your Shopify store to get started with product imports and management.
        </p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '25px', textAlign: 'center' }}>
          Status: Not Connected
        </p>
        <Link href="/api/shopify/auth" style={{
          display: 'block',
          width: 'fit-content',
          margin: '0 auto',
          padding: '12px 25px',
          backgroundColor: '#4a7dff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Connect to Shopify
        </Link>
      </div>
    </div>
  );
};

export default ShopifyIntegrationPage;
