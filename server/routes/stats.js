const express = require('express');
const router = express.Router();
const { getPool, isDbConnected, getFallbackStorage } = require('../db');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/stats (Admin Protected)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const pool = getPool();

      // Total products
      const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM products');

      // Active products (available = 1 AND stock > 0)
      const [[{ active }]] = await pool.query('SELECT COUNT(*) as active FROM products WHERE available = 1 AND stock > 0');

      // Out of stock or unavailable
      const [[{ outOfStock }]] = await pool.query('SELECT COUNT(*) as outOfStock FROM products WHERE stock = 0 OR available = 0');

      // Total units in stock
      const [[{ totalUnits }]] = await pool.query('SELECT COALESCE(SUM(stock), 0) as totalUnits FROM products');

      // Category breakdown
      const [categoryRows] = await pool.query(`
        SELECT 
          category,
          category_name,
          COUNT(*) as count,
          SUM(CASE WHEN available = 1 AND stock > 0 THEN 1 ELSE 0 END) as active_count
        FROM products 
        GROUP BY category, category_name 
        ORDER BY count DESC
      `);

      // Recent 5 products
      const [recentRows] = await pool.query(`
        SELECT id, name, price, stock, available, category_name, image, updated_at
        FROM products
        ORDER BY updated_at DESC
        LIMIT 5
      `);

      return res.json({
        success: true,
        stats: {
          totalProducts: Number(total) || 0,
          activeProducts: Number(active) || 0,
          outOfStock: Number(outOfStock) || 0,
          totalStockUnits: Number(totalUnits) || 0,
          categories: categoryRows,
          recentProducts: recentRows.map(r => ({
            ...r,
            price: Number(r.price),
            stock: Number(r.stock),
            available: Boolean(r.available)
          })),
          status: {
            connected: true,
            active: true
          }
        }
      });

    } else {
      const storage = getFallbackStorage();
      const total = storage.products.length;
      const active = storage.products.filter(p => p.available && p.stock > 0).length;
      const outOfStock = storage.products.filter(p => !p.available || p.stock === 0).length;
      const totalUnits = storage.products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

      return res.json({
        success: true,
        stats: {
          totalProducts: total,
          activeProducts: active,
          outOfStock: outOfStock,
          totalStockUnits: totalUnits,
          categories: [],
          recentProducts: storage.products.slice(0, 5),
          status: {
            connected: false,
            active: false
          }
        }
      });
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve dashboard metrics.' });
  }
});

module.exports = router;
