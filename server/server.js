require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || "localhost";
const conversationStore = new Map(); // Stores conversation history indexed by sessionId

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

// Model Mapping
const modelMapping = {
  "Llama-2": "meta-llama/Llama-2-7b-chat-hf",
  CodeLlama: "facebook/incoder-6B",
  Mistral: "mistralai/Mistral-7B",
  Phi: "openai-gpt-3",
  Gemma: "gemma-llm-6b",
  "GPT Neo": "EleutherAI/gpt-neo-2.7B",
};

// Hugging Face API Key
if (!process.env.HF_API_KEY) {
  console.error("Hugging Face API Key is not set.");
  process.exit(1);
}

// Chat API
app.post("/ai-chat", async (req, res) => {
  const { prompt, model, sessionId } = req.body;
  const conversation = conversationStore.get(sessionId) || [];
  const history = conversation.map((m) => `${m.role}: ${m.text}`).join("\n");

  const messages = `${history}\nUser: ${prompt}`;
  const selectedModel = modelMapping[model] || modelMapping["Llama-2"];

  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${selectedModel}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: messages }),
      }
    );

    const result = await response.json();
    console.log("Hugging Face API response:", result);
    if (!response.ok)
      throw new Error(result.error || "Error querying Hugging Face API");

    const messageContent =
      result.generated_text?.split("\n").pop().trim()

    conversation.push({
      content: messageContent,
      role: "assistant",
    }); // Update conversation
    conversationStore.set(conversation); // Store updated conversation

    res.status(200).json({ message: messageContent });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve Client Build Files
app.use(
  express.static(path.join(__dirname, "..", "client", "dist"), { maxAge: "1d" })
);

// Fallback for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"), {
    cacheControl: true,
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Status: LIVE ( http://${HOST}:${PORT} )`);
});
