const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Static directory for file uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/admin/uploads', express.static(uploadsDir));

// Static directories for assets
const assetsDir = path.join(__dirname, '..', 'assets');
app.use('/assets', express.static(assetsDir));
app.use('/admin/assets/images', express.static(path.join(assetsDir, 'images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Fleuria Handmade API',
    timestamp: new Date().toISOString()
  });
});

// Admin React Application Static Assets (built with Vite)
const adminDistPath = path.join(__dirname, '..', 'admin', 'dist');

// Serve admin built assets
if (fs.existsSync(adminDistPath)) {
  app.use('/admin', express.static(adminDistPath));
}

// Client-side routing fallback for /admin and /admin/* (only for HTML pages, not file assets)
app.use((req, res, next) => {
  if (req.method === 'GET' && (req.path === '/admin' || req.path.startsWith('/admin/'))) {
    // Never send index.html for static asset requests with a file extension
    if (path.extname(req.path)) {
      return next();
    }
    const adminIndex = path.join(adminDistPath, 'index.html');
    if (fs.existsSync(adminIndex)) {
      return res.sendFile(adminIndex);
    } else {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admin Dashboard - Fleuria Handmade</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: system-ui, sans-serif; background: #faf7f2; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #2d3b2d; text-align: center; }
            .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 480px; }
            h2 { color: #1e3a1e; margin-bottom: 0.5rem; }
            p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }
            .btn { background: #2d5a3c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🌸 Fleuria Admin Building...</h2>
            <p>The React Admin Dashboard bundle is being compiled. Please refresh in a few moments.</p>
            <a class="btn" href="javascript:location.reload()">Refresh Page</a>
          </div>
        </body>
        </html>
      `);
    }
  }
  next();
});

// Serve Public Website Static Assets (from root)
const rootPath = path.join(__dirname, '..');
app.use(express.static(rootPath));

// Fallback to index.html for storefront
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  // If request has a file extension and wasn't found, 404 it
  if (path.extname(req.path)) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(rootPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Initialize database and start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌸 Fleuria Handmade Store & Admin Server Active!`);
    console.log(`🌐 Live Storefront:   ${process.env.LIVE_STORE_URL || 'https://fleuria-handmade-lac.vercel.app/'}`);
    console.log(`🏠 Local Storefront:  http://localhost:${PORT}/`);
    console.log(`🔐 Admin Dashboard:   http://localhost:${PORT}/admin`);
    console.log(`⚡ REST API Base:      http://localhost:${PORT}/api/products`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = app;
