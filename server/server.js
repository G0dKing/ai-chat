// server.js //

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { OpenAI } = require('openai');
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const rateLimit = require('express-rate-limit');
const conversation = [];

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: 100, // 100 request limit
});
app.use(limiter);

// Completions Endpoint
const ollama = new OpenAI({
  baseURL: process.env.API_URL,
  apiKey: process.env.API_KEY,
  stream: true
});

// Chat API
app.post("/ai-chat", async (req, res) => {
  try {
    const prompt = req.body.message;

    const completion = await ollama.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    });
    const response = completion.choices[0].message.content;
    conversation.push(response);
    res.json({ message: response });
  } catch (error) {
    console.error("Error communicating with API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Conversation History
app.get("/ai/chat", (req, res) => {
  res.json({ messages: conversation });
});

// Client Build Files
app.use(
  express.static(path.join(__dirname, "..", "client", "dist"), {
    maxAge: "1d",
  })
);

// Fallback Request
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"), {
    cacheControl: true,
  });
});

// Deploy Express Server
app.listen(PORT, HOST, "0.0.0.0", () => {
  console.log(`Server Status: LIVE ( http://${HOST}:${PORT} )` );
});
