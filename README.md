<p align="center">
  <img src="static/assets/logo.png" width="90" />
</p>

<h1 align="center">Yogya Sahyog — योग्य सहयोग</h1>

<p align="center">
  <strong>AI That Navigates Government Schemes So Citizens Don't Have To.<br/>
  From plain language input to matched schemes — in under 2 minutes.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/RAG-ChromaDB-FF6B35?style=flat-square" />
  <img src="https://img.shields.io/badge/LLM-Qwen%202.5%2072B-4285F4?style=flat-square" />
  <img src="https://img.shields.io/badge/OCR-pytesseract-3776AB?style=flat-square&logo=python" />
</p>

<p align="center">
  <strong>Agentic RAG · Multi-Query Retrieval · Conflict Detection · Hindi Support · OCR Pipeline</strong>
</p>

---

## 🚀 Overview

**Yogya Sahyog** is a next-generation **AI-powered government scheme navigator** built to connect every eligible Indian citizen with the welfare schemes they deserve — but have never been able to find.

Built for the IAR Udaan Hackathon 2026 (Theme: AI • GenAI • RAG), Yogya Sahyog solves the last-mile problem of government welfare delivery by combining agentic RAG, multilingual OCR, and a conversational AI interface into a single end-to-end system.

- ✅ **Zero hallucinations** — every recommendation cites the exact PDF clause it came from
- ✅ **Conflict detection** — flags contradictions between central and state versions of the same scheme
- ✅ **Plain language input** — citizens describe their situation in Hindi, Gujarati, or English
- ✅ **OCR document pipeline** — Aadhaar, income certificates, land records extracted automatically
- ✅ **760 real government PDFs** — not summaries, actual scheme documents ingested into ChromaDB
- ✅ **Hindi output** — every response translatable to plain Hindi for rural citizens

---

## 🎯 Problem Statement

India has 650+ central and state government welfare schemes. Yet ₹2.3 Lakh Crore in benefits go unclaimed every year.

| Problem | Root Cause | Severity |
|---------|-----------|----------|
| ❌ Citizens don't know schemes exist | No intelligent discovery layer — MyScheme.gov.in is just a search box | Systemic exclusion |
| ❌ Language barriers | Guidelines in English/formal Hindi — rural citizens cannot read them | 700M+ affected |
| ❌ Document confusion | Each scheme needs a different set of documents — citizens collect wrong ones for months | Time and money lost |
| ❌ Bureaucratic complexity | Multiple offices, forms, and follow-ups — most citizens give up | Benefits unclaimed |
| ❌ Central vs state conflicts | Same scheme has different eligibility across central and state versions | Citizen misadvised |

> India has **4,000+ government district hospitals**, **8 lakh+ registered pharmacies**, and **650+ welfare schemes** — yet **73% of eligible citizens never claim what they are owed**.
> A farmer who qualifies for PM-KISAN but doesn't know about it loses ₹6,000 every year, every year.

**Yogya Sahyog solves all of these with precision, AI, and real document grounding.**

---

## ⚡ Quick Start

### 1. Clone and Install Backend

```bash
git clone https://github.com/team-yogya/yogya-sahyog
cd yogya-sahyog/sahyog-backend

python -m venv venv
source venv/Scripts/activate        # Windows
source venv/bin/activate            # Mac/Linux

pip install fastapi uvicorn sqlalchemy psycopg2-binary pdfplumber \
            pytesseract httpx python-multipart pillow deep-translator \
            python-dotenv
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL password
```

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sahyog
```

### 3. Create PostgreSQL Database

```bash
psql -U postgres -c "CREATE DATABASE sahyog;"
```

### 4. Start Backend

```bash
python main.py
# FastAPI running on http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 5. Start Node Middleware

```bash
cd ../sahyog-node
npm install
node index.js
# Node server running on http://localhost:3000
```

### 6. Start Frontend

```bash
cd ../sahyog-frontend
npm install
npm run dev
# Vite dev server on http://localhost:5173
```

---

## 🗄️ Database Setup — PostgreSQL

Yogya Sahyog uses **PostgreSQL** with 11 purpose-built tables covering every government scheme category.

Tables are auto-created on first server start via SQLAlchemy `Base.metadata.create_all()`.

### Schema Overview

```
sahyog (database)
│
├── users                    ← Created when citizen registers with email
├── general_info             ← Core profile: name, age, state, caste, income
├── education_details        ← Filled when need_category = education
├── agriculture_details      ← Filled when need_category = agriculture
├── health_details           ← Filled when need_category = health
├── housing_details          ← Filled when need_category = housing
├── social_welfare_details   ← Filled when need_category = social_welfare
├── business_details         ← Filled when need_category = business
├── jobs_details             ← Filled when need_category = jobs
├── documents                ← Uploaded files + extracted OCR text
└── compiled_submissions     ← Final JSON served to RAG server (one per user, upsert)
```

### Key Table: `compiled_submissions`

This is the single most important table. It contains the complete citizen JSON that the RAG server calls to run scheme matching.

```json
{
  "user_id": "ca1e1c6d-...",
  "submission_id": "b51f2519-...",
  "email": "ramesh@gmail.com",
  "general_info": {
    "full_name": "Ramesh Kumar",
    "age": 45,
    "state": "Gujarat",
    "caste_category": "OBC",
    "annual_income": 120000,
    "employment_type": "Farmer",
    "bpl_card": true,
    "need_category": "agriculture"
  },
  "category_details": {
    "land_acres": 2.0,
    "crop_type": "wheat",
    "irrigation": true,
    "farm_income": 100000
  },
  "documents": {
    "aadhaar": {
      "extracted_text": "Name: Ramesh Kumar DOB: 01/01/1979...",
      "file_path": "uploads/ca1e1c6d_aadhaar_aadhaar.jpg"
    }
  }
}
```

> **Important:** `compiled_submissions` uses **upsert behavior** — calling `/citizen-data/{user_id}` any number of times always keeps exactly one record per user, updated in place.

---

## 🏗️ System Architecture

```
                         CITIZEN (Browser)
                               |
                    ┌──────────▼──────────┐
                    │   React Frontend     │  Vite + Tailwind + Framer Motion
                    │   Port: 5173         │  3D UI · Glass morphism · Particle BG
                    └──────────┬──────────┘
                               |  fetch() API calls
                    ┌──────────▼──────────┐
                    │  Node.js Middleware  │  Express.js
                    │  Port: 3000          │  Route forwarding · CORS · File proxy
                    └──────────┬──────────┘
                               |  axios forwarding
                    ┌──────────▼──────────┐
                    │   FastAPI Backend    │  Python 3.13
                    │   Port: 8000         │  OCR · Auth · Profile · Compile
                    └──────┬──────────────┘
                           |              |
              ┌────────────▼──┐    ┌──────▼──────────────────┐
              │  PostgreSQL   │    │     RAG Server           │
              │  Port: 5432   │    │     Port: 8001           │
              │  11 Tables    │    │                          │
              │               │    │  Intent Classifier        │
              │               │    │  Multi-Query Retriever    │
              │               │    │  ChromaDB Vector DB       │
              │               │    │  Conflict Detector        │
              │               │    │  Qwen 2.5 72B LLM         │
              └───────────────┘    └──────────────────────────┘
```

---

## 🤖 RAG Pipeline — 6 Steps

Yogya Sahyog uses an **Agentic RAG architecture** — not a single query, but an intelligent multi-step pipeline grounded in real government documents.

### Phase 1 — Build Index (runs once)

#### Step 1 — PDF Ingestion (`core/ingestor.py`)

```
760 government scheme PDFs
        ↓
PyMuPDF opens each PDF page by page
        ↓
400-word overlapping chunks (80-word overlap)
Overlap prevents sentence cutoff at chunk boundaries
        ↓
Metadata tagged per chunk:
  scheme_name  → "PM-KISAN"
  level        → "central" or "state"
  state        → "all" or "Gujarat" etc
  source_pdf   → "Revised_Operational_Guidelines.pdf"
  page         → 4
  clause       → "Section 4.1"
  chunk_index  → 12

Level and state auto-detected from:
  1. Filename convention (PM-KISAN_central.pdf)
  2. First page text scan for state names
        ↓
Result: 9,759 tagged chunks from 760 PDFs
```

#### Step 2 — Embedding (`core/embedder.py`)

```
Each chunk text
        ↓
sentence-transformers: all-MiniLM-L6-v2
        ↓
384-dimensional vector representation

Semantically similar phrases produce close vectors:
"farmer with income below 1.5 lakh"
≈ "small and marginal cultivator annual income not exceeding one lakh fifty thousand"
```

#### Step 3 — ChromaDB Storage

```
9,759 vectors + rich metadata
        ↓
ChromaDB persistent storage (chroma_db/ folder)
HNSW indexing — Hierarchical Navigable Small World
Cosine similarity metric

Score thresholds:
  >= 0.65  → Strong match
  >= 0.50  → Moderate match
  >= 0.40  → Minimum threshold (below = noise, discarded)

HNSW searches 9,759 vectors in milliseconds
```

### Phase 2 — Live Processing (per citizen message)

#### Step 4 — Intent Classification (`agent/chatbot.py`)

Qwen 2.5 72B classifies every message before deciding whether to trigger RAG:

| Intent | Description | Triggers RAG |
|--------|-------------|-------------|
| `CASUAL_CHAT` | Greetings, thanks, general | No |
| `PROVIDE_INFO` | Citizen giving details | No — collects for later |
| `SCHEME_QUERY` | Asking about schemes generally | Yes (1.2× weight) |
| `SCHEME_NEED` | Describing a problem or need | Yes (1.5× weight — highest) |
| `SPECIFIC_SCHEME` | Named scheme question | No — direct LLM |
| `LEGAL_RIGHTS` | Laws or rights | No — direct LLM |
| `CARD_INFO` | Government card how-to | No — direct LLM |

Also extracts: `domain` (agriculture/health/education/...) and `need_focus` (5-10 word phrase)

#### Step 5 — Multi-Query Retrieval (`core/retriever.py`)

Instead of one query, **8-12 targeted queries** fire simultaneously — each targeting a different eligibility dimension:

```python
queries = [
    # Intent-focused — highest priority (base 1.5 × 1.5 = 2.25 effective)
    { "text": "crop damage relief scheme Gujarat farmer",    "weight": 2.25 },

    # Direct profile match
    { "text": "OBC farmer Gujarat 2 acres income 120000",   "weight": 1.65 },

    # State specific (with metadata filter: state = Gujarat or all)
    { "text": "Gujarat state farmer agriculture benefit",    "weight": 1.8  },

    # Income bracket
    { "text": "annual income 1 lakh farmer welfare scheme", "weight": 1.5  },

    # Caste specific
    { "text": "OBC category reserved scheme welfare",       "weight": 1.5  },

    # BPL specific
    { "text": "below poverty line BPL card scheme",         "weight": 1.65 },

    # Crop specific
    { "text": "wheat crop farmer insurance subsidy India",  "weight": 1.5  },

    # Application process
    { "text": "documents required how to apply farmer",     "weight": 1.2  },
]
```

After retrieval:
- All results merged by `chunk_id` — highest weighted score wins on duplicates
- Grouped by `scheme_name` — only best chunk per scheme kept
- Re-ranking: `+0.08` if chunk state matches citizen state, `+0.02` for central schemes
- Score threshold: anything below `0.40` discarded as noise
- Final output: **top 15 unique scheme chunks**

#### Step 6 — Conflict Detection + LLM Synthesis

**Conflict Detection (`core/conflict.py`):**

```
Group 15 chunks by scheme_name
        ↓
For each scheme with BOTH central AND state chunks:

CENTRAL (PM-KISAN central, Section 4.1):
"...all land-holding farmer families..."

STATE (Gujarat-PM-KISAN state, Clause 2):
"...limited to farmers owning less than 2 hectares..."
        ↓
Qwen LLM compares both
        ↓
Returns:
{
  "conflict_detected": true,
  "conflict_summary": "Central has no land ceiling but Gujarat limits to 2 hectares",
  "central_says": "No land holding ceiling for farmer families",
  "state_says": "Maximum 2 hectares"
}

Conflicts ALWAYS surfaced explicitly — never silently resolved
```

**LLM Synthesis (`core/synthesizer.py`):**

```
Profile + 15 chunks + conflicts + intent context
        ↓
Qwen 2.5 72B checks every eligibility criterion
against citizen's actual profile values
        ↓
Returns structured JSON:
{
  "matched_schemes": [
    {
      "scheme_name": "PM-KISAN",
      "benefit": "₹6,000 per year",
      "why_eligible": "Ramesh Kumar, OBC farmer, 2 acres, income ₹1.2L < ₹2L limit",
      "citation": "PM-KISAN Guidelines PDF, Page 4, Section 4.1",
      "criteria": [
        { "criterion": "Land ownership", "status": "PASS" },
        { "criterion": "Income below 2 lakh", "status": "PASS" }
      ],
      "documents_required": ["Aadhaar", "Land Records", "Bank Passbook"],
      "application_steps": ["Visit CSC", "Carry Aadhaar", "Fill form"]
    }
  ],
  "other_matches": [...],
  "not_eligible": [...],
  "conflicts": [...],
  "hindi_summary": "..."
}
```

---

## 🔄 End-to-End Data Flow

### Chat Message Flow

```
1. Citizen types: "I am a farmer in Gujarat with 2 acres"
2. Frontend → POST /api/chat { user_id, message }
3. Node → forwards to FastAPI
4. FastAPI → forwards to RAG server (port 8001)
5. RAG: Intent classification → SCHEME_NEED, domain=agriculture
6. RAG: GET http://192.168.0.116:8000/citizen-data/{user_id}
7. RAG: 8-12 queries → ChromaDB → top 15 chunks
8. RAG: Conflict detection (central vs state comparison)
9. RAG: Qwen synthesis → scheme cards with citations
10. FastAPI: translate to Hindi if language=hi
11. Frontend: renders 3D scheme cards in chat
```

### Document Upload Flow

```
1. Citizen uploads aadhaar.jpg in side panel
2. Frontend → POST /api/profile/documents FormData(user_id + file)
3. Node → proxies to FastAPI
4. FastAPI:
   a. Detects content_type = image/jpeg
   b. pytesseract OCR → raw extracted text
   c. Detects doc_type = "aadhaar" from filename
   d. Saves file to uploads/{user_id}_aadhaar_aadhaar.jpg
   e. UPSERTS documents table
5. Frontend: green checkmark + extracted text preview
6. On next RAG query: documents.extracted_text included in profile
7. RAG: LLM fills missing profile fields from OCR text
```

### Both flows converge at:
```
GET /citizen-data/{user_id}
→ Compiled JSON (profile + category_details + documents.extracted_text)
→ Sent to RAG server for scheme matching
```

---

## 📡 API Reference

### Authentication

```http
POST /auth/register
Content-Type: application/x-www-form-urlencoded

email=ramesh@gmail.com

Response: { "user_id": "uuid", "is_new": true, "email": "ramesh@gmail.com" }
```

### Profile Management

```http
POST /profile/general
Body: user_id, full_name, age, gender, state, district, rural_urban,
      caste_category, religion, disability, family_size, annual_income,
      employment_type, bpl_card, aadhaar_number, need_category, language

POST /profile/category
Body: user_id, need (+ category-specific fields)
# need = education | agriculture | health | housing | social_welfare | business | jobs

POST /profile/documents
Body: FormData with user_id + files (PDF or image)
Response: { "documents_saved": [{ "doc_type": "aadhaar", "filename": "..." }] }
```

### Data Retrieval

```http
GET /citizen-data/{user_id}
→ Returns complete compiled JSON (used by RAG server)

GET /submission/{submission_id}
→ Returns saved submission by ID

GET /submissions/user/{user_id}
→ Returns all submissions for a user

GET /submissions/all
→ Admin: all submissions in database
```

### Node Middleware (port 3000)

All FastAPI endpoints are available via Node with `/api/` prefix:
- `POST /api/auth/register`
- `POST /api/profile/general`
- `POST /api/profile/category`
- `POST /api/profile/documents`
- `GET /api/citizen-data/:user_id`
- `GET /api/submission/:id`
- `GET /api/submissions/all`

---

## 📄 Document Processing Pipeline

Yogya Sahyog accepts PDFs, images, and plain text documents. OCR is handled automatically based on file type:

| File Type | Processor | Output |
|-----------|-----------|--------|
| `.pdf` | pdfplumber | Structured text extraction with page layout |
| `.jpg / .png` | pytesseract + Tesseract 5.5 | OCR with `eng+hin` language model |
| `.txt` | Direct decode | Raw UTF-8 text |

**Auto doc_type detection from filename:**

| Filename contains | Stored as |
|-------------------|-----------|
| aadhaar / aadhar | `aadhaar` |
| pan | `pan` |
| income | `income_certificate` |
| caste | `caste_certificate` |
| land / khata | `land_record` |
| ration | `ration_card` |
| bank / passbook | `bank_passbook` |
| disability | `disability_certificate` |
| marksheet / marks | `marksheet` |
| udyam / msme | `udyam_certificate` |
| anything else | `other` |

---

## 🧩 Frontend Architecture

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Full-width immersive landing with 10 sections, team cards, architecture diagram |
| Register | `/register` | Email registration → saves `user_id` to `localStorage` |
| Dashboard | `/dashboard` | Main chat interface with side profile panel |

### Key Components

| Component | Purpose |
|-----------|---------|
| `ParticleBackground.jsx` | Canvas with 150 animated dots connected by proximity lines |
| `CursorEffect.jsx` | Custom orange dot cursor + trailing ring + particle trail |
| `ChatWindow.jsx` | Glass morphism chat interface with message bubbles |
| `ChatBubble.jsx` | Individual messages (user: saffron gradient, bot: glass) |
| `SchemeCard.jsx` | 3D card with scheme name, match %, eligibility bar, apply button |
| `SchemeModal.jsx` | Full detail modal: eligibility checklist, documents, how-to-apply |
| `DocumentUpload.jsx` | Drag/drop zone with OCR processing feedback and extracted text preview |
| `ProfileDrawer.jsx` | Slide-in drawer with 3-tab form (Basic / Social+Financial / Category) |
| `ProfileSteps.jsx` | Vertical step tracker showing profile completion (5 steps) |
| `QuickReplies.jsx` | Contextual suggestion chips after each bot message |
| `TypingIndicator.jsx` | Animated indicator cycling search status messages |
| `Toast.jsx` | Slide-in notifications (success / warning / error / info) |
| `VoiceInput.jsx` | MediaRecorder → audio blob → Whisper transcription |

### Design System

```css
Primary:     #1A237E  (deep navy)
Accent:      #FF6F00  (saffron orange)
Background:  #F7F8FC  (light blue-white)

Glass panel:
  background: rgba(255,255,255,0.65)
  backdrop-filter: blur(24px)
  border: 1px solid rgba(255,255,255,0.9)

3D Card hover:
  transform: perspective(800px) rotateX(4deg) rotateY(-4deg) translateZ(8px)

Glow button:
  box-shadow: 0 4px 15px rgba(255,111,0,0.35)
  transform: translateY(-2px) on hover

Custom cursor:
  Orange dot (#FF6F00) + delayed ring + particle trail on movement
```

---

## 🔔 Need Categories Supported

| Category | Key Fields | Typical Schemes |
|----------|-----------|----------------|
| 🌾 Agriculture | land_acres, crop_type, irrigation, farmer_id | PM-KISAN, PMFBY, Kisan Credit Card |
| 🎓 Education | education_level, marks, institution, family_income | NSP Scholarship, Pre Matric, Post Matric |
| 🏥 Health | conditions, pregnancy, abha_id, bpl_status | Ayushman Bharat, PMJAY, JSY |
| 🏠 Housing | owns_house, house_type, household_income | PMAY Urban, PMAY Rural, BLC |
| 👩 Social Welfare | widow_status, num_daughters, minority | Widow Pension, Beti Bachao, Sukanya |
| 💼 Business | udyam_number, turnover, women_owned | MUDRA, Stand Up India, PMEGP |
| 💻 Jobs & Skills | qualification, skills, employment_status | PMKVY, NAPS, NCS Portal |

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 5 | Component-based UI with fast HMR |
| Styling | Tailwind CSS 3 | Utility-first responsive design |
| Animations | Framer Motion 11 | Page transitions, card physics, micro-interactions |
| Routing | React Router DOM 6 | Client-side navigation |
| Icons | Lucide React | Consistent icon set |
| Middleware | Node.js 20 + Express 4 | API proxy, CORS handling, file upload forwarding |
| Backend | Python 3.13 + FastAPI | REST API, auth, profile management |
| ORM | SQLAlchemy 2 | PostgreSQL interface with type safety |
| OCR | pdfplumber + pytesseract | PDF and image text extraction |
| OCR Engine | Tesseract 5.5 | eng+hin language models |
| Translation | deep-translator | Google Translate (free, no API key) |
| Database | PostgreSQL 18 | Relational store for all citizen data |
| Vector DB | ChromaDB | Persistent vector store with HNSW cosine index |
| Embeddings | sentence-transformers all-MiniLM-L6-v2 | 384-dim local embeddings (free, no API) |
| PDF Parsing | PyMuPDF (fitz) | Government PDF ingestion for RAG |
| LLM | Qwen 2.5 72B via Hugging Face | Intent classification, conflict detection, synthesis |

---

## 📁 Project Structure

```
yogya-sahyog/
│
├── sahyog-backend/              # FastAPI Python backend
│   ├── main.py                  # All API endpoints
│   ├── database.py              # PostgreSQL models (11 tables)
│   ├── auth.py                  # OTP registration logic
│   ├── extractors.py            # PDF + image OCR pipeline
│   ├── compiler.py              # Citizen JSON compilation
│   ├── translator.py            # Hindi translation (deep-translator)
│   ├── .env                     # DATABASE_URL config
│   ├── uploads/                 # Uploaded citizen documents
│   └── venv/                    # Python virtual environment
│
├── sahyog-node/                 # Express.js middleware server
│   ├── index.js                 # All forwarding routes
│   └── .env                     # FASTAPI_URL + PORT config
│
├── sahyog-frontend/             # Vite + React frontend
│   ├── src/
│   │   ├── App.jsx              # Routes + AppContext provider
│   │   ├── api/index.js         # All fetch() calls
│   │   ├── context/AppContext.jsx # Global state (user_id, language, messages)
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Full-width 10-section landing page
│   │   │   ├── Register.jsx     # Email registration
│   │   │   └── Dashboard.jsx    # Chat + profile panel
│   │   └── components/          # All UI components (see table above)
│   └── index.html
│
└── rag-server/                  # RAG pipeline (teammate's server)
    ├── core/
    │   ├── ingestor.py          # PDF → chunks with metadata
    │   ├── embedder.py          # Chunks → 384-dim vectors → ChromaDB
    │   ├── orchestrator.py      # Fetch + normalize citizen profile
    │   ├── retriever.py         # Multi-query weighted ChromaDB search
    │   ├── conflict.py          # Central vs state contradiction detection
    │   └── synthesizer.py       # Qwen LLM synthesis + citation grounding
    ├── agent/
    │   ├── chatbot.py           # Intent classifier + handler routing + PolicyPilotAgent
    │   └── run_chatbot.py       # CLI chatbot entry point
    └── scripts/
        ├── evaluate_rag.py      # Precision/recall/F1/latency benchmarks
        └── visualize_rag.py     # Matplotlib retrieval quality charts
```

---

## 📊 RAG Evaluation Results

Evaluated across 5 citizen profiles (OBC Farmer Gujarat, Young Student Rajasthan, Daily Wage Worker Maharashtra, Widow Uttar Pradesh, Small Business Delhi):

| Metric | Actual | Ideal | Status |
|--------|--------|-------|--------|
| Precision | 0.706 | ≥ 0.80 | 🟠 CLOSE |
| Recall | 0.771 | ≥ 0.75 | ✅ PASS |
| F1 Score | 0.726 | — | ℹ️ INFO |
| Avg Cosine Score | 0.649 | ≥ 0.72 | 🟠 CLOSE |
| Latency | 2773ms | ≤ 3000ms | ✅ PASS |
| Consistency (σ) | 0.055 | ≤ 0.10 | ✅ PASS |
| Strong Ratio | 0.573 | ≥ 0.60 | 🟠 CLOSE |

**Key findings:**
- Young Student Rajasthan achieved perfect scores (Precision=1.0, Recall=1.0, F1=1.0)
- Widow Uttar Pradesh: F1=0.81 — strong matching for social welfare schemes
- Small Business Delhi: lowest scores (0.33 precision) — more business scheme PDFs will improve this
- Latency well under 3 second target across all profiles

Run evaluation yourself:
```bash
cd rag-server
python scripts/evaluate_rag.py
# Outputs: rag_evaluation.png (9-panel Matplotlib dashboard)
```

---

## 🌐 Network Configuration

For hackathon demo on the same WiFi network:

```
Backend IP:  192.168.0.116

Frontend  → http://192.168.0.116:5173
Node      → http://192.168.0.116:3000  (accessible to all teammates)
FastAPI   → http://192.168.0.116:8000  (RAG calls this)
RAG       → http://RAG_TEAMMATE_IP:8001
```

Open firewall ports (Windows — run as Administrator):
```cmd
netsh advfirewall firewall add rule name="Sahyog Backend" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="Sahyog Node" dir=in action=allow protocol=TCP localport=3000
```

RAG teammate connection — update `main.py`:
```python
TEAMMATE_URL = "http://RAG_IP:8001"
TEAMMATE_ENDPOINTS = {
    "query": "/rag/query",
}
```

---

## 🧪 Test Citizen Profiles

Four pre-built test profiles for demo purposes:

| Profile | user_id | Expected Schemes |
|---------|---------|-----------------|
| Farmer OBC Gujarat | `ca1e1c6d-6abb-40e2-8479-329fbab9f3af` | PM-KISAN, PMFBY, Kisan Credit Card |
| Student OBC Gujarat | `1638fda4-a5e8-4068-b07f-1a59f06230a5` | NSP Scholarship, Pre Matric, Post Matric |
| Widow OBC BPL Gujarat | `91c7bf87-013c-4f04-85d1-87726cf213fe` | Widow Pension, Beti Bachao, Social Welfare |
| Rich Business General | `b299fa19-457d-4ff9-bac1-b670ff9c0711` | None (tests negative case — too rich, general category) |

Fetch any profile:
```bash
curl http://192.168.0.116:8000/citizen-data/ca1e1c6d-6abb-40e2-8479-329fbab9f3af
```

---

## 🔧 Common Commands

```bash
# Start all services
python main.py                         # Backend (port 8000)
node index.js                          # Node server (port 3000)
npm run dev                            # Frontend (port 5173)

# Health checks
curl http://localhost:8000/health
curl http://localhost:3000/health

# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'

# Save profile
curl -X POST http://localhost:3000/api/profile/general \
  -H "Content-Type: application/json" \
  -d '{"user_id":"UUID","full_name":"Ramesh","age":45,"state":"Gujarat","need_category":"agriculture","annual_income":120000}'

# Get compiled JSON for RAG
curl http://localhost:8000/citizen-data/USER_ID

# Interactive API docs
open http://localhost:8000/docs

# Reset database
psql -U postgres -d sahyog -c "TRUNCATE compiled_submissions;"
```

---

## 📌 Roadmap

- 🗣️ Voice input via OpenAI Whisper — speak your situation instead of typing
- 📱 React Native mobile app for field CSC operators
- 🛰️ Integration with MyScheme.gov.in and state portal APIs
- 🔔 Push notifications for scheme deadlines and new schemes
- 🔐 Full OTP authentication via SMS gateway
- 🧬 LSTM demand forecasting for seasonal scheme uptake prediction
- 🌍 Support for Gujarati, Marathi, Tamil, Bengali regional languages
- 📊 Admin analytics dashboard for scheme utilization tracking
- 🔄 Auto-refresh RAG index when new scheme PDFs are published
- 🤝 CSC operator mode — help operators serve walk-in citizens faster

---

## 👨‍💻 Team Yogya

<p align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <strong>🗄️ Backend & Database</strong><br/>
        <strong>Yug Gandhi</strong><br/>
        FastAPI · PostgreSQL · Node.js · OCR Pipeline
      </td>
      <td align="center" width="25%">
        <strong>🎨 Frontend & Integration</strong><br/>
        <strong>Jaypalsinh Chavda</strong><br/>
        React · Vite · Tailwind · Framer Motion
      </td>
      <td align="center" width="25%">
        <strong>🧠 RAG & AI Pipeline</strong><br/>
        <strong>Kushagra Mali</strong><br/>
        ChromaDB · Qwen · sentence-transformers · RAG
      </td>
      <td align="center" width="25%">
        <strong>📋 RAG & Research</strong><br/>
        <strong>Nidhi</strong><br/>
        PDF Corpus · Conflict Testing · Hindi QA
      </td>
    </tr>
  </table>
</p>

**Hackathon:** IAR Udaan Hackathon 2026 · **Theme:** AI • GenAI • RAG · **Problem Statement:** PolicyPilot #03

---

## ⭐ Support

If you find this project impactful for Indian citizens, give it a ⭐ and share it with civic tech communities. Contributions and feedback welcome — open an issue or a pull request.

---

<p align="center">
  <em>"650+ schemes exist. 73% go unclaimed. Yogya Sahyog changes that — one citizen at a time."</em>
</p>
