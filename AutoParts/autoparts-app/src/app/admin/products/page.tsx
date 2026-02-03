
import React from 'react';
import Link from 'next/link';

const ProductsPage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Products</h1>
        <Link href="/admin/products/import" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Import Products
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Product Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>SKU</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Price</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {/* Add product rows here */}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;
