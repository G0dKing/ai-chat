// Ollama API via OpenAI

import { OpenAI } from 'open-ai';
// ...Other Imports...

// ...Middleware...

// Ollama Setup with OpenAI
const ollama = new OpenAI({
  baseURL: process.env.API_URL,
  apiKey: ollama
  stream: true,
});

// Endpoint
app.post("/ai-chat", async (req, res) => {
  try {
    const { prompt, model, history } = req.body;
    const messages = [...history, { role: "user", content: prompt }];
    const response = await ollama.chat.completions.create({
      model: model || process.env.MODEL,
      messages: messages,
    });
    const messageContent = response.choices[0].message.content;
    conversation.push(messageContent);
    res.status(200).json({ message: messageContent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ...Other Endpointa and Functions...
