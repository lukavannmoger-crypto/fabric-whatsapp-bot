require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { processMessage } = require('./utils/orderFlow');

const app = express();
app.use(bodyParser.json());

// --------------------
// WhatsApp Webhook Endpoint
// --------------------
app.post('/webhook', async (req, res) => {
  try {
    const entries = req.body.entry || [];
    for (let entry of entries) {
      const changes = entry.changes || [];
      for (let change of changes) {
        const messages = change.value.messages || [];
        for (let msg of messages) {
          await processMessage(msg);
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

// --------------------
// WhatsApp Verification (GET)
// --------------------
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// --------------------
// Health Check
// --------------------
app.get('/', (req, res) => {
  res.send('Wholesale Fabric WhatsApp AI Bot is running ✅');
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});