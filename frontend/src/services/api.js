// frontend/src/services/api.js
// -------------------------------------------------------
// This file contains all functions that talk to our backend API.
// We use axios (a popular HTTP library) to make API requests.
// Having all API calls in one file makes it easy to manage and change URLs.
// -------------------------------------------------------

import axios from 'axios'

// Base URL of our Node.js backend server
// We read it from the .env file (VITE_ prefix is required for Vite to expose it)
// Falls back to localhost:5000 if the env variable is not set
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// Create a reusable axios instance with our backend URL pre-configured
// This way we don't have to repeat the base URL in every function
const apiClient = axios.create({
  baseURL: BACKEND_URL,
})

// -------------------------------------------------------
// FUNCTION: uploadPDFFiles
// Purpose: Upload multiple PDF files to the backend server
//
// Parameters:
//   - files: An array of File objects (the PDFs the user selected)
//   - onUploadProgress: A callback function that receives progress % (0-100)
//                       We use this to update the progress bar in the UI
//
// Returns: The response data from the backend (JSON with file info)
// -------------------------------------------------------
export const uploadPDFFiles = async (files, onUploadProgress) => {
  // FormData is a special browser object used to send files in HTTP requests
  // It's like filling out an HTML form programmatically
  const formData = new FormData()

  // Append each file to the FormData object
  // 'documents' is the field name — must match what multer expects on the backend
  files.forEach((file) => {
    formData.append('documents', file)
  })

  // Make the POST request to our backend upload endpoint
  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      // Tell the server we're sending form data with files
      'Content-Type': 'multipart/form-data',
    },
    // onUploadProgress is called by axios as the upload progresses
    // The 'progressEvent' object has 'loaded' (bytes sent) and 'total' (total bytes)
    onUploadProgress: (progressEvent) => {
      // Calculate percentage: (bytes sent / total bytes) * 100
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      // Call the callback function with the current progress percentage
      if (onUploadProgress) {
        onUploadProgress(percentCompleted)
      }
    },
  })

  // Return the data from the server response
  return response.data
}

// -------------------------------------------------------
// FUNCTION: checkBackendHealth
// Purpose: Ping the backend to confirm it is running
// Used to show connection status in the UI
// -------------------------------------------------------
export const checkBackendHealth = async () => {
  const response = await apiClient.get('/api/health')
  return response.data
}

// -------------------------------------------------------
// AI SERVICE DIRECT CALLS (Python FastAPI on port 8000)
// -------------------------------------------------------
// These functions call the Python AI service directly from the browser.
// In a full production setup these would be proxied through the Node backend,
// but for our development build they call port 8000 directly.
//
// Base URL read from .env as VITE_AI_SERVICE_URL, default: http://localhost:8000
// -------------------------------------------------------

const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

// Separate axios instance just for the Python AI service
const aiClient = axios.create({ baseURL: AI_URL })

// -------------------------------------------------------
// FUNCTION: generateSummary
// Calls POST /generate-summary on the Python AI service.
//
// Parameters:
//   text (string): Raw extracted text of the legal judgment
//
// Returns:
//   { status, model_used, summary: { text, word_count, sections_found }, is_fallback }
// -------------------------------------------------------
export const generateSummary = async (text) => {
  const response = await aiClient.post('/generate-summary', { text })
  return response.data
}

// -------------------------------------------------------
// FUNCTION: extractFeatures
// Calls POST /extract-features on the Python AI service.
//
// Parameters:
//   text (string): Raw extracted text of the legal judgment
//
// Returns:
//   { status, issues: ["..."], principles: ["..."], is_fallback }
// -------------------------------------------------------
export const extractFeatures = async (text) => {
  const response = await aiClient.post('/extract-features', { text })
  return response.data
}

// -------------------------------------------------------
// FUNCTION: getSimilarityScore
// Calls POST /similarity on the Python AI service.
//
// Parameters:
//   caseAText (string): Text of the first case
//   caseBText (string): Text of the second case
//
// Returns:
//   { similarity_score: 78, interpretation: "High similarity...", model_used }
// -------------------------------------------------------
export const getSimilarityScore = async (caseAText, caseBText) => {
  const response = await aiClient.post('/similarity', {
    case_a_text: caseAText,
    case_b_text: caseBText,
  })
  return response.data
}

// -------------------------------------------------------
// FUNCTION: compareCases
// Calls POST /compare-cases on the Python AI service.
//
// Parameters:
//   caseA (object): { summary: "...", issues: [], principles: [] }
//   caseB (object): { summary: "...", issues: [], principles: [] }
//
// Returns:
//   {
//     common_issues: [],
//     common_principles: [],
//     structural_differences: [],
//     adversarial_strategy: {
//       if_you_rely_on_case_a: "...",
//       how_to_distinguish_them: "..."
//     }
//   }
// -------------------------------------------------------
export const compareCases = async (caseA, caseB) => {
  const response = await aiClient.post('/compare-cases', {
    case_a: caseA,
    case_b: caseB,
  })
  return response.data
}
