const express = require('express');
const router = express.Router();
const { processMessage } = require('./orderFlow');

router.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
    const messages = body.entry[0].changes[0].value.messages;
    for (let msg of messages) {
      await processMessage(msg);
    }
  }
  res.sendStatus(200);
});

// WhatsApp verification
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

module.exports = router;