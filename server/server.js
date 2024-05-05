// server.js

// Import Variables
require("dotenv").config();

// Dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");
const { OpenAI } = require('openai');
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const rateLimit = require('express-rate-limit');

// Initialize
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate-Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter); // 100 requests per 15min per IP address

// OpenAI Client
const openai = new OpenAI({
  baseURL: process.env.API_URL,
  apiKey: process.env.API_KEY,
  stream: true
});

const chatHistory = [];

// Chat Endpoint
app.post("/ai/chat", async (req, res) => {
  try {
    const userInput = req.body.message;

    // Send message to Ollama
    const completion = await openai.chat.completions.create({
      model: 'llama3',
      messages: [{ role: 'user', content: userInput }],
    });

    // Extract the completed message from API response
    const assistantMessage = completion.choices[0].message.content;

    chatHistory.push(assistantMessage);

    // Send the assistant's response back to the client
    res.json({ message: assistantMessage });
  } catch (error) {
    console.error("Error communicating with API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Chat History
app.get("/ai/chat", (req, res) => {
  res.json({ messages: chatHistory });
});

// Serve Static Files
app.use(
  express.static(path.join(__dirname, "..", "client", "dist"), {
    maxAge: "1d",
  })
);

// Fallback URL
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"), {
    cacheControl: true,
  });
});

// Start server
app.listen(PORT, HOST, "0.0.0.0", () => {
  console.log(`Static build files deployed at http://${HOST}:${PORT}`);
});
