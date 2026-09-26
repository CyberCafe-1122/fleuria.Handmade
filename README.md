# 🌸 Fleuria Handmade - Luxury Artisan E-Commerce & WhatsApp Business Storefront

> An elegant, professional e-commerce storefront for handcrafted pipe cleaner flower bouquets, artisanal soy candles, preserved roses, and bespoke gifts with a direct **WhatsApp Selling & Order Dispatch Engine**.

---

## ✨ Features

- **🌸 Direct WhatsApp Selling Architecture**:
  - **Slide-Over Cart Drawer**: Live subtotal calculations, dynamic free delivery threshold progress meter, item customizations (ribbon colors, candle scents), and quantity steppers.
  - **Customer Checkout**: Collects Customer Name, Phone, Delivery Address, City, Gift Card Message, and Payment Preference.
  - **Automated Order Dispatch**: Pre-formats structured WhatsApp orders (`wa.me/<phone>?text=...`) ready to send in one tap.
  - **1-Click Inquiries**: Direct WhatsApp inquiry buttons on every single product card.
  - **Bespoke Commission Builder**: Multi-field custom order brief for weddings, events, and gift boxes sent straight to WhatsApp.
  - **Floating WhatsApp Concierge**: Interactive floating chat widget with live artisan status and quick help topics.

- **🎨 Artisan Luxury Aesthetics**:
  - Warm Botanical Sage, Porcelain Cream, Soft Petal Rose, and Gold color palette.
  - Curated high-resolution handcrafted product and studio photography.
  - Micro-interactions, animated cart badge, glassmorphism sticky header, and toast notification alerts.

- **🛍️ Complete Product Catalog**:
  - Category filtering (*Pipe Cleaner Flowers*, *Botanical Candles*, *Preserved Flowers*, *Floral Jewelry*, *Gift Hampers*).
  - Instant live keyword search.
  - Quick Preview Modal with product features, care guides, and variant option selectors.

- **⚙️ Live Store Configuration (No Coding Needed)**:
  - Store owners can click **"Store Settings"** in the footer to update their WhatsApp phone number, display number, currency symbol (`DA`, `DZD`, `$`, `€`), and shipping fees at any time with immediate `localStorage` persistence.

---

## 🚀 Quick Start (Local Run)

You can run this project locally without any dependencies using Node.js:

```bash
# 1. Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd "fleuria handmade"

# 2. Start the local server
node local-server.js

# 3. Open in your browser
http://localhost:3000/
```

Or open `index.html` directly in any modern web browser!

---

## 📂 Project Structure

```
fleuria-handmade/
├── index.html              # Main HTML5 semantic structure & storefront
├── local-server.js         # Lightweight local static preview server
├── vercel.json             # Vercel deployment configuration
├── .vercelignore           # Ignored files for Vercel
├── .gitignore              # Ignored files
├── README.md               # Documentation & setup guide
└── assets/
    ├── css/
    │   └── style.css       # Luxury design system, layout, & responsive styling
    ├── js/
    │   ├── config.js       # Store configuration & WhatsApp phone settings
    │   ├── products.js     # Curated handmade product database
    │   ├── cart.js         # Shopping cart logic & WhatsApp message builder
    │   └── app.js          # Interactive catalog, search, modals & UI events
    └── images/             # High-resolution handcrafted product photography
        ├── hero-banner.jpg
        ├── pipe-cleaner-tulips.jpg
        ├── botanical-candle.jpg
        ├── preserved-roses.jpg
        ├── resin-necklace.jpg
        ├── botanical-sachet.jpg
        ├── gift-hamper.jpg
        ├── pipe-cleaner-sunflower.jpg
        └── artisan-maker.jpg
```

---

## 📱 WhatsApp Order Message Example

When a customer checks out through the cart drawer, Fleuria generates a structured order message:

```text
🌸 *NEW ORDER - FLEURIA HANDMADE* 🌸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS*
• *Name:* Sarah Jenkins
• *Phone / WA:* +213 555 81 25 64
• *Delivery Address:* 42 Bloom Street, Algiers
• *Preferred Payment:* Cash on Delivery (COD)

💌 *PERSONAL GIFT CARD MESSAGE:*
"Happy Anniversary, my love! Forever blooming."

🛍️ *ORDERED ITEMS (2 items)*
1. *Pastel Bloom Pipe Cleaner Tulip Bouquet*
   • Qty: 1 × 4 800 DA = 4 800 DA
   • Customization: ribbon color: Dusty Rose

2. *Botanical Blossom Hand-Poured Soy Candle*
   • Qty: 1 × 2 800 DA = 2 800 DA
   • Customization: scent: Rose & Velvet Peony

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Subtotal:* 7 600 DA
🚚 *Delivery:* 600 DA
✨ *ESTIMATED TOTAL:* 8 200 DA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 *Next Steps:* Please confirm order availability and send payment details.
```

---

## 📄 License
MIT License. Handcrafted with passion by **Fleuria Handmade**.
