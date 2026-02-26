const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const messagesFile = "messages.json";
const mutedFile = "muted.json";

if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, "[]");
if (!fs.existsSync(mutedFile)) fs.writeFileSync(mutedFile, "[]");

function loadMessages() { return JSON.parse(fs.readFileSync(messagesFile)); }
function saveMessages(messages) { fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2)); }

function loadMuted() { return JSON.parse(fs.readFileSync(mutedFile)); }
function saveMuted(muted) { fs.writeFileSync(mutedFile, JSON.stringify(muted, null, 2)); }

// ------------------- API ------------------- //

app.get("/api/messages", (req, res) => {
  res.json(loadMessages());
});

app.post("/api/messages", (req, res) => {
  const { user, text, nickname } = req.body;
  if (!user || !text) return res.status(400).json({ error: "Invalid data" });

  const muted = loadMuted();
  if (muted.includes(user)) return res.status(403).json({ error: "You are muted" });

  const messages = loadMessages();
  messages.push({
    user,
    text,
    nickname: nickname || null,
    time: new Date().toISOString()
  });
  saveMessages(messages);
  res.json({ success: true });
});

// ------------------- OWNER COMMANDS ------------------- //

app.post("/api/clear", (req, res) => {
  const { owner } = req.body;
  if (owner !== "yusupov.elshodbek") return res.status(403).json({ error: "Not allowed" });
  saveMessages([]);
  res.json({ success: true });
});

app.post("/api/mute", (req, res) => {
  const { owner, target } = req.body;
  if (owner !== "yusupov.elshodbek") return res.status(403).json({ error: "Not allowed" });

  const muted = loadMuted();
  if (!muted.includes(target)) muted.push(target);
  saveMuted(muted);
  res.json({ success: true });
});

app.post("/api/unmute", (req, res) => {
  const { owner, target } = req.body;
  if (owner !== "yusupov.elshodbek") return res.status(403).json({ error: "Not allowed" });

  let muted = loadMuted();
  muted = muted.filter(u => u !== target);
  saveMuted(muted);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));