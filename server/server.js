require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { OpenAI } = require("openai");
const rateLimit = require("express-rate-limit");

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const conversation = [];

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize OpenAI Instance
const ollama = new OpenAI({
  baseURL: process.env.API_URL,
  apiKey: process.env.API_KEY,
  stream: true,
});

// Chat API
app.post("/ai-chat", async (req, res) => {
  try {
    const { prompt, model, role, instruction } = req.body;

    // Log request body for debugging
    console.log("Request body:", req.body);

    const messages = [
      {
        role: "system" || process.env.ROLE, content: instruction || process.env.INSTRUCTION ||'You are a helpful assistant' ,},
      { role: "user", content: prompt },
    ];

    const completion = await ollama.chat.completions.create({
      model: model || process.env.MODEL,
      messages: messages,
    });

    const response = completion.choices[0].message.content;
    conversation.push(response);
    res.status(200).json({ message: response });
  } catch (error) {
    console.error("Error:", error); // Improved error logging
    res.status(500).json({ error: "Server Error" });
  }
});

// Conversation History API
app.get("/ai/chat", (req, res) => {
  res.status(200).json({ messages: conversation });
});

// Serve Client Build Files
app.use(
  express.static(path.join(__dirname, "..", "client", "dist"), {
    maxAge: "1d",
  })
);

// Fallback for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"), {
    cacheControl: true,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server Status: LIVE ( http://${HOST}:${PORT} )`);
});
