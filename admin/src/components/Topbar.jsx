import React from 'react';
import { LIVE_STORE_URL } from '../api';

export default function Topbar({ activeTab, onOpenMobileMenu, storeStatus }) {
  const titles = {
    dashboard: 'Artisan Store Dashboard',
    products: 'Product Catalog Management',
    'add-product': 'Add New Handcrafted Product',
    orders: 'Customer Inquiries & Orders'
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2 className="page-title">{titles[activeTab] || 'Admin Portal'}</h2>
      </div>

      <div className="topbar-right">
        {/* Status indicator */}
        <div className="store-status-pill" title="Store system active and synced">
          <span className="store-status-dot"></span>
          <span>Store Online</span>
        </div>

        {/* View Storefront Link */}
        <a 
          href={LIVE_STORE_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-visit-store"
          title="Open live storefront on Vercel"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>Live Store</span>
        </a>
      </div>
    </header>
  );
}
