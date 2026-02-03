import React from 'react';

export const ConnectionForm = () => {
  return (
    <form>
      <h2>Connect to Shopify</h2>
      <p>Enter your Shopify store name to connect.</p>
      <input type="text" placeholder="your-store.myshopify.com" />
      <button type="submit">Connect</button>
    </form>
  );
};
