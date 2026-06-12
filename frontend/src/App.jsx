// src/App.jsx
// -------------------------------------------------------
// Main App component — root of the entire UI.
// Manages which "page" (view) is currently shown via a simple
// string state variable (no external router library needed yet).
//
// Pages:
//   'upload'    → FileUploader + result preview
//   'dashboard' → ComparisonDashboard (3-column analysis view)
// -------------------------------------------------------

import React, { useState } from 'react'
import FileUploader from './components/FileUploader'
import ComparisonDashboard from './pages/ComparisonDashboard'

function App() {
  // ---- STATE ----

  // uploadResult: JSON from the backend after a successful file upload
  const [uploadResult, setUploadResult] = useState(null)

  // currentPage: which view is currently shown ('upload' or 'dashboard')
  const [currentPage, setCurrentPage] = useState('upload')

  // Called by FileUploader when upload succeeds
  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result)
    setUploadResult(result)
  }

  // -------------------------------------------------------
  // NAV TABS
  // Simple tab navigation — sets currentPage state.
  // No React Router needed for two pages at this stage.
  // -------------------------------------------------------
  const NavTab = ({ page, label, icon }) => {
    const isActive = currentPage === page
    return (
      <button
        onClick={() => setCurrentPage(page)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/60'}
        `}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </button>
    )
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* ---- TOP HEADER BAR ---- */}
      {/* Only shown on the upload page — dashboard has its own header */}
      {currentPage === 'upload' && (
        <header className="border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">

            {/* Logo + App Name */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Case Law AI</h1>
                <p className="text-slate-500 text-xs">Summarizer &amp; Comparator</p>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="flex items-center gap-2">
              <NavTab page="upload"    label="Upload"     icon="📤" />
              <NavTab page="dashboard" label="Compare"    icon="⚖️" />
            </nav>
          </div>
        </header>
      )}

      {/* ---- PAGE CONTENT ---- */}

      {/* UPLOAD PAGE */}
      {currentPage === 'upload' && (
        <main className="max-w-5xl mx-auto px-6 py-12">

          {/* Page title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Upload Legal Judgments
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Upload multiple PDF case law documents to receive AI-generated summaries,
              key issue extraction, and side-by-side comparisons.
            </p>
          </div>

          {/* File Uploader */}
          <FileUploader onUploadSuccess={handleUploadSuccess} />

          {/* Upload result preview */}
          {uploadResult && (
            <div className="mt-10 p-6 bg-slate-800/60 border border-slate-700 rounded-2xl">
              <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">
                📋 Uploaded Files — Ready for Analysis
              </h3>
              <div className="space-y-2">
                {uploadResult.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📑</span>
                      <span className="text-slate-300 text-sm">{file.originalName}</span>
                    </div>
                    <span className="text-slate-500 text-xs">{file.sizeMB} MB</span>
                  </div>
                ))}
              </div>

              {/* Navigate to dashboard */}
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mt-5 w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <span>⚖️</span>
                <span>Open Comparison Dashboard</span>
              </button>
            </div>
          )}

          {/* Quick link to dashboard (even without uploading — demo mode) */}
          {!uploadResult && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-4 transition-colors"
              >
                Skip upload — open dashboard in demo mode →
              </button>
            </div>
          )}
        </main>
      )}

      {/* COMPARISON DASHBOARD PAGE */}
      {currentPage === 'dashboard' && (
        <ComparisonDashboard
          // In a real flow, caseAData and caseBData would be populated
          // from the full extract + summarise + features pipeline.
          // For now, null props trigger demo mode inside ComparisonDashboard.
          caseAData={null}
          caseBData={null}
        />
      )}
    </div>
  )
}

export default App
