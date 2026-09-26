const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (allowed.test(ext) || allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

// POST /api/upload (Admin Protected)
router.post('/', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please choose an image file to upload.'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Image upload failed.'
    });
  }
});

module.exports = router;
