import React, { useState } from 'react';
import { api, getProductImage } from '../api';

const PRESET_IMAGES = [
  { label: 'Tulip Bouquet', path: '/assets/images/pipe-cleaner-tulips.jpg' },
  { label: 'Botanical Candle', path: '/assets/images/botanical-candle.jpg' },
  { label: 'Preserved Roses', path: '/assets/images/preserved-roses.jpg' },
  { label: 'Floral Necklace', path: '/assets/images/resin-necklace.jpg' },
  { label: 'Botanical Sachet', path: '/assets/images/botanical-sachet.jpg' },
  { label: 'Artisan Hamper', path: '/assets/images/gift-hamper.jpg' },
  { label: 'Sunflower Posy', path: '/assets/images/pipe-cleaner-sunflower.jpg' }
];

const CATEGORIES = [
  { id: 'pipe-cleaner', name: 'Pipe Cleaner Flowers' },
  { id: 'candles', name: 'Botanical Candles' },
  { id: 'preserved', name: 'Preserved Flowers' },
  { id: 'jewelry', name: 'Floral Jewelry' },
  { id: 'gifts', name: 'Gift Hampers' },
  { id: 'other', name: 'Other Artisanal Craft' }
];

export default function AddProductView({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'pipe-cleaner',
    categoryName: 'Pipe Cleaner Flowers',
    stock: 10,
    available: true,
    description: '',
    image: '/assets/images/pipe-cleaner-tulips.jpg',
    badge: 'New'
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = CATEGORIES.find(c => c.id === catId);
    setFormData(prev => ({
      ...prev,
      category: catId,
      categoryName: catObj ? catObj.name : catId
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, image: res.url }));
      }
    } catch (err) {
      setError(err.message || 'Image upload failed. You can paste an image path or URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setError('Please provide a valid non-negative price.');
      return;
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setError('Please provide a valid non-negative stock quantity.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        categoryName: formData.categoryName,
        stock: parseInt(formData.stock, 10),
        available: formData.available,
        description: formData.description,
        image: formData.image,
        badge: formData.badge
      };

      await onSave(payload);
      if (onCancel) onCancel(); // Return to products list
    } catch (err) {
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-page" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="content-panel" style={{ overflow: 'visible' }}>
        {/* Panel Header */}
        <div className="panel-header">
          <div>
            <h2>🌸 Add New Handcrafted Product</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Create a new item in your store product catalog. It will automatically appear on the public storefront.
            </p>
          </div>
          <button className="btn-outline" onClick={onCancel}>
            ← Back to Products
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          {error && (
            <div className="alert-danger" style={{ marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              1. Product Overview
            </h3>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Pastel Bloom Pipe Cleaner Tulip Bouquet"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (Rs.) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 7500"
                  step="any"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Original Price (Rs., Optional strike-through)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="e.g. 8500"
                  step="any"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Category & Inventory */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              2. Category & Inventory
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Stock Quantity (Units) *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-switch">
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.9rem' }}>
                    Available for Purchase
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    When enabled, product is active and visible on the website.
                  </div>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Photography */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              3. Product Photography
            </h3>

            <div className="form-group">
              <label>Image Source / Path</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="e.g. /assets/images/pipe-cleaner-tulips.jpg or https://..."
                  style={{ flexGrow: 1 }}
                />
                <label className="btn-outline" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {uploading ? 'Uploading...' : '📁 Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Preset images fast-pick */}
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Or select an artisan studio preset:
              </div>
              <div className="preset-images-list">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`preset-img-btn ${formData.image === img.path ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, image: img.path }))}
                    title={img.label}
                  >
                    <img src={getProductImage(img.path)} alt={img.label} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </button>
                ))}
              </div>

              {/* Preview Box */}
              <div className="image-upload-wrap" style={{ marginTop: '0.85rem' }}>
                <img
                  src={getProductImage(formData.image)}
                  alt="Preview"
                  className="image-preview-box"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/pipe-cleaner-tulips.jpg'; }}
                />
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Live Image Preview. Product cards will display this picture with aesthetic luxury styling.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Details & Badge */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-forest)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              4. Description & Promotional Badge
            </h3>

            <div className="form-group">
              <label>Product Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the handcrafted details, materials used (e.g. plush chenille stems, organic soy wax), packaging, and custom options..."
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Promotional Badge (Optional)</label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. Bestseller, Limited Edition, Hand-Poured, Staff Pick, New"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)'
          }}>
            <button type="button" className="btn-outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || uploading} style={{ padding: '0.75rem 1.75rem' }}>
              {submitting ? 'Saving...' : '🌸 Create & Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
