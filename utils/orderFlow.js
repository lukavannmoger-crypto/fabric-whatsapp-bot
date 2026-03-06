const { sendWhatsAppMessage } = require('./formatMessage');
const { askAI } = require('../openaiClient');
const axios = require('axios');

// --------------------
// Notify Agent via WhatsApp Group
// --------------------
async function notifyAgent(buyerSummary) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const agentGroupNumber = '573001234567'; // Replace with your WhatsApp group number

    const message = `
📌 *NUEVO LEAD (Wholesale Fabric)*
*Cliente:* ${buyerSummary.phone}
*Ciudad:* ${buyerSummary.city}
*Tipo:* ${buyerSummary.buyerType}
*Tela:* ${buyerSummary.fabric}
*Cantidad:* ${buyerSummary.quantity} rollos
*Notas:* ${buyerSummary.notes || 'N/A'}
`;

    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: agentGroupNumber,
        type: 'text',
        text: { body: message }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Agent notified successfully.');
  } catch (err) {
    console.error('Error notifying agent:', err);
  }
}

// --------------------
// Parse structured AI summary
// --------------------
function parseAISummary(aiReply) {
  try {
    const summaryText = aiReply.split('[AGENT_HANDOFF]')[0].trim();
    const structuredMatch = summaryText.match(/phone:\s*(.+)\ncity:\s*(.+)\nbuyerType:\s*(.+)\nfabric:\s*(.+)\nquantity:\s*(\d+)\nnotes:\s*(.*)/i);

    if (!structuredMatch) return null;

    return {
      phone: structuredMatch[1].trim(),
      city: structuredMatch[2].trim(),
      buyerType: structuredMatch[3].trim(),
      fabric: structuredMatch[4].trim(),
      quantity: parseInt(structuredMatch[5], 10),
      notes: structuredMatch[6].trim()
    };
  } catch (err) {
    console.error('Error parsing AI summary:', err);
    return null;
  }
}

// --------------------
// Main Message Processor
// --------------------
async function processMessage(msg) {
  try {
    const text = msg.text?.body || '';
    const phone = msg.from;

    // 1️⃣ Ask AI for response
    const aiReply = await askAI(text, phone);

    // 2️⃣ Send AI reply to buyer
    await sendWhatsAppMessage(phone, aiReply);

    // 3️⃣ Handle agent handoff
    if (aiReply.includes('[AGENT_HANDOFF]')) {
      const buyerSummary = parseAISummary(aiReply);

      if (buyerSummary) {
        await notifyAgent(buyerSummary);

        // Confirm to buyer
        await sendWhatsAppMessage(
          phone,
          'Nuestro agente humano se pondrá en contacto con usted pronto para confirmar su pedido y enviar el link de pago seguro.'
        );
      } else {
        console.error('Structured AI summary not found.');
      }
    }

  } catch (err) {
    console.error('Error in processMessage:', err);
  }
}

module.exports = { processMessage };