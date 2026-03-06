const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY;
const SHOPIFY_PASSWORD = process.env.SHOPIFY_ADMIN_PASSWORD;

const shopify = axios.create({
  baseURL: `https://${SHOPIFY_API_KEY}:${SHOPIFY_PASSWORD}@${SHOPIFY_STORE}/admin/api/2026-01/`,
  headers: { 'Content-Type': 'application/json' }
});

// Fetch all products (50 fabrics)
async function getProducts() {
  const res = await shopify.get('products.json');
  return res.data.products;
}

// Create draft order
async function createDraftOrder(customer, items) {
  const res = await shopify.post('draft_orders.json', {
    draft_order: {
      line_items: items,
      customer: customer,
      use_customer_default_address: true,
      send_invoice: true
    }
  });
  return res.data.draft_order;
}

module.exports = { getProducts, createDraftOrder };
