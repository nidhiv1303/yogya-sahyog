const express      = require("express");
const cors         = require("cors");
const axios        = require("axios");
const fileUpload   = require("express-fileupload");
const FormData     = require("form-data");
require("dotenv").config();

const app     = express();
const PORT    = process.env.PORT || 3000;
const FASTAPI = process.env.FASTAPI_URL || "http://localhost:8000";

// ── Simple structured logger ────────────────────────────────
const log = {
    info:  (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO  ${msg}`, ...args),
    warn:  (msg, ...args) => console.warn(`[${new Date().toISOString()}] WARN  ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[${new Date().toISOString()}] ERROR ${msg}`, ...args),
};

// Extract a useful error string from axios errors
function errMsg(e) {
    if (e?.response?.data) {
        const d = e.response.data;
        return `HTTP ${e.response.status} — ${typeof d === "object" ? JSON.stringify(d) : d}`;
    }
    return e?.code ? `${e.code}: ${e.message}` : (e?.message || String(e));
}

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// ── HEALTH ────────────────────────────────────────────────

app.get("/health", async (req, res) => {
    try {
        const r = await axios.get(`${FASTAPI}/health`);
        res.json({ node: "ok", fastapi: r.data });
    } catch (e) {
        res.json({ node: "ok", fastapi: "unreachable" });
    }
});

// ── AUTH ──────────────────────────────────────────────────

// CREATE user
app.post("/api/auth/register", async (req, res) => {
    try {
        const { firebase_uid, email, phone } = req.body;
        const form = new URLSearchParams();
        if (firebase_uid) form.append("firebase_uid", firebase_uid);
        if (email) form.append("email", email);
        if (phone) form.append("phone", phone);
        const r = await axios.post(`${FASTAPI}/auth/register`, form);
        log.info("Register  uid=%s  email=%s  is_new=%s", firebase_uid, email, r.data.is_new);
        res.json(r.data);
    } catch (e) {
        log.error("Register failed: %s", errMsg(e));
        res.status(500).json({ error: errMsg(e) });
    }
});

// ── GENERAL INFO ──────────────────────────────────────────

// CREATE / UPDATE general info
app.post("/api/profile/general", async (req, res) => {
    try {
        const form = new URLSearchParams();
        Object.entries(req.body).forEach(([k, v]) => {
            if (v !== null && v !== undefined) form.append(k, v);
        });
        const r = await axios.post(`${FASTAPI}/profile/general`, form);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── CATEGORY DETAILS ──────────────────────────────────────

// CREATE / UPDATE category details
app.post("/api/profile/category", async (req, res) => {
    try {
        const form = new URLSearchParams();
        Object.entries(req.body).forEach(([k, v]) => {
            if (v !== null && v !== undefined) form.append(k, v);
        });
        const r = await axios.post(`${FASTAPI}/profile/category`, form);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── DOCUMENTS ─────────────────────────────────────────────

// CREATE / UPLOAD documents
app.post("/api/profile/documents", async (req, res) => {
    try {
        const { user_id } = req.body;
        const form        = new FormData();
        form.append("user_id", user_id);

        if (req.files) {
            Object.values(req.files).forEach(file => {
                form.append("files", file.data, {
                    filename:    file.name,
                    contentType: file.mimetype
                });
            });
        }

        const r = await axios.post(`${FASTAPI}/profile/documents`, form, {
            headers: form.getHeaders()
        });
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── READ OPERATIONS ───────────────────────────────────────

// READ compiled citizen data by user_id
app.get("/api/citizen-data/:user_id", async (req, res) => {
    try {
        const r = await axios.get(`${FASTAPI}/citizen-data/${req.params.user_id}`);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// READ specific submission by submission_id
app.get("/api/submission/:submission_id", async (req, res) => {
    try {
        const r = await axios.get(`${FASTAPI}/submission/${req.params.submission_id}`);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// READ all submissions for a user
app.get("/api/submissions/user/:user_id", async (req, res) => {
    try {
        const r = await axios.get(`${FASTAPI}/submissions/user/${req.params.user_id}`);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// READ all submissions (admin)
app.get("/api/submissions/all", async (req, res) => {
    try {
        const r = await axios.get(`${FASTAPI}/submissions/all`);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── CHAT (RAG AGENT) ──────────────────────────────────────

app.post("/api/chat", async (req, res) => {
    try {
        const { user_id, message } = req.body;
        if (!message) return res.status(400).json({ error: "message is required" });

        const form = new URLSearchParams();
        if (user_id) form.append("user_id", user_id);
        form.append("message", message);

        log.info("Chat  user=%s  msg=%s", user_id, message.slice(0, 60));
        const r = await axios.post(`${FASTAPI}/chat`, form, { timeout: 120000 });
        log.info("Chat  user=%s  schemes=%d", user_id, r.data.schemes?.length || 0);
        res.json(r.data);
    } catch (e) {
        log.error("Chat proxy error: %s", errMsg(e));
        res.status(500).json({ error: errMsg(e), reply: "Something went wrong. Please try again.", schemes: [] });
    }
});

// ── VOICE TRANSCRIPTION ───────────────────────────────────

// Receives audio blob from frontend, forwards to FastAPI /voice/transcribe
app.post("/api/voice/transcribe", async (req, res) => {
    try {
        if (!req.files || !req.files.audio) {
            return res.status(400).json({ error: "No audio file received" });
        }

        const audioFile = req.files.audio;
        const form      = new FormData();
        form.append("audio", audioFile.data, {
            filename:    audioFile.name || "recording.webm",
            contentType: audioFile.mimetype || "audio/webm",
        });

        const r = await axios.post(`${FASTAPI}/voice/transcribe`, form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
        });

        log.info("Voice transcribed [%s]: %s", r.data.language, r.data.text?.slice(0, 60));
        res.json(r.data);
    } catch (e) {
        log.error("Voice transcription error: %s", errMsg(e));
        res.status(500).json({ error: errMsg(e), text: "" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    log.info("Node server listening on http://0.0.0.0:%s", PORT);
    log.info("Forwarding API calls to FastAPI at %s", FASTAPI);
});
