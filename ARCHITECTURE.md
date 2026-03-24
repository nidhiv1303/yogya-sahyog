# Yogya / Sahyog — System Architecture

**IAR Udaan Hackathon 2026 | Team Yogya**

---

## Overview

Yogya is a three-tier AI-powered web application. A React frontend talks to a Node.js middleware, which proxies all requests to a Python FastAPI backend. The FastAPI server owns the PostgreSQL database, OCR pipeline, and voice transcription. A fourth service (RAG/AI pipeline) is being built by Kushagra and will attach to FastAPI as a separate server on port 8001.

---

## Running Services

| Service | Stack | Port | Command | Owner |
|---|---|---|---|---|
| Frontend | React + Vite | 5173 | `npm run dev` | Jaypalsinh |
| Node Middleware | Express.js | 3000 | `node index.js` | Yug / Jaypalsinh |
| FastAPI Backend | Python + Uvicorn | 8000 | `python main.py` | Yug |
| PostgreSQL | Database | 5432 | (always running) | Yug |
| RAG Server (WIP) | FastAPI + ChromaDB | 8001 | TBD | Kushagra |

---

## Directory Structure

```
D:/sahyog/
├── main.py               ← FastAPI app (all DB + OCR + voice endpoints)
├── database.py           ← SQLAlchemy models, 11 tables
├── extractors.py         ← OCR logic (pdfplumber + pytesseract)
├── uploads/              ← Uploaded document files stored here
│
├── sahyog-node/
│   ├── index.js          ← Express middleware (proxies to FastAPI)
│   └── package.json
│
└── sahyog-frontend/
    └── src/
        ├── api/index.js          ← All HTTP calls from frontend
        ├── firebase.js           ← Firebase Auth init
        ├── context/AppContext.jsx ← Global state (user, messages, schemes)
        ├── pages/
        │   ├── Landing.jsx       ← Public landing page
        │   ├── Register.jsx      ← Firebase auth + profile creation
        │   └── Dashboard.jsx     ← Main chat + profile UI
        └── components/
            ├── ChatWindow.jsx    ← Chat UI + message sending
            ├── VoiceInput.jsx    ← Mic recording + transcription
            ├── ProfilePanel.jsx  ← Left sidebar profile
            ├── ProfileDrawer.jsx ← Edit profile form
            ├── DocumentUpload.jsx ← File upload dropzone
            ├── SchemeCard.jsx    ← Scheme result card
            └── Navbar.jsx        ← Top navigation bar
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│                                                             │
│   React + Vite  (localhost:5173)                            │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │ Landing.jsx │  │ Register.jsx │  │  Dashboard.jsx   │  │
│   └─────────────┘  └──────┬───────┘  └────────┬─────────┘  │
│                           │                   │             │
│                    Firebase Auth          ChatWindow        │
│                    (email+password)       VoiceInput        │
│                    → user.uid (UUID)      ProfilePanel      │
│                           │              DocumentUpload     │
│                           │                   │             │
│                    src/api/index.js ◄──────────┘            │
│                    (all fetch calls)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP (localhost:3000)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              NODE.JS MIDDLEWARE  (port 3000)                 │
│              sahyog-node/index.js                           │
│                                                             │
│  POST /api/auth/register      → forwards to FastAPI         │
│  POST /api/profile/general    → forwards to FastAPI         │
│  POST /api/profile/category   → forwards to FastAPI         │
│  POST /api/profile/documents  → forwards to FastAPI         │
│  GET  /api/citizen-data/:id   → forwards to FastAPI         │
│  POST /api/voice/transcribe   → forwards to FastAPI         │
│                                                             │
│  Libraries: express, axios, express-fileupload, form-data   │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP (localhost:8000)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              FASTAPI BACKEND  (port 8000)                    │
│              main.py                                        │
│                                                             │
│  POST /auth/register          → upsert user in PostgreSQL   │
│  POST /profile/general        → save general info           │
│  POST /profile/category       → save category details       │
│  POST /profile/documents      → OCR + save files            │
│  GET  /citizen-data/:id       → compile full citizen JSON   │
│  POST /voice/transcribe       → faster-whisper STT          │
│  GET  /submissions/all        → admin view all data         │
│                                                             │
│  Libraries: fastapi, sqlalchemy, uvicorn, faster-whisper    │
│             pdfplumber, pytesseract, deep-translator        │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
           ▼                            ▼
┌──────────────────────┐    ┌───────────────────────────────┐
│  PostgreSQL Database │    │  RAG Server (WIP, port 8001)  │
│  (sahyog db)         │    │  Kushagra                     │
│                      │    │                               │
│  11 Tables:          │    │  GET /citizen-data/:id  ◄─────┤
│  · users             │    │  (calls FastAPI to get        │
│  · general_info      │    │   citizen JSON, then runs     │
│  · education_details │    │   RAG over scheme PDFs)       │
│  · agriculture_details    │                               │
│  · health_details    │    │  ChromaDB vector store        │
│  · housing_details   │    │  Qwen LLM via Ollama          │
│  · social_welfare_   │    │  POST /rag/query              │
│    details           │    │  → returns matched schemes    │
│  · business_details  │    │    with PDF citations         │
│  · jobs_details      │    └───────────────────────────────┘
│  · documents         │
│  · compiled_         │
│    submissions       │
└──────────────────────┘
```

---

## Request Flows

### 1. User Registration

```
Browser
  → Firebase createUserWithEmailAndPassword(email, password)
  ← Firebase returns user.uid  (e.g. "abc123xyz...")

Browser stores: localStorage.yogya_user_id = user.uid

Browser
  → POST localhost:3000/api/auth/register
     { firebase_uid, email, username, phone, state, language }

Node.js
  → POST localhost:8000/auth/register
     (url-encoded form)

FastAPI
  → PostgreSQL: INSERT INTO users (id=firebase_uid, email=...) ON CONFLICT DO UPDATE
  ← { user_id, is_new, email }

Response flows back → Node → Browser
```

### 2. Saving Profile

```
Browser (ProfileDrawer form submit)
  → POST localhost:3000/api/profile/general
     { user_id, full_name, age, state, annual_income, ... }

Node.js
  → POST localhost:8000/profile/general

FastAPI
  → PostgreSQL: UPSERT general_info WHERE user_id = ?
  ← { success: true }
```

### 3. Document Upload + OCR

```
Browser (DocumentUpload dropzone)
  → POST localhost:3000/api/profile/documents
     FormData { user_id, files: [aadhaar.jpg] }

Node.js
  → POST localhost:8000/profile/documents
     (multipart forwarded via form-data)

FastAPI extractors.py
  → pdfplumber.open(pdf) → extract text     (for PDFs)
  → pytesseract.image_to_string(img)        (for images)
  → PostgreSQL: INSERT INTO documents (extracted_text=...)
  ← { documents_saved: [{ doc_type, filename }] }

Browser shows extracted text preview in UI
```

### 4. Voice Input

```
Browser (mic button held)
  → MediaRecorder records audio → WebM blob

Browser (mic button released)
  → POST localhost:3000/api/voice/transcribe
     FormData { audio: recording.webm }

Node.js
  → POST localhost:8000/voice/transcribe
     (audio file forwarded)

FastAPI
  → faster-whisper.transcribe(audio, language=None)
     auto-detects Hindi / English / Gujarati
  ← { text: "मुझे किसान योजना चाहिए", language: "hi" }

Browser puts transcribed text into chat input box
User presses Send → goes to chat flow below
```

### 5. Chat Message (Current — Mock)

```
Browser (user types or sends voice text)
  → sendChatMessage(user_id, message)       [src/api/index.js]

Currently: keyword matching in frontend mock (mockSchemes.js)
  → returns { reply, schemes[] }

Planned (when Kushagra finishes):
  → POST localhost:3000/api/chat
  → Node → POST localhost:8001/rag/query  { user_id, message }
  → RAG server fetches citizen JSON from FastAPI
  → runs ChromaDB semantic search on scheme PDFs
  → Qwen LLM generates response with citations
  ← { reply, schemes[], citations[] }
```

### 6. Load Citizen Data on Dashboard

```
Browser (Dashboard.jsx mounts)
  → GET localhost:3000/api/citizen-data/:user_id

Node.js
  → GET localhost:8000/citizen-data/:user_id

FastAPI
  → JOIN: users + general_info + category_details + documents
  → saves compiled JSON to compiled_submissions table
  ← full citizen JSON object

Browser updates profile panel with saved data
```

---

## Database Schema (11 Tables)

```
users
  id (VARCHAR, PK = Firebase UID)
  email, phone, verified, created_at

general_info  [1:1 with users]
  user_id → users.id
  full_name, age, gender, state, district
  caste_category, religion, disability
  annual_income, employment_type, bpl_card
  aadhaar_number, bank_account, bank_ifsc
  need_category, language

education_details     [1:1, only if need = education]
agriculture_details   [1:1, only if need = agriculture]
health_details        [1:1, only if need = health]
housing_details       [1:1, only if need = housing]
social_welfare_details [1:1, only if need = social_welfare]
business_details      [1:1, only if need = business]
jobs_details          [1:1, only if need = jobs]

documents  [1:many with users]
  user_id, doc_type, file_path, extracted_text

compiled_submissions  [1:many with users]
  user_id, compiled_json (full profile as JSON)
  → this is what Kushagra's RAG reads
```

---

## Authentication Flow

```
Firebase (cloud)          Frontend              PostgreSQL
     │                       │                      │
     │  createUser(email,pw) │                      │
     │◄──────────────────────│                      │
     │  user.uid ────────────►                      │
     │                       │  POST /auth/register │
     │                       │─────────────────────►│
     │                       │  { firebase_uid,     │
     │                       │    email, username } │
     │                       │                      │ UPSERT users
     │                       │◄─────────────────────│ SET id = firebase_uid
     │                       │                      │
     │  Firebase verifies    │                      │
     │  password on every    │  localStorage stores │
     │  future login ────────► yogya_user_id = uid  │
```

Firebase handles password hashing, email verification, and session management. PostgreSQL stores the same UID as the primary key so both systems stay in sync.

---

## Environment Variables

### FastAPI (`D:/sahyog/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/sahyog
```

### Node.js (`D:/sahyog/sahyog-node/.env`)
```
PORT=3000
FASTAPI_URL=http://localhost:8000
```

### Frontend (`D:/sahyog/sahyog-frontend/src/firebase.js`)
```js
apiKey, authDomain, projectId, appId  ← from Firebase Console
```

---

## What is Mocked vs Real

| Feature | Status | Notes |
|---|---|---|
| Firebase Auth | Real | Email + password working |
| User registration | Real | PostgreSQL via FastAPI |
| General profile save | Real | All fields persist |
| Category details save | Real | 7 categories |
| Document upload + OCR | Real | pdfplumber + tesseract |
| Voice transcription | Real | faster-whisper on FastAPI |
| Chat replies | **Mocked** | keyword match in frontend |
| Scheme matching | **Mocked** | hardcoded mockSchemes.js |
| RAG pipeline | **WIP** | Kushagra building on port 8001 |
| PDF citations | **WIP** | Part of RAG pipeline |
| Conflict detection | **WIP** | Part of RAG pipeline |

---

## How to Start Everything

```bash
# 1. PostgreSQL — make sure it's running

# 2. FastAPI (terminal 1)
cd D:/sahyog
python main.py
# Running on http://0.0.0.0:8000

# 3. Node.js (terminal 2)
cd D:/sahyog/sahyog-node
node index.js
# Running on http://0.0.0.0:3000

# 4. Frontend (terminal 3)
cd D:/sahyog/sahyog-frontend
npm run dev
# Running on http://localhost:5173
```

---

## API Reference (Node.js — what frontend calls)

| Method | Endpoint | Body / Params | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `{ firebase_uid, email, username, phone, state, language }` | `{ user_id, is_new }` |
| POST | `/api/profile/general` | all general info fields | `{ success }` |
| POST | `/api/profile/category` | `{ user_id, need, ...category fields }` | `{ success }` |
| POST | `/api/profile/documents` | FormData `{ user_id, files[] }` | `{ documents_saved[] }` |
| GET | `/api/citizen-data/:user_id` | — | full citizen JSON |
| POST | `/api/voice/transcribe` | FormData `{ audio: blob }` | `{ text, language }` |
| GET | `/health` | — | `{ node: ok, fastapi: ok }` |

---

*Last updated: March 2026 | Team Yogya — IAR Udaan Hackathon*
