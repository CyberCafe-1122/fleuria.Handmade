import React, { useState, useEffect } from 'react';
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

export default function ProductModal({
  isOpen,
  onClose,
  product = null,
  onSave
}) {
  const isEdit = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'pipe-cleaner',
    categoryName: 'Pipe Cleaner Flowers',
    stock: 10,
    available: true,
    description: '',
    image: 'assets/images/pipe-cleaner-tulips.jpg',
    badge: ''
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price !== undefined ? product.price : '',
        originalPrice: product.originalPrice || product.original_price || '',
        category: product.category || 'pipe-cleaner',
        categoryName: product.categoryName || product.category_name || 'Pipe Cleaner Flowers',
        stock: product.stock !== undefined ? product.stock : 10,
        available: product.available !== undefined ? Boolean(product.available) : true,
        description: product.description || '',
        image: product.image || 'assets/images/pipe-cleaner-tulips.jpg',
        badge: product.badge || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        category: 'pipe-cleaner',
        categoryName: 'Pipe Cleaner Flowers',
        stock: 10,
        available: true,
        description: '',
        image: 'assets/images/pipe-cleaner-tulips.jpg',
        badge: 'New'
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

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

      await onSave(payload, product?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} id="productForm" className="modal-form">
          {/* Modal Header */}
          <div className="modal-header">
            <h3>{isEdit ? 'Edit Handcrafted Product' : 'Add New Handcrafted Product'}</h3>
            <button type="button" className="btn-close-modal" onClick={onClose}>✕</button>
          </div>

          {/* Modal Body / Form */}
          <div className="modal-body">
            {error && (
              <div className="alert-danger" style={{ marginBottom: '1.25rem' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Product Name */}
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

            {/* Price and Original Price */}
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
                <label>Original Price (Rs., Optional)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="e.g. 8500 (shows strike-through)"
                  step="any"
                  min="0"
                />
              </div>
            </div>

            {/* Category and Stock */}
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
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Availability Switch */}
            <div className="form-group">
              <div className="form-switch">
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-forest)', fontSize: '0.9rem' }}>
                    Product Availability Status
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {formData.available 
                      ? 'Visible to customers and ready for WhatsApp inquiries/orders.' 
                      : 'Hidden or marked as Unavailable on the public storefront.'}
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

            {/* Product Image Section */}
            <div className="form-group">
              <label>Product Image</label>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Path or URL (e.g. assets/images/pipe-cleaner-tulips.jpg)"
                  style={{ flexGrow: 1 }}
                />

                <label className="btn-outline" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {uploading ? 'Uploading...' : '📁 Upload File'}
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
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                Or select an artisan studio preset image:
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
              <div className="image-upload-wrap">
                <img
                  src={getProductImage(formData.image)}
                  alt="Preview"
                  className="image-preview-box"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/pipe-cleaner-tulips.jpg'; }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Current Preview. Images are displayed with rounded borders and responsive aspect ratios.
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Product Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe materials, handcrafting techniques, packaging..."
                rows="3"
              ></textarea>
            </div>

            {/* Badge */}
            <div className="form-group">
              <label>Promo Badge (Optional)</label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. Bestseller, Limited Edition, Hand-Poured, Staff Pick"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || uploading}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
