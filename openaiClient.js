const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const systemPrompt = fs.readFileSync('./prompts/aiPrompt.txt', 'utf8');

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