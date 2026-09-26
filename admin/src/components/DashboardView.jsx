import React from 'react';
import { getProductImage } from '../api';

export default function DashboardView({
  stats,
  products = [],
  onEditProduct,
  onToggleStatus,
  onNavigate
}) {
  const formatPrice = (val) => {
    return `Rs. ${Number(val || 0).toLocaleString()}`;
  };

  const totalProducts = stats?.totalProducts ?? products.length;
  const activeProducts = stats?.activeProducts ?? products.filter(p => p.available && p.stock > 0).length;
  const outOfStock = stats?.outOfStock ?? products.filter(p => !p.available || p.stock === 0).length;
  const totalUnits = stats?.totalStockUnits ?? products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const outOfStockItems = products.filter(p => !p.available || p.stock === 0);

  return (
    <div className="dashboard-view">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h3>Total Products</h3>
            <div className="metric-number">{totalProducts}</div>
            <div className="metric-sub">
              <span>Active catalog products</span>
            </div>
          </div>
          <div className="metric-icon forest">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Active Products</h3>
            <div className="metric-number">{activeProducts}</div>
            <div className="metric-sub" style={{ color: 'var(--color-success)' }}>
              <span>● Visible & Available to Buyers</span>
            </div>
          </div>
          <div className="metric-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Out of Stock</h3>
            <div className="metric-number">{outOfStock}</div>
            <div className="metric-sub" style={{ color: outOfStock > 0 ? 'var(--color-danger)' : 'var(--color-text-light)' }}>
              <span>{outOfStock > 0 ? '⚠️ Attention needed' : 'All items in stock'}</span>
            </div>
          </div>
          <div className="metric-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <h3>Total Inventory</h3>
            <div className="metric-number">{totalUnits}</div>
            <div className="metric-sub">
              <span>Total physical handcrafted units</span>
            </div>
          </div>
          <div className="metric-icon gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Out of Stock Alert Banner */}
      {outOfStockItems.length > 0 && (
        <div style={{
          background: 'var(--color-warning-bg)',
          border: '1px solid #f6d8a7',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.95rem' }}>
                {outOfStockItems.length} Product{outOfStockItems.length > 1 ? 's are' : ' is'} currently Out of Stock
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {outOfStockItems.map(p => p.name).join(', ')}
              </div>
            </div>
          </div>
          <button 
            className="btn-primary" 
            style={{ background: 'var(--color-warning)', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            onClick={() => onNavigate('products')}
          >
            Update Inventory
          </button>
        </div>
      )}

      {/* Quick Actions Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <h2>Recent Products & Inventory Highlights</h2>
          <div className="panel-actions">
            <button className="btn-primary" onClick={() => onNavigate('add-product')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Product</span>
            </button>
            <button className="btn-outline" onClick={() => onNavigate('products')}>
              <span>View All Products →</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map(prod => (
                <tr key={prod.id}>
                  <td>
                    <div className="product-cell">
                      <img 
                        src={getProductImage(prod.image)} 
                        alt={prod.name} 
                        className="product-thumb"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/pipe-cleaner-tulips.jpg'; }}
                      />
                      <div className="product-cell-info">
                        <span className="product-name">{prod.name}</span>
                        <span className="product-meta">
                          <span>{prod.categoryName || prod.category}</span>
                          <span>•</span>
                          <span>ID: {prod.id}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="price-cell">
                      {formatPrice(prod.price)}
                      {prod.originalPrice && (
                        <span className="original-price-tag">{formatPrice(prod.originalPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-pill ${prod.stock === 0 ? 'stock-out' : prod.stock < 5 ? 'stock-low' : 'stock-in'}`}>
                      {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} units`}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-badge ${prod.available && prod.stock > 0 ? 'available' : 'unavailable'}`}
                      onClick={() => onToggleStatus(prod)}
                      title="Click to toggle status"
                    >
                      <span>{prod.available && prod.stock > 0 ? '● Available' : '○ Unavailable'}</span>
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action edit"
                        onClick={() => onEditProduct(prod)}
                        title="Edit Product"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
