# ⚖️ AI Case Law Summarizer and Comparator

> A web platform where lawyers and legal researchers can upload multiple legal judgments and receive simplified summaries, key issue extraction, legal principle identification, and side-by-side comparisons — powered by AI.

---

## 📁 Project Structure

```
Ai_Case_Law_sumcom/
│
├── frontend/                    ← React (Vite) + Tailwind CSS — User Interface
│   ├── src/
│   │   ├── App.jsx              ← Main React component (welcome screen for now)
│   │   ├── main.jsx             ← React entry point
│   │   └── index.css            ← Tailwind CSS import
│   ├── index.html               ← Root HTML file
│   ├── vite.config.js           ← Vite configuration
│   ├── tailwind.config.js       ← Tailwind configuration
│   ├── postcss.config.js        ← PostCSS configuration
│   ├── package.json             ← Frontend dependencies
│   ├── .env.example             ← Environment variable template
│   └── .gitignore
│
├── backend/                     ← Node.js + Express — Main API Server
│   ├── server.js                ← Express server (Port 5000)
│   ├── package.json             ← Backend dependencies
│   ├── .env.example             ← Environment variable template
│   └── .gitignore
│
├── ai-service/                  ← Python + FastAPI — AI Processing Engine
│   ├── main.py                  ← FastAPI server (Port 8000) with PDF parsing
│   ├── requirements.txt         ← Python dependencies
│   ├── .env.example             ← Environment variable template
│   └── .gitignore
│
├── docs/
│   └── project_logic.md         ← Developer documentation (logic explained)
│
└── README.md                    ← This file
```

---

## 🚀 Getting Started — Complete Setup Guide

Follow these steps **in order** to get all three services running.

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v18 or higher) — check with `node --version`
- [Python](https://python.org/) (v3.9 or higher) — check with `python --version`
- [Git](https://git-scm.com/) — for version control

---

### Step 1: Set Up the Frontend

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install all dependencies listed in package.json
npm install

# 3. Create your .env file from the template
copy .env.example .env

# 4. Edit the .env file and fill in your Supabase credentials
#    (You can skip this for now during baseline testing)
```

---

### Step 2: Set Up the Backend

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install all dependencies
npm install

# 3. Create your .env file from the template
copy .env.example .env

# 4. Edit the .env file and fill in your Supabase credentials
```

---

### Step 3: Set Up the AI Service

```bash
# 1. Navigate to the ai-service folder
cd ai-service

# 2. Create a Python virtual environment
#    (This keeps Python packages isolated from your system)
python -m venv venv

# 3. Activate the virtual environment
#    On Windows:
venv\Scripts\activate
#    On Mac/Linux:
#    source venv/bin/activate

# 4. Install all Python dependencies
pip install -r requirements.txt

# 5. Create your .env file from the template
copy .env.example .env
```

---

### Step 4: Run All Three Services Simultaneously

You need **3 separate terminal windows** open at the same time.

#### 🖥️ Terminal Window 1 — Frontend (React)
```bash
cd "Ai_Case_Law_sumcom"/frontend
npm run dev
```
✅ Frontend will be available at: **http://localhost:3000**

---

#### 🖥️ Terminal Window 2 — Backend (Node.js)
```bash
cd "Ai_Case_Law_sumcom"/backend
npm run dev
```
✅ Backend will be available at: **http://localhost:5000**  
🔍 Health check: **http://localhost:5000/api/health**

---

#### 🖥️ Terminal Window 3 — AI Service (Python)
```bash
cd "Ai_Case_Law_sumcom"/ai-service

# Activate virtual environment first!
venv\Scripts\activate

# Then start the server
python main.py
```
✅ AI Service will be available at: **http://localhost:8000**  
🔍 Health check: **http://localhost:8000/health**  
📖 Interactive API docs: **http://localhost:8000/docs**

---

## 🔗 Service Communication Overview

```
User Browser (Port 3000)
        ↓  axios HTTP calls
Node.js Backend (Port 5000)
        ↓  forwards PDFs + text
Python AI Service (Port 8000)
        ↓  returns summaries
Backend → Frontend → Display to User
```

---

## ✅ Verifying Everything Works

Once all three services are running, open your browser and check:

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Frontend | http://localhost:3000 | Welcome screen with status badges |
| Backend Health | http://localhost:5000/api/health | `{"status": "OK", ...}` |
| AI Service Health | http://localhost:8000/health | `{"status": "OK", ...}` |
| AI Service Docs | http://localhost:8000/docs | Interactive API documentation |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | User interface |
| Styling | Tailwind CSS | Responsive, utility-first CSS |
| Backend | Node.js + Express | API server, file handling |
| Database | Supabase (PostgreSQL) | Store documents and analysis results |
| AI Engine | Python + FastAPI | PDF parsing and AI summarization |
| PDF Parsing | PyMuPDF (fitz) | Extract text from legal documents |
| AI Models | Ollama / Hugging Face Transformers | Generate summaries |

---

## 📋 Core Features (Planned)

- [x] **Phase 1**: Baseline setup — all three services running
- [ ] **Phase 2**: Multi-document PDF upload
- [ ] **Phase 3**: AI-generated plain-English summaries
- [ ] **Phase 4**: Key issue & legal principle extraction
- [ ] **Phase 5**: Side-by-side comparison view
- [ ] **Phase 6**: Similarity scoring between judgments
- [ ] **Phase 7**: Export comparison report (PDF)

---

## 🤝 For Developers

This project is designed to be beginner-friendly:
- Every important function has comments explaining what it does.
- Simple, descriptive variable names are used throughout.
- Each file explains what it does at the top.
- Error handling is implemented at every layer.

See [`docs/project_logic.md`](./docs/project_logic.md) for deep-dive explanations of the architecture and code logic.

---

## 📄 License

This project is for educational purposes.
