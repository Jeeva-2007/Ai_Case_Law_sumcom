# ⚖️ AI Case Law Summarizer and Comparator

> A web platform where lawyers and legal researchers can upload multiple legal judgments and receive AI-generated plain-English summaries, key issue extraction, legal principle identification, semantic similarity scoring, and a full side-by-side comparative analysis — powered by local AI via Ollama.

---

## 📁 Project Structure

```
Ai_Case_Law_sumcom/
│
├── frontend/                          ← React (Vite) + Tailwind CSS — User Interface
│   ├── src/
│   │   ├── App.jsx                    ← Root component with tab navigation
│   │   ├── main.jsx                   ← React entry point
│   │   ├── index.css                  ← Tailwind CSS imports
│   │   ├── components/
│   │   │   └── FileUploader.jsx       ← Drag-and-drop PDF upload with validation
│   │   ├── pages/
│   │   │   └── ComparisonDashboard.jsx ← 3-column comparison UI page
│   │   └── services/
│   │       └── api.js                 ← All Axios API call functions
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/                           ← Node.js + Express — Main API Server
│   ├── server.js                      ← Express server (Port 5000)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── upload.js              ← POST /api/upload route
│   │   │   └── analyse.js             ← POST /api/analyse route (bridge to AI)
│   │   └── controllers/
│   │       ├── uploadController.js    ← Multer file handling logic
│   │       └── analyseController.js   ← Orchestrates extract + summarise pipeline
│   ├── uploads/                       ← Temporary storage for uploaded PDFs
│   ├── package.json
│   └── .env.example
│
├── ai-service/                        ← Python + FastAPI — AI Processing Engine
│   ├── main.py                        ← FastAPI server (Port 8000) — registers all routes
│   ├── requirements.txt               ← Python dependencies
│   ├── .env                           ← Your local environment variables (not in Git)
│   ├── .env.example                   ← Template for environment variables
│   ├── routes/
│   │   ├── extraction.py              ← POST /extract-text (PDF parsing via PyMuPDF)
│   │   ├── summary.py                 ← POST /generate-summary (Ollama AI)
│   │   ├── features.py                ← POST /extract-features (issues + principles JSON)
│   │   ├── similarity.py              ← POST /similarity (cosine similarity score)
│   │   └── comparison.py              ← POST /compare-cases (full AI comparative analysis)
│   └── services/
│       └── ollama_service.py          ← Shared Ollama connection & prompt logic
│
└── docs/
    ├── project_logic.md               ← Developer documentation (this file's companion)
    └── README.md                      ← This file
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | User interface and page rendering |
| Styling | Tailwind CSS | Responsive utility-first CSS |
| Backend | Node.js + Express | File uploads and API bridge |
| AI Engine | Python + FastAPI | All AI/NLP processing |
| PDF Parsing | PyMuPDF (fitz) | Extract text from legal PDFs |
| AI Model | Ollama (`qwen2.5:0.5b`) | Local LLM for summaries, features, comparison |
| Similarity | sentence-transformers | Semantic cosine similarity scoring |
| Database | Supabase (PostgreSQL) | Future: store documents and results |

---

## ✅ What Has Been Built

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | Monorepo baseline — all 3 services running | ✅ Complete |
| Phase 2 | Multi-PDF drag-and-drop upload with validation | ✅ Complete |
| Phase 3 | PDF text extraction via PyMuPDF | ✅ Complete |
| Phase 4 | AI summary generation (Core Facts / Main Dispute / Final Ruling) | ✅ Complete |
| Phase 5 | Key legal feature extraction (issues + principles) | ✅ Complete |
| Phase 6 | Semantic similarity scoring (cosine similarity, 0–100%) | ✅ Complete |
| Phase 7 | Comparative intelligence engine (conflict + adversarial strategy) | ✅ Complete |
| Phase 8 | Comparison Dashboard UI (3-column layout with skeleton loaders) | ✅ Complete |
| Phase 9 | Export comparison report (PDF) | 🔜 Planned |

---

## 🚀 Getting Started — Complete Setup Guide

Follow these steps **in order** to get all services running.

### Prerequisites

Make sure you have these installed before starting:

| Tool | Version | Check command |
|------|---------|---------------|
| Node.js | v18 or higher | `node --version` |
| Python | v3.9 or higher | `python --version` |
| Git | Any | `git --version` |
| Ollama | Latest | [Download here](https://ollama.ai) |

---

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Ai_Case_Law_sumcom
```

---

### Step 2: Set Up the Frontend

```bash
# Navigate to the frontend folder
cd frontend

# Install all npm dependencies
npm install

# Create your .env file from the template
copy .env.example .env
# On Mac/Linux: cp .env.example .env

# The .env file contains:
# VITE_BACKEND_URL=http://localhost:5000
# VITE_AI_SERVICE_URL=http://localhost:8000
```

---

### Step 3: Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# Install all npm dependencies
npm install

# Create your .env file from the template
copy .env.example .env

# The .env file contains:
# PORT=5000
# AI_SERVICE_URL=http://localhost:8000
# SUPABASE_URL=your-supabase-url      (optional for now)
# SUPABASE_KEY=your-supabase-anon-key (optional for now)
```

---

### Step 4: Set Up the AI Service

```bash
# Navigate to the ai-service folder
cd ai-service

# Create a Python virtual environment
# This keeps Python packages isolated from your system Python
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install all Python packages
pip install -r requirements.txt
# NOTE: This will download PyTorch + sentence-transformers (~500MB total)
# This only happens once — subsequent installs are instant

# The .env file for the AI service is already created.
# Open it and verify OLLAMA_MODEL matches your installed model:
# OLLAMA_MODEL=qwen2.5:0.5b
```

---

### Step 5: Download and Start Ollama

Ollama is the local AI model runner. It must be running **before** the AI service.

```bash
# Download Ollama from https://ollama.ai and install it, then:

# Pull the AI model we use (one-time download, ~400MB)
ollama pull qwen2.5:0.5b

# Verify the model is installed
ollama list
# You should see: qwen2.5:0.5b listed

# Start the Ollama server (keep this terminal open)
ollama serve
# Ollama will now run on http://localhost:11434
```

---

### Step 6: Run All Services

You need **4 terminal windows** open at the same time.

#### 🖥️ Terminal 1 — Ollama (AI Model Server)
```bash
ollama serve
```
✅ Runs on: `http://localhost:11434`

---

#### 🖥️ Terminal 2 — Frontend (React UI)
```bash
cd Ai_Case_Law_sumcom/frontend
npm run dev
```
✅ Runs on: **http://localhost:5173**

---

#### 🖥️ Terminal 3 — Backend (Node.js API)
```bash
cd Ai_Case_Law_sumcom/backend
npm run dev
```
✅ Runs on: **http://localhost:5000**  
🔍 Health check: `http://localhost:5000/api/health`

---

#### 🖥️ Terminal 4 — AI Service (Python FastAPI)
```bash
cd Ai_Case_Law_sumcom/ai-service

# Activate the virtual environment first!
venv\Scripts\activate

# Start the server
python main.py
```
✅ Runs on: **http://localhost:8000**  
🔍 Health check: `http://localhost:8000/health`  
📖 Interactive API docs: **http://localhost:8000/docs**

---

## 🔗 Complete API Reference

### Backend (Node.js — Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Check if backend is running |
| `POST` | `/api/upload` | Upload 1–10 PDFs (max 20MB each) |
| `POST` | `/api/analyse` | Run full AI analysis on uploaded files |

### AI Service (Python — Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check if AI service is running |
| `GET` | `/docs` | Interactive Swagger API documentation |
| `POST` | `/extract-text` | Extract raw text from a PDF file |
| `POST` | `/generate-summary` | Generate 3-section AI summary from text |
| `POST` | `/extract-features` | Extract legal issues + principles as JSON |
| `POST` | `/similarity` | Calculate semantic similarity score (0–100) |
| `POST` | `/compare-cases` | Full comparative analysis of two cases |

---

## ✅ Verification Checklist

Once all services are running, open these URLs and verify:

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | http://localhost:5173 | Upload page with tab navigation |
| Backend Health | http://localhost:5000/api/health | `{"status": "OK"}` |
| AI Health | http://localhost:8000/health | `{"status": "OK"}` |
| AI Docs | http://localhost:8000/docs | Interactive API browser |

---

## 📖 Testing the AI Endpoints Manually

The easiest way to test without the full frontend is the built-in docs page.

**Go to:** `http://localhost:8000/docs`

### Test 1 — Extract Text
1. Click `POST /extract-text` → Try it out
2. Upload any PDF file
3. You should get back `filename`, `total_pages`, `full_text`, and `pages` array

### Test 2 — Generate Summary
1. Click `POST /generate-summary` → Try it out
2. Use this request body:
```json
{ "text": "The court held that the defendant was liable for breach of contract. The plaintiff had suffered damages of Rs. 50,000. The dispute arose from a failure to deliver goods as agreed." }
```
3. You should get back `Core Facts`, `Main Dispute`, `Final Ruling` sections

### Test 3 — Similarity Score
1. Click `POST /similarity` → Try it out
2. Use this request body:
```json
{
  "case_a_text": "The defendant was liable for breach of contract causing financial loss.",
  "case_b_text": "The employer violated the employment agreement resulting in damages."
}
```
3. You should get back a `similarity_score` between 0 and 100

---

## ⚠️ Common Issues and Fixes

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `"Cannot connect to Ollama"` in AI response | Ollama is not running | Run `ollama serve` in a terminal |
| `404` from AI service calling Ollama | Model not downloaded | Run `ollama pull qwen2.5:0.5b` |
| `"fallback mode"` in summary response | Model ignored formatting instructions | Normal for small models — try `ollama pull llama3` for better results |
| `422 Unprocessable Content` | Wrong request body field names | Check the `/docs` page for exact expected fields |
| `ECONNREFUSED` on port 8000 | AI service not running | Activate venv and run `python main.py` |
| `ModuleNotFoundError` in Python | Package not installed | Run `pip install -r requirements.txt` with venv active |
| Frontend shows blank page | Vite not running | Run `npm run dev` in the frontend folder |

---

## 🤝 For Developers — Code Style Guide

This project is designed to be beginner-friendly. Every file follows these rules:

- ✅ **Every important function has a comment** explaining what it does, why, and what it returns
- ✅ **Simple variable names** — `uploadedFiles` not `uf`, `extractedText` not `et`
- ✅ **Each file explains itself** at the top with a comment block
- ✅ **Error handling at every layer** — frontend, backend, and AI service all handle failures gracefully
- ✅ **Fallback responses** — the AI service never crashes; it always returns something useful even when the model fails

For deep-dive explanations of design decisions, see [`docs/project_logic.md`](./docs/project_logic.md).

---

## 📄 License

This project is built for educational purposes as part of a final-year IT project.
