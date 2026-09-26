import React from 'react';
import { LIVE_STORE_URL } from '../api';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
  productsCount = 0,
  outOfStockCount = 0
}) {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <a href="#dashboard" className="sidebar-brand" onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}>
          <div className="brand-icon">🌸</div>
          <div className="brand-text">
            <h1>Fleuria Admin</h1>
            <span>Luxury Studio</span>
          </div>
        </a>

        {setMobileOpen && (
          <button 
            className="btn-close-modal mobile-only" 
            onClick={() => setMobileOpen(false)}
            style={{ display: mobileOpen ? 'flex' : 'none' }}
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">Store Management</span>

        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleNavClick('products')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Products</span>
          {productsCount > 0 && <span className="nav-badge">{productsCount}</span>}
        </button>

        <button
          className={`nav-item ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => handleNavClick('add-product')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Add Product</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleNavClick('orders')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Orders</span>
          <span className="nav-badge" style={{ background: '#fef7ec', color: '#c27803' }}>WA</span>
        </button>

        <span className="nav-section-title" style={{ marginTop: '1.5rem' }}>Quick Shortcuts</span>

        <a 
          href={LIVE_STORE_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-item"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>View Live Website</span>
        </a>
      </nav>

      {/* Sidebar Footer with User and Logout */}
      <div className="sidebar-footer">
        <div className="user-snippet">
          <div className="user-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'Store Admin'}</div>
            <div className="user-role">{user?.email || 'admin@fleuria.com'}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
