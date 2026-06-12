# Project Logic & Architecture Notes
# AI Case Law Summarizer and Comparator

> This file documents the logic, design decisions, and how every part of the system works.
> It will be updated as we build each phase. Think of this as the "developer diary" for the project.

---

## Phase 1 — Baseline Setup

**Date:** June 2026  
**Goal:** Set up the monorepo folder structure and confirm all three services can run.

---

### How the Three Services Talk to Each Other

```
[User's Browser]
      |
      | (HTTP Requests)
      v
[Frontend - React - Port 3000]
      |
      | (API calls via axios)
      v
[Backend - Node.js Express - Port 5000]
      |
      | (Forwards PDF + reVquests)
      v
[AI Service - Python FastAPI - Port 8000]
      |
      | (Returns summaries & extracted text)
      v
[Backend receives and sends back to Frontend]
```

**Why three separate services?**
- **Separation of concerns**: Each service has one job and does it well.
- **Scalability**: If the AI service is slow, only it needs to be upgraded — not the whole app.
- **Technology fit**: Python has the best AI/NLP libraries; Node.js handles web APIs and file uploads easily; React handles UI.

---

### File-by-File Explanation

#### Frontend (`/frontend`)

| File | Purpose |
|------|---------|
| `package.json` | Lists all Node.js packages the frontend needs (React, Vite, Tailwind) |
| `vite.config.js` | Configures the Vite dev server (port 3000, React plugin) |
| `tailwind.config.js` | Tells Tailwind CSS which files to scan for class names |
| `postcss.config.js` | Required by Tailwind to process CSS |
| `index.html` | The single HTML page that loads our React app |
| `src/index.css` | Imports Tailwind CSS into the project |
| `src/main.jsx` | Entry point: mounts React app into `<div id="root">` in index.html |
| `src/App.jsx` | Main React component: currently shows the welcome screen |
| `.env.example` | Template showing what environment variables the frontend needs |

#### Backend (`/backend`)

| File | Purpose |
|------|---------|
| `package.json` | Lists all Node.js packages the backend needs (Express, Multer, CORS, etc.) |
| `server.js` | Main server file: sets up Express, middleware, and routes |
| `.env.example` | Template showing what environment variables the backend needs |

**Key concepts used in `server.js`:**
- **Express**: A minimal web framework that makes it easy to define routes (URLs the server responds to).
- **CORS**: By default, browsers block requests from one origin (port 3000) to another (port 5000). CORS middleware lifts this restriction.
- **dotenv**: Loads secrets from a `.env` file so we don't hardcode passwords in our code.
- **Multer**: A middleware for handling file uploads (PDFs). We will configure it properly in Phase 3.

#### AI Service (`/ai-service`)

| File | Purpose |
|------|---------|
| `requirements.txt` | Lists all Python packages needed (FastAPI, PyMuPDF, Uvicorn) |
| `main.py` | Main FastAPI app: health check, PDF text extraction, mock summarizer |
| `.env.example` | Template showing what environment variables the AI service needs |

**Key concepts used in `main.py`:**
- **FastAPI**: A modern Python web framework, similar to Express in Node.js. Automatically generates interactive API docs at `/docs`.
- **Uvicorn**: The ASGI server that actually runs FastAPI (similar to how Express is run by Node).
- **PyMuPDF (fitz)**: A fast and accurate library to extract text from PDFs. It is imported as `fitz` because the package was originally called "fitz".
- **UploadFile**: FastAPI's built-in class for handling file uploads in a memory-efficient way.

---

### Why We Use Environment Variables (`.env`)

Hardcoding secrets like database passwords directly in code is dangerous:
```python
# BAD ❌ - Never do this
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Instead, we use `.env` files:
```python
# GOOD ✅ - Load from environment
import os
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
```

The `.env` file sits on your machine only and is **never uploaded to GitHub** (blocked by `.gitignore`).

---

## Upcoming Phases

- **Phase 3**: Connect Ollama/AI models for real summarization
- **Phase 4**: Implement side-by-side comparison view in React
- **Phase 5**: Add similarity scoring and export to PDF report

---

## Phase 2 — Multi-PDF Upload System

**Goal:** Build a complete file upload pipeline from frontend drag-and-drop to backend disk storage.

---

### New Files Added

| File | Purpose |
|------|---------|
| `frontend/src/components/FileUploader.jsx` | Drag-and-drop UI component with validation |
| `frontend/src/services/api.js` | Centralised Axios API calls with progress tracking |
| `backend/src/routes/upload.js` | Express router for POST /api/upload |
| `backend/src/controllers/uploadController.js` | Multer config + file handler logic |
| `backend/uploads/` | Folder where uploaded PDFs are saved temporarily |

---

### How the Upload Pipeline Works (Step by Step)

```
1. User drags PDFs onto FileUploader.jsx
      DOWN
2. Client-side validation runs INSTANTLY (no server needed):
   - Is it a PDF? (check file.type === 'application/pdf')
   - Is it under 20MB? (check file.size)
   - Is it under 10 files total?
   - Is it a duplicate?
      DOWN
3. User clicks "Upload" button
      DOWN
4. api.js creates a FormData object and appends all files
   Axios sends POST request to http://localhost:5000/api/upload
   onUploadProgress callback fires repeatedly, updates progress bar
      DOWN
5. Express receives the request, upload.js route matches
      DOWN
6. uploadMiddleware (multer) runs:
   - Checks MIME type again on the server (security: never trust only client-side)
   - Checks file size again on the server
   - Saves valid files to /backend/uploads/ with timestamp prefix
      DOWN
7. handleFileUpload controller runs:
   - Reads req.files (multer populates this)
   - Returns JSON summary of all saved files
      DOWN
8. Frontend receives JSON, shows success message + file list
   FileUploader calls onUploadSuccess(result), App.jsx stores result in state
```

---

### Why We Validate on BOTH Frontend AND Backend?

- **Frontend validation** (in FileUploader.jsx): Fast feedback for the user. Shows errors immediately without a network round-trip. Better UX.
- **Backend validation** (in uploadController.js): Security. A malicious user could bypass the browser and send raw HTTP requests directly to the API, skipping the frontend entirely. The backend is the real gatekeeper.

**Rule of thumb**: Never trust the client. Always re-validate on the server.

---

### Key Concepts Explained

**FormData**: A browser API that lets you construct a set of key/value pairs, including files, to send as a multipart/form-data HTTP request. It is the standard way to upload files.

**Multer**: A Node.js middleware that parses multipart/form-data requests. It handles reading the file bytes from the stream and writing them to disk. Without multer, Express cannot handle file uploads.

**diskStorage vs memoryStorage**: We use diskStorage (saves to disk). The alternative memoryStorage keeps files in RAM — faster but dangerous for large files or many simultaneous users.

**onUploadProgress**: Axios fires this callback repeatedly as upload bytes are sent. We use it to calculate (bytesLoaded / totalBytes) * 100 and update the progress bar width via inline CSS style width property.

---

## Phase 3 — PDF Text Extraction (AI Service)

**Goal:** Build a production-quality PDF text extraction endpoint in the Python FastAPI service that returns clean, structured JSON suitable for AI processing.

---

### New Files Added

| File | Purpose |
|------|---------|
| `ai-service/routes/__init__.py` | Makes the routes/ folder a Python package (required for imports) |
| `ai-service/routes/extraction.py` | The full POST /extract-text route with cleaning logic |

### Modified Files

| File | Change |
|------|--------|
| `ai-service/main.py` | Added router import + app.include_router() registration. Removed old inline /extract-text. |

---

### JSON Response Structure (Strict Contract)

Every call to POST /extract-text returns exactly this shape:

```json
{
  "filename": "case_name.pdf",
  "total_pages": 12,
  "full_text": "Complete cleaned text here...",
  "pages": [
    { "page_number": 1, "text": "Text from page 1..." },
    { "page_number": 2, "text": "Text from page 2..." }
  ]
}
```

This strict structure is important because the AI summarization layer (Phase 4) will read this JSON and expects these exact field names.

---

### How clean_page_text() Works

The text PyMuPDF extracts from PDFs is "raw" — it has inconsistent spacing, trailing whitespace on lines, and often 4-5 consecutive blank lines between sections. We clean it in 3 steps:

```
RAW TEXT (from fitz.get_text()):
"   Section 1.   \n   \n   \n   \n   The court held that...   \n"

STEP 1 - splitlines() splits into a list:
["   Section 1.   ", "   ", "   ", "   ", "   The court held that...   ", ""]

STEP 2 - .strip() each line:
["Section 1.", "", "", "", "The court held that...", ""]

STEP 3 - re.sub(r'\n{3,}', '\n\n') collapses 3+ newlines to 2:
"Section 1.\n\nThe court held that..."

RESULT: One clean blank line between paragraphs. No trailing spaces.
```

---

### Error Handling Strategy

We use layered try/except blocks with specific exception types:

| Exception | HTTP Status | Meaning |
|-----------|-------------|---------|
| Wrong extension | 400 | Client sent a non-PDF |
| Wrong MIME type | 400 | Client sent wrong Content-Type |
| Empty file (0 bytes) | 400 | Client sent an empty file |
| fitz.FileDataError | 422 | File is corrupted / not a real PDF |
| Any other Exception | 500 | Unexpected server error |

**Why 422 for corrupted PDFs?**
HTTP 422 means "Unprocessable Entity" — the server understood the request and it was a valid PDF by name, but the content itself could not be processed. This is more accurate than 400 (bad request format) or 500 (server crashed).

---

### APIRouter vs Direct App Routes

In Phase 1, all routes were written directly on the `app` object in `main.py`:
```python
@app.post("/extract-text")  # Everything in one file
```

In Phase 3, we use `APIRouter`:
```python
# routes/extraction.py
router = APIRouter()

@router.post("")  # Route defined in its own file

# main.py
app.include_router(router, prefix="/extract-text")
```

**Benefits of APIRouter:**
- Each feature has its own file (easier to find and edit)
- main.py stays clean and short
- Routes can be moved, disabled, or versioned independently
- Mirrors how Express uses separate route files in Node.js

---

## Phase 5 — Key Legal Features Extraction

**Goal:** Extract structured issues and principles from legal text using Ollama's JSON mode.

---

### New File

| File | Purpose |
|------|---------|
| `ai-service/routes/features.py` | POST /extract-features route with JSON-mode Ollama call and 3-layer parser |

### Modified File

| File | Change |
|------|--------|
| `ai-service/main.py` | Imports and mounts features_router at /extract-features, version bumped to 4.0.0 |

---

### Strict Output Schema

```json
{
  "issues": ["Specific legal question 1", "Specific legal question 2"],
  "principles": ["Legal rule or doctrine 1", "Statute or precedent 2"]
}
```

---

### Two-Layer Enforcement Strategy

Getting small models (like qwen2.5:0.5b) to return clean JSON requires TWO layers:

**Layer 1 — Ollama format="json":**
Setting `"format": "json"` in the API request payload tells Ollama to constrain its token generation to only produce valid JSON characters. This is enforced at the model-sampling level — not just a polite request.

**Layer 2 — Prompt engineering:**
The prompt shows the exact schema, a worked example, and explicitly says "output ONLY the JSON object — nothing before it, nothing after it". The example in the prompt is especially effective for small models.

---

### 3-Layer JSON Parsing (Safety Net)

Even with both enforcement layers, output can still be imperfect. The parser tries 3 strategies:

```
Raw text from Ollama
      |
Layer 1: json.loads(raw_text) directly
      | FAIL
Layer 2: regex r'\{.*\}' finds JSON block inside surrounding text
      | FAIL
Layer 3: Return {"issues": [], "principles": []} — never crash
```

---

### Temperature = 0.1 (Why So Low?)

Summary generation uses 0.3 — some creativity helps write readable prose.
Feature extraction uses 0.1 — we want the model to identify EXACT text from the document, not invent creative interpretations. Lower temperature = more literal = better for extraction tasks.

---

### Input Truncation (3000 words)

qwen2.5:0.5b has a limited context window. Sending a 50-page judgment at once causes:
- Garbled output near the end
- The model forgetting early content
- Exceeding token limits silently

We truncate to 3000 words before sending. For full document analysis, a future improvement would be to process in chunks and merge results.
