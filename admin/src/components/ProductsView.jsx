import React, { useState, useMemo } from 'react';
import { getProductImage } from '../api';

export default function ProductsView({
  products = [],
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onAddProduct
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, out_of_stock

  // Dynamic list of categories from products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter products based on search, category, and status
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && (!p.available || p.stock === 0)) {
        return false;
      }
      if (statusFilter === 'out_of_stock' && (p.available && p.stock > 0)) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchCat = (p.categoryName || p.category || '').toLowerCase().includes(q);
        const matchId = (p.id || '').toLowerCase().includes(q);
        return matchName || matchDesc || matchCat || matchId;
      }

      return true;
    });
  }, [products, selectedCategory, statusFilter, searchTerm]);

  const formatPrice = (val) => {
    return `Rs. ${Number(val || 0).toLocaleString()}`;
  };

  return (
    <div className="products-view">
      <div className="content-panel">
        {/* Top Control Bar */}
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2>Products Inventory</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              ({filteredProducts.length} of {products.length} items)
            </span>
          </div>

          <div className="panel-actions">
            {/* Search Input */}
            <div className="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-light)' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search products by title, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active & In Stock</option>
              <option value="out_of_stock">Out of Stock / Inactive</option>
            </select>

            {/* Add Product Button */}
            <button className="btn-primary" onClick={onAddProduct}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Product</th>
                <th style={{ width: '15%' }}>Price</th>
                <th style={{ width: '15%' }}>Stock</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌸</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-forest)', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                      No products found
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                      Try adjusting your search query or category filters.
                    </div>
                    {(searchTerm || selectedCategory !== 'all' || statusFilter !== 'all') && (
                      <button
                        className="btn-outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setStatusFilter('all');
                        }}
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => (
                  <tr key={prod.id}>
                    {/* Product Column */}
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
                            <span style={{ fontWeight: 600, color: 'var(--color-sage)' }}>
                              {prod.categoryName || prod.category}
                            </span>
                            <span>•</span>
                            <span>ID: {prod.id}</span>
                            {prod.badge && (
                              <>
                                <span>•</span>
                                <span style={{ 
                                  background: 'var(--color-sage-light)', 
                                  color: 'var(--color-forest)', 
                                  padding: '0.1rem 0.4rem', 
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600
                                }}>
                                  {prod.badge}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td>
                      <div className="price-cell">
                        {formatPrice(prod.price)}
                        {prod.originalPrice && (
                          <span className="original-price-tag">{formatPrice(prod.originalPrice)}</span>
                        )}
                      </div>
                    </td>

                    {/* Stock Column */}
                    <td>
                      <span className={`stock-pill ${prod.stock === 0 ? 'stock-out' : prod.stock < 5 ? 'stock-low' : 'stock-in'}`}>
                        {prod.stock === 0 ? '0 (Out of Stock)' : `${prod.stock} in stock`}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td>
                      <button
                        className={`status-badge ${prod.available && prod.stock > 0 ? 'available' : 'unavailable'}`}
                        onClick={() => onToggleStatus(prod)}
                        title="Click to toggle availability"
                      >
                        <span>{prod.available && prod.stock > 0 ? '● Available' : '○ Unavailable'}</span>
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
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

                        <button
                          className="btn-action delete"
                          onClick={() => onDeleteProduct(prod)}
                          title="Delete Product"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
