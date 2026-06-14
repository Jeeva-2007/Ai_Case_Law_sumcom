// backend/src/routes/aiProxy.js
// -------------------------------------------------------
// This file acts as a proxy for the Python AI service.
// It allows the frontend to call similarity and case comparison services
// through the backend (port 5000) instead of calling the AI service (port 8000) directly.
// -------------------------------------------------------

const express = require('express')
const router = express.Router()
const axios = require('axios')

// Load the AI service URL from environment variables, default to port 8000
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// POST /api/similarity -> forwards to POST /similarity on AI service
router.post('/similarity', async (req, res, next) => {
  console.log('🔄 Proxying POST /similarity to Python AI Service...')
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/similarity`, req.body)
    res.status(response.status).json(response.data)
  } catch (error) {
    console.error('❌ Proxy /similarity error:', error.message)
    const statusCode = error.response?.status || 500
    const detailMsg = error.response?.data?.detail?.message || error.response?.data?.detail || error.message
    res.status(statusCode).json({
      success: false,
      message: 'Failed to compute similarity score.',
      error: detailMsg
    })
  }
})

// POST /api/compare-cases -> forwards to POST /compare-cases on AI service
router.post('/compare-cases', async (req, res, next) => {
  console.log('🔄 Proxying POST /compare-cases to Python AI Service...')
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/compare-cases`, req.body)
    res.status(response.status).json(response.data)
  } catch (error) {
    console.error('❌ Proxy /compare-cases error:', error.message)
    const statusCode = error.response?.status || 500
    const detailMsg = error.response?.data?.detail?.message || error.response?.data?.detail || error.message
    res.status(statusCode).json({
      success: false,
      message: 'Failed to run comparative analysis.',
      error: detailMsg
    })
  }
})

module.exports = router
