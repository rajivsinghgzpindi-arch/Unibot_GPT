// server.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config(); // load .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (images, css, js)
app.use(express.static(__dirname));

console.log("Loaded OpenAI key:", process.env.OPENAI_API_KEY ? "YES" : "NO");

// Serve index2.html at root
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index2.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Error sending index2.html:", err);
      res.status(500).send("❌ Could not load the page.");
    }
  });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "Please type a message." });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  try {
    if (apiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      console.log("OpenAI response:", JSON.stringify(data, null, 2));

      if (data?.choices?.[0]?.message?.content) {
        return res.json({ reply: data.choices[0].message.content.trim() });
      }

      console.warn("⚠️ OpenAI error, falling back to demo:", data?.error);
    } else {
      console.warn("⚠️ No API key found, using demo mode.");
    }
  } catch (err) {
    console.error("❌ Error contacting OpenAI:", err);
  }

  // Always fallback if OpenAI fails
  return res.json({ reply: demoReply(message) });
});

// ---------------------------
// DEMO FALLBACK REPLY SYSTEM
// ---------------------------
function demoReply(userMessage) {
  const m = (userMessage || "").toLowerCase();

  if (m.includes("hi") || m.includes("hello")) return "👋 Hello! (Demo mode)";
  if (m.includes("exam")) return "📝 Demo exam info: Exams are held in December.";
  if (m.includes("timing") || m.includes("time")) return "⏰ Demo timing info: Classes run from 9 AM to 5 PM.";
  if (m.includes("canteen") || m.includes("food")) return "🍴 Demo canteen info: Open from 8 AM to 8 PM.";
  if (m.includes("library")) return "📚 Demo library info: Open Mon–Fri 8:00–20:00.";
  if (m.includes("placement")) return "💼 Demo placement info: Weekly sessions on Friday.";
  if (m.includes("wifi") || m.includes("internet")) return "🌐 Demo Wi-Fi info: Connect to CampusNet with student ID.";

  return `🤖 Demo mode: I received your message "${userMessage}".`;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

