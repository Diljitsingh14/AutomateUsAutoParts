
import React from 'react';
import Link from 'next/link';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>📋</span> {/* Placeholder for icon */}
          <h1 style={{ fontSize: '20px', margin: 0 }}>Shopify Admin Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginRight: '20px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input type="text" placeholder="Search..." style={{ padding: '8px 10px 8px 35px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <img src="https://via.placeholder.com/36" alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> {/* Placeholder for avatar */}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: '250px', borderRight: '1px solid #ddd', padding: '20px', backgroundColor: '#f8f8f8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <nav>
            <ul>
              <li style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', backgroundColor: '#e0e0e0' }}> {/* Highlighted */}
                <Link href="/admin/settings/integrations/shopify" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>🔗</span> Shopify Connection
                </Link>
              </li>
              <li style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px' }}>
                <Link href="/admin/products/import" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>☁️</span> Product Import
                </Link>
              </li>
              <li style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px' }}>
                <Link href="/admin/products" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>🏠</span> Product List
                </Link>
              </li>
            </ul>
          </nav>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px' }}>
                <Link href="/admin/settings" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>⚙️</span> Settings
                </Link>
              </li>
              <li style={{ padding: '10px', borderRadius: '5px' }}>
                <Link href="/admin/logout" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>➡️</span> Log Out
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '30px', backgroundColor: '#f0f2f5' }}>{children}</main>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#fff', padding: '15px 30px', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        © 2026 Shopify Admin Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLayout;
