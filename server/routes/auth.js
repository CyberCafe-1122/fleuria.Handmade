const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, isDbConnected, getFallbackStorage } = require('../db');
const { authenticateAdmin, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, email, username, password } = req.body;
    const identifier = (login || email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email/username and password.'
      });
    }

    let admin = null;

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT * FROM admins WHERE email = ? OR username = ? LIMIT 1',
        [identifier, identifier]
      );
      if (rows.length > 0) {
        admin = rows[0];
      }
    } else {
      const storage = getFallbackStorage();
      admin = storage.admins.find(
        a => a.email.toLowerCase() === identifier.toLowerCase() ||
             a.username.toLowerCase() === identifier.toLowerCase()
      );
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password.'
      });
    }

    // Sign JWT token
    const tokenPayload = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role || 'admin'
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role || 'admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred during login.'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateAdmin, async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Successfully logged out.'
  });
});

module.exports = router;
