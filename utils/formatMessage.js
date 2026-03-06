const axios = require('axios');

async function sendWhatsAppMessage(to, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  await axios.post(
    `https://graph.facebook.com/v17.0/${phoneId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: to,
      text: { body: message }
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

module.exports = { sendWhatsAppMessage };