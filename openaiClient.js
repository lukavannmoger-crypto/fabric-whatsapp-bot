// openaiClient.js
const OpenAI = require("openai");
const fs = require("fs");

// Initialize OpenAI client (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Read your system prompt
const systemPrompt = fs.readFileSync('./prompts/aiPrompt.txt', 'utf8');

// Function to send message to OpenAI
async function askAI(userMessage, phone) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  return completion.choices[0].message.content;
}

module.exports = { askAI };