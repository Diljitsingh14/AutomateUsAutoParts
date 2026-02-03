
import React from 'react';

const ProductImportPage = () => {
  return (
    <div>
      <h1>Import Products</h1>
      <form>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="file" style={{ display: 'block', marginBottom: '5px' }}>Choose a file to import</label>
          <input type="file" id="file" name="file" />
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
          Import
        </button>
      </form>
    </div>
  );
};

export default ProductImportPage;
