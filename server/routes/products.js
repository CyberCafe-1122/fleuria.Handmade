const express = require('express');
const router = express.Router();
const { getPool, isDbConnected, getFallbackStorage } = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// Helper to ensure image paths are root-relative or absolute URLs
function normalizeImagePath(img) {
  if (!img) return '/assets/images/pipe-cleaner-tulips.jpg';
  const trimmed = String(img).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

// Helper to normalize product output for both public storefront and admin
function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    title: p.name, // storefront compatibility
    slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    price: Number(p.price) || 0,
    originalPrice: p.original_price != null ? Number(p.original_price) : null,
    original_price: p.original_price != null ? Number(p.original_price) : null,
    category: p.category || 'other',
    categoryName: p.category_name || (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Handmade'),
    category_name: p.category_name || (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Handmade'),
    stock: Number(p.stock) || 0,
    available: Boolean(p.available),
    image: normalizeImagePath(p.image),
    description: p.description || '',
    shortDescription: p.short_description || p.description || '',
    short_description: p.short_description || p.description || '',
    badge: p.badge || (p.stock === 0 ? 'Out of Stock' : (p.available ? 'Handmade' : 'Unavailable')),
    badgeType: p.badge_type || (p.stock === 0 ? 'out-of-stock' : 'artisan'),
    badge_type: p.badge_type || (p.stock === 0 ? 'out-of-stock' : 'artisan'),
    rating: Number(p.rating) || 5.0,
    reviewCount: Number(p.review_count) || 12,
    review_count: Number(p.review_count) || 12,
    createdAt: p.created_at,
    created_at: p.created_at,
    updatedAt: p.updated_at,
    updated_at: p.updated_at
  };
}

// GET /api/products (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;

    if (isDbConnected()) {
      const pool = getPool();
      let sql = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (search && search.trim()) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
        const queryTerm = `%${search.trim()}%`;
        params.push(queryTerm, queryTerm, queryTerm);
      }

      if (status === 'active') {
        sql += ' AND available = 1 AND stock > 0';
      } else if (status === 'out_of_stock') {
        sql += ' AND (stock = 0 OR available = 0)';
      }

      sql += ' ORDER BY created_at DESC';

      const [rows] = await pool.query(sql, params);
      return res.json({
        success: true,
        count: rows.length,
        products: rows.map(formatProduct)
      });

    } else {
      // Fallback
      const storage = getFallbackStorage();
      let list = [...storage.products];

      if (category && category !== 'all') {
        list = list.filter(p => p.category === category);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      if (status === 'active') {
        list = list.filter(p => p.available && p.stock > 0);
      } else if (status === 'out_of_stock') {
        list = list.filter(p => !p.available || p.stock === 0);
      }

      return res.json({
        success: true,
        count: list.length,
        products: list.map(formatProduct)
      });
    }

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve products. Please try again.'
    });
  }
});

// GET /api/products/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      return res.json({
        success: true,
        product: formatProduct(rows[0])
      });
    } else {
      const storage = getFallbackStorage();
      const p = storage.products.find(item => item.id === id);
      if (!p) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      return res.json({
        success: true,
        product: formatProduct(p)
      });
    }
  } catch (error) {
    console.error('Error fetching single product:', error);
    return res.status(500).json({ success: false, error: 'Server error retrieving product.' });
  }
});

// POST /api/products (Admin Protected)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      original_price,
      description,
      shortDescription,
      short_description,
      category,
      categoryName,
      category_name,
      image,
      stock,
      available,
      badge,
      badgeType,
      badge_type
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ success: false, error: 'Valid product price is required.' });
    }

    const prodId = req.body.id && req.body.id.trim()
      ? req.body.id.trim()
      : `fh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const numPrice = parseFloat(price);
    const numOriginalPrice = (originalPrice || original_price) ? parseFloat(originalPrice || original_price) : null;
    const numStock = stock !== undefined && stock !== null ? parseInt(stock, 10) : 10;
    const boolAvailable = available !== undefined ? (available === true || available === 'true' || available === 1 ? 1 : 0) : 1;
    const cat = (category || 'pipe-cleaner').trim();
    const catName = categoryName || category_name || (cat.charAt(0).toUpperCase() + cat.slice(1));
    const desc = description || '';
    const sDesc = shortDescription || short_description || desc.substring(0, 160);
    const img = normalizeImagePath(image && image.trim() ? image.trim() : '/assets/images/pipe-cleaner-tulips.jpg');
    const bText = badge || (numStock === 0 ? 'Out of Stock' : 'New');
    const bType = badgeType || badge_type || 'artisan';

    if (isDbConnected()) {
      const pool = getPool();
      await pool.query(`
        INSERT INTO products (
          id, name, price, original_price, description, short_description,
          image, category, category_name, stock, available, badge, badge_type, rating, review_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prodId,
        name.trim(),
        numPrice,
        numOriginalPrice,
        desc,
        sDesc,
        img,
        cat,
        catName,
        numStock,
        boolAvailable,
        bText,
        bType,
        5.0,
        1
      ]);

      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [prodId]);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product: formatProduct(rows[0])
      });
    } else {
      const storage = getFallbackStorage();
      const newProd = {
        id: prodId,
        name: name.trim(),
        price: numPrice,
        original_price: numOriginalPrice,
        description: desc,
        short_description: sDesc,
        image: img,
        category: cat,
        category_name: catName,
        stock: numStock,
        available: boolAvailable,
        badge: bText,
        badge_type: bType,
        rating: 5.0,
        review_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      storage.products.unshift(newProd);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product: formatProduct(newProd)
      });
    }

  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, error: 'Failed to create product. Please try again.' });
  }
});

// PUT /api/products/:id (Admin Protected)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      originalPrice,
      original_price,
      description,
      shortDescription,
      short_description,
      category,
      categoryName,
      category_name,
      image,
      stock,
      available,
      badge,
      badgeType,
      badge_type
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Product name cannot be empty.' });
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ success: false, error: 'Valid price is required.' });
    }

    const numPrice = parseFloat(price);
    const numOriginalPrice = (originalPrice || original_price) ? parseFloat(originalPrice || original_price) : null;
    const numStock = stock !== undefined && stock !== null ? parseInt(stock, 10) : 0;
    const boolAvailable = available !== undefined ? (available === true || available === 'true' || available === 1 ? 1 : 0) : 1;
    const cat = (category || 'pipe-cleaner').trim();
    const catName = categoryName || category_name || (cat.charAt(0).toUpperCase() + cat.slice(1));
    const desc = description !== undefined ? description : '';
    const sDesc = shortDescription || short_description || desc.substring(0, 160);
    const img = normalizeImagePath(image && image.trim() ? image.trim() : '/assets/images/pipe-cleaner-tulips.jpg');
    const bText = badge !== undefined ? badge : (numStock === 0 ? 'Out of Stock' : 'Handmade');
    const bType = badgeType || badge_type || 'artisan';

    if (isDbConnected()) {
      const pool = getPool();
      const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      await pool.query(`
        UPDATE products SET
          name = ?,
          price = ?,
          original_price = ?,
          description = ?,
          short_description = ?,
          image = ?,
          category = ?,
          category_name = ?,
          stock = ?,
          available = ?,
          badge = ?,
          badge_type = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name.trim(),
        numPrice,
        numOriginalPrice,
        desc,
        sDesc,
        img,
        cat,
        catName,
        numStock,
        boolAvailable,
        bText,
        bType,
        id
      ]);

      const [updatedRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Product updated successfully.',
        product: formatProduct(updatedRows[0])
      });
    } else {
      const storage = getFallbackStorage();
      const idx = storage.products.findIndex(p => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      storage.products[idx] = {
        ...storage.products[idx],
        name: name.trim(),
        price: numPrice,
        original_price: numOriginalPrice,
        description: desc,
        short_description: sDesc,
        image: img,
        category: cat,
        category_name: catName,
        stock: numStock,
        available: boolAvailable,
        badge: bText,
        badge_type: bType,
        updated_at: new Date()
      };

      return res.json({
        success: true,
        message: 'Product updated successfully.',
        product: formatProduct(storage.products[idx])
      });
    }

  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, error: 'Failed to update product. Please try again.' });
  }
});

// DELETE /api/products/:id (Admin Protected)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const pool = getPool();
      const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      await pool.query('DELETE FROM products WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Product deleted successfully.'
      });
    } else {
      const storage = getFallbackStorage();
      const idx = storage.products.findIndex(p => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      storage.products.splice(idx, 1);
      return res.json({
        success: true,
        message: 'Product deleted successfully.'
      });
    }

  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete product. Please try again.' });
  }
});

module.exports = router;
