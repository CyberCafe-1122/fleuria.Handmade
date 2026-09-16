/**
 * Fleuria Handmade - Store & Business Configuration
 * Store owners can customize the WhatsApp number, currency, and business details here.
 */
const DEFAULT_CONFIG = {
  storeName: "Fleuria Handmade",
  tagline: "Artisan Crochet Florals, Botanical Candles & Handcrafted Gifts",
  // WhatsApp business number in international format without '+' or spaces
  whatsappNumber: "213555812564",
  whatsappDisplay: "+213 555 81 25 64",
  currency: "$",
  currencyCode: "USD",
  freeShippingThreshold: 60,
  standardShippingFee: 5,
  instagram: "@fleuria.handmade",
  email: "orders@fleuriahandmade.com",
  location: "Artisan Botanical Studio, Suite 4B",
  workingHours: "Mon - Sat: 9:00 AM - 7:00 PM",
  responseTime: "Usually replies within 10 minutes",
  welcomeOfferCode: "FLEURIA10"
};

// Load persistent config or fallback to defaults
const StoreConfig = {
  ...DEFAULT_CONFIG,
  ...(function() {
    try {
      const saved = localStorage.getItem("fleuria_store_config");
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      if (parsed.whatsappNumber === "15551234567") {
        parsed.whatsappNumber = "213555812564";
        parsed.whatsappDisplay = "+213 555 81 25 64";
        localStorage.setItem("fleuria_store_config", JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return {};
    }
  })()
};

// Save updated config
function updateStoreConfig(newValues) {
  Object.assign(StoreConfig, newValues);
  try {
    localStorage.setItem("fleuria_store_config", JSON.stringify(StoreConfig));
  } catch (e) {
    console.warn("Could not persist store config", e);
  }
  // Dispatch event so UI updates immediately
  window.dispatchEvent(new CustomEvent("storeConfigChanged", { detail: StoreConfig }));
}

// Reset store config to default
function resetStoreConfig() {
  localStorage.removeItem("fleuria_store_config");
  Object.assign(StoreConfig, DEFAULT_CONFIG);
  window.dispatchEvent(new CustomEvent("storeConfigChanged", { detail: StoreConfig }));
}

// Helper to format currency
function formatCurrency(amount) {
  const val = Number(amount) || 0;
  return `${StoreConfig.currency}${val.toFixed(2)}`;
}

// Helper to build WhatsApp URL with encoded message
function buildWhatsAppUrl(phone, textMessage) {
  const cleanPhone = (phone || StoreConfig.whatsappNumber).replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(textMessage);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

// Expose globally
window.StoreConfig = StoreConfig;
window.updateStoreConfig = updateStoreConfig;
window.resetStoreConfig = resetStoreConfig;
window.formatCurrency = formatCurrency;
window.buildWhatsAppUrl = buildWhatsAppUrl;
