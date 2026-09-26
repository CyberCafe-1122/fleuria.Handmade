const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'fleuria_db';

let pool = null;
let isConnected = false;

// Fallback in-memory storage if MySQL is temporarily unreachable
const fallbackStorage = {
  admins: [],
  products: []
};

// Initial seed data from Fleuria Handmade catalog
const INITIAL_PRODUCTS = [
  {
    id: "fh-001",
    name: "Pastel Bloom Pipe Cleaner Tulip Bouquet",
    category: "pipe-cleaner",
    category_name: "Pipe Cleaner Flowers",
    price: 4800,
    original_price: 5800,
    rating: 4.9,
    review_count: 42,
    badge: "Bestseller",
    badge_type: "bestseller",
    image: "/assets/images/pipe-cleaner-tulips.jpg",
    short_description: "A forever-blooming bouquet of hand-sculpted pastel pink tulips and cheerful mini daisies, crafted from velvety chenille stems and wrapped in Korean aesthetic floral paper with silk ribbon.",
    description: "Meticulously handcrafted petal by petal using premium ultra-dense plush chenille stems (pipe cleaners). Unlike fresh florals, these velvety blooms will remain fresh, tactile, and vibrant forever without watering or wilting, with bendable stems for custom arrangements.",
    stock: 12,
    available: 1
  },
  {
    id: "fh-002",
    name: "Botanical Blossom Hand-Poured Soy Candle",
    category: "candles",
    category_name: "Botanical Candles",
    price: 2800,
    original_price: null,
    rating: 5.0,
    review_count: 38,
    badge: "Hand-Poured",
    badge_type: "artisan",
    image: "/assets/images/botanical-candle.jpg",
    short_description: "100% natural soy wax candle adorned with real dried rose petals, French lavender buds, and delicate edible gold flakes in frosted amber glass.",
    description: "Infused with therapeutic essential oils and crackling wooden wicks, our botanical candle brings serene calm to any living sanctuary. Each batch is hand-poured in small studio batches of only 12 jars.",
    stock: 8,
    available: 1
  },
  {
    id: "fh-003",
    name: "Eternal Rose & Baby's Breath Glass Cloche",
    category: "preserved",
    category_name: "Preserved Flowers",
    price: 6800,
    original_price: 7900,
    rating: 4.9,
    review_count: 29,
    badge: "Limited Edition",
    badge_type: "limited",
    image: "/assets/images/preserved-roses.jpg",
    short_description: "Grade-A natural preserved garden roses and airy gypsophila preserved at peak beauty inside a tall bell glass cloche on a walnut base.",
    description: "Specially preserved using non-toxic botanical humectants, these authentic roses maintain their supple texture, velvety touch, and soft blush tones for 3 to 5 years. A timeless gift for anniversaries and memorable milestones.",
    stock: 5,
    available: 1
  },
  {
    id: "fh-004",
    name: "Forget-Me-Not Pressed Floral 24K Gold Necklace",
    category: "jewelry",
    category_name: "Floral Jewelry",
    price: 3600,
    original_price: null,
    rating: 4.8,
    review_count: 51,
    badge: "Staff Pick",
    badge_type: "featured",
    image: "/assets/images/resin-necklace.jpg",
    short_description: "Delicate oval pendant encasing hand-pressed real blue forget-me-not flowers and 24K gold flakes suspended in crystal-clear jewellery grade resin.",
    description: "Every flower is organically grown, hand-harvested at dawn, pressed for two weeks, and delicately preserved in optical UV-resistant resin. Fitted on an 18-inch 14K gold-filled hypoallergenic dainty chain.",
    stock: 14,
    available: 1
  },
  {
    id: "fh-005",
    name: "French Lavender & Beeswax Botanical Wax Tablet",
    category: "candles",
    category_name: "Botanical Candles",
    price: 1800,
    original_price: null,
    rating: 4.9,
    review_count: 22,
    badge: "Wardrobe Sachet",
    badge_type: "artisan",
    image: "/assets/images/botanical-sachet.jpg",
    short_description: "Aesthetic aromatic wax tablet infused with French Provence lavender, dried whole eucalyptus sprigs, and pressed pink strawflowers with satin hanging loop.",
    description: "Hand-poured using a pure blend of local beeswax and eco-friendly soy wax, heavily loaded with pure organic lavender and bergamot essential oils. Designed to hang inside closets, dressers, linen chests, or powder rooms.",
    stock: 20,
    available: 1
  },
  {
    id: "fh-006",
    name: "Artisan Luxury Floral & Aromatherapy Hamper",
    category: "gifts",
    category_name: "Gift Hampers",
    price: 9800,
    original_price: 11500,
    rating: 5.0,
    review_count: 17,
    badge: "Ultimate Gift",
    badge_type: "bestseller",
    image: "/assets/images/gift-hamper.jpg",
    short_description: "Our signature artisanal gift box featuring a handmade pipe cleaner mini bouquet, 1 botanical soy candle, 1 floral sachet, and personalized gold calligraphy note.",
    description: "The crown jewel of Fleuria Handmade gifting. Encased in an embossed sturdy keepsake box tied with double-faced woven satin ribbon. Every item inside is handcrafted in our studio.",
    stock: 4,
    available: 1
  },
  {
    id: "fh-007",
    name: "Golden Sunshine Pipe Cleaner Sunflower Posy",
    category: "pipe-cleaner",
    category_name: "Pipe Cleaner Flowers",
    price: 3200,
    original_price: null,
    rating: 4.9,
    review_count: 31,
    badge: "Bright & Cheerful",
    badge_type: "featured",
    image: "/assets/images/pipe-cleaner-sunflower.jpg",
    short_description: "Vibrant yellow pipe cleaner sunflower with textured dark chocolate seed center, accompanied by mini daisy accents and eucalyptus leaves.",
    description: "Handcrafted using velvety golden chenille wire stems. Sturdy yet bendable, bringing everlasting warm sunshine and smiles to any desk, bedside table, or workspace.",
    stock: 0,
    available: 0
  },
  {
    id: "fh-008",
    name: "Mini Potted Pipe Cleaner Daisy Trio",
    category: "pipe-cleaner",
    category_name: "Pipe Cleaner Flowers",
    price: 2400,
    original_price: null,
    rating: 4.8,
    review_count: 19,
    badge: "Desk Decor",
    badge_type: "artisan",
    image: "/assets/images/pipe-cleaner-tulips.jpg",
    short_description: "Three handcrafted miniature daisies nestled in real moss inside an aesthetic white ceramic mini planter.",
    description: "A charming handcrafted desk companion that requires zero watering, soil care, or daylight. Hand-shaped petal by petal using soft chenille craft stems with realistic foliage.",
    stock: 9,
    available: 1
  }
];

async function initDatabase() {
  try {
    console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as user '${DB_USER}'...`);
    
    // Step 1: Connect to server without database to create DB if needed
    const serverConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await serverConn.end();
    console.log(`Database '${DB_NAME}' verified or created.`);

    // Step 2: Create connection pool with database selected
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const testConn = await pool.getConnection();
    testConn.release();
    isConnected = true;
    console.log('MySQL connection pool established successfully.');

    // Step 3: Create 'admins' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Step 4: Create 'products' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        original_price DECIMAL(10,2) DEFAULT NULL,
        description TEXT,
        short_description TEXT,
        image VARCHAR(500),
        category VARCHAR(100) NOT NULL DEFAULT 'pipe-cleaner',
        category_name VARCHAR(150) DEFAULT 'Pipe Cleaner Flowers',
        stock INT NOT NULL DEFAULT 0,
        available TINYINT(1) NOT NULL DEFAULT 1,
        badge VARCHAR(100) DEFAULT NULL,
        badge_type VARCHAR(50) DEFAULT 'artisan',
        rating DECIMAL(2,1) DEFAULT 5.0,
        review_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Step 5: Ensure configured admin from .env exists and is up-to-date in MySQL
    const targetEmail = process.env.ADMIN_EMAIL || 'Iness@fleuria.com';
    const targetUsername = process.env.ADMIN_USERNAME || 'Iness';
    const targetPassword = process.env.ADMIN_PASSWORD || 'Iness2131';
    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    const [existingAdmin] = await pool.query(
      'SELECT id FROM admins WHERE email = ? OR username = ? LIMIT 1',
      [targetEmail, targetUsername]
    );

    if (existingAdmin.length === 0) {
      await pool.query(
        'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
        [targetUsername, targetEmail, hashedPassword, 'admin']
      );
      console.log(`Created admin account in MySQL: ${targetEmail} (${targetUsername})`);
    } else {
      await pool.query(
        'UPDATE admins SET username = ?, email = ?, password = ? WHERE id = ?',
        [targetUsername, targetEmail, hashedPassword, existingAdmin[0].id]
      );
      console.log(`Synchronized admin credentials in MySQL: ${targetEmail} (${targetUsername})`);
    }

    // Step 6: Seed products if table is empty
    const [prodRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (prodRows[0].count === 0) {
      console.log('Seeding initial products into MySQL...');
      for (const p of INITIAL_PRODUCTS) {
        await pool.query(`
          INSERT INTO products (
            id, name, price, original_price, description, short_description,
            image, category, category_name, stock, available, badge, badge_type, rating, review_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id,
          p.name,
          p.price,
          p.original_price,
          p.description,
          p.short_description,
          p.image,
          p.category,
          p.category_name,
          p.stock,
          p.available,
          p.badge,
          p.badge_type,
          p.rating,
          p.review_count
        ]);
      }
      console.log(`Seeded ${INITIAL_PRODUCTS.length} initial products into MySQL.`);
    }

    // Step 7: Ensure all product image paths are root-relative or absolute
    await pool.query(`
      UPDATE products 
      SET image = CONCAT('/', image) 
      WHERE image IS NOT NULL 
        AND image != '' 
        AND image NOT LIKE '/%' 
        AND image NOT LIKE 'http://%' 
        AND image NOT LIKE 'https://%'
    `);

  } catch (error) {
    console.error('MySQL initialization warning:', error.message);
    console.warn('Falling back to safe in-memory data store for server resilience.');
    isConnected = false;

    // Seed fallback admin
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@fleuria.com';
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    fallbackStorage.admins = [{
      id: 1,
      username: defaultUsername,
      email: defaultEmail,
      password: hashedPassword,
      role: 'admin',
      created_at: new Date()
    }];

    // Seed fallback products
    fallbackStorage.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS)).map(p => ({
      ...p,
      created_at: new Date(),
      updated_at: new Date()
    }));
  }
}

// Helper to query database or fallback
async function query(sql, params = []) {
  if (isConnected && pool) {
    return pool.query(sql, params);
  }
  throw new Error('MySQL connection pool is not active.');
}

function getPool() {
  return pool;
}

function isDbConnected() {
  return isConnected;
}

function getFallbackStorage() {
  return fallbackStorage;
}

module.exports = {
  initDatabase,
  query,
  getPool,
  isDbConnected,
  getFallbackStorage,
  INITIAL_PRODUCTS
};
