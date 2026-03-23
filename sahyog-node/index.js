const express      = require("express");
const cors         = require("cors");
const axios        = require("axios");
const fileUpload   = require("express-fileupload");
const FormData     = require("form-data");
require("dotenv").config();

const app     = express();
const PORT    = process.env.PORT || 3000;
const FASTAPI = process.env.FASTAPI_URL || "http://localhost:8000";

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
        const { email, phone } = req.body;
        const form = new URLSearchParams();
        if (email) form.append("email", email);
        if (phone) form.append("phone", phone);
        const r = await axios.post(`${FASTAPI}/auth/register`, form);
        res.json(r.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node server running on http://0.0.0.0:${PORT}`);
    console.log(`Forwarding to FastAPI at ${FASTAPI}`);
});
