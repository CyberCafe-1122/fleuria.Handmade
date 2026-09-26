const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fleuria_luxury_artisan_jwt_secret_key_2026_secure';

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-access-token'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Authentication token required.'
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Malformed token.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Invalid or expired token.'
    });
  }
}

module.exports = {
  authenticateAdmin,
  JWT_SECRET
};
