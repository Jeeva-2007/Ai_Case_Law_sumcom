// backend/src/routes/aiProxy.js
// -------------------------------------------------------
// This file acts as a proxy for the Python AI service.
// It allows the frontend to call similarity and case comparison services
// through the backend (port 5000) instead of calling the AI service (port 8000) directly.
// Incorporates database caching for both similarity and comparisons.
// -------------------------------------------------------

const express = require('express')
const router = express.Router()
const axios = require('axios')
const supabase = require('../config/supabase')

// Load the AI service URL from environment variables, default to port 8000
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

/**
 * Helper: Resolve Case Database ID by matching its summary
 */
const getCaseIdBySummary = async (summary) => {
  if (!supabase || !summary) return null
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id')
      .eq('summary', summary)
      .maybeSingle()

    if (error) {
      console.warn('⚠️ Supabase error looking up case ID:', error.message)
      return null
    }
    return data ? data.id : null
  } catch (err) {
    console.warn('⚠️ Exception looking up case ID:', err.message)
    return null
  }
}

/**
 * Helper: Get sorted ID pair to query or insert comparison records
 */
const getOrderedPair = (idA, idB) => {
  if (!idA || !idB) return null
  const sorted = [idA, idB].sort()
  return { orderedA: sorted[0], orderedB: sorted[1] }
}

// POST /api/similarity -> forwards to POST /similarity on AI service
router.post('/similarity', async (req, res, next) => {
  const { case_a_text, case_b_text } = req.body

  let idA = null
  let idB = null
  let orderedPair = null

  if (supabase) {
    // 1. Resolve case database IDs by summary
    idA = await getCaseIdBySummary(case_a_text)
    idB = await getCaseIdBySummary(case_b_text)
    orderedPair = getOrderedPair(idA, idB)

    // 2. Check comparisons table cache
    if (orderedPair) {
      const { orderedA, orderedB } = orderedPair
      try {
        const { data, error } = await supabase
          .from('comparisons')
          .select('similarity_score, similarity_interpretation')
          .eq('case_a_id', orderedA)
          .eq('case_b_id', orderedB)
          .maybeSingle()

        if (error) {
          console.warn('⚠️ Supabase similarity cache fetch error:', error.message)
        } else if (data && data.similarity_score !== null) {
          console.log(`⚡ Cache Hit! Loaded similarity score (${data.similarity_score}%) from database.`)
          return res.status(200).json({
            similarity_score: data.similarity_score,
            interpretation: data.similarity_interpretation,
            model_used: 'cached-database'
          })
        }
      } catch (err) {
        console.warn('⚠️ Similarity cache query exception:', err.message)
      }
    }
  }

  // 3. Cache Miss -> Call AI Service
  console.log('🔄 Proxying POST /similarity to Python AI Service (Cache Miss)...')
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/similarity`, req.body)
    const result = response.data

    // 4. Save to Database comparisons table if keys exist
    if (supabase && orderedPair && result.similarity_score !== undefined) {
      const { orderedA, orderedB } = orderedPair
      try {
        console.log(`💾 Caching similarity score to Supabase database...`)
        await supabase
          .from('comparisons')
          .upsert({
            case_a_id: orderedA,
            case_b_id: orderedB,
            similarity_score: result.similarity_score,
            similarity_interpretation: result.interpretation
          }, { onConflict: 'case_a_id,case_b_id' })
      } catch (dbErr) {
        console.warn('⚠️ Failed to cache similarity score:', dbErr.message)
      }
    }

    res.status(response.status).json(result)
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
  const { case_a, case_b } = req.body

  let idA = null
  let idB = null
  let orderedPair = null

  if (supabase) {
    // 1. Resolve case database IDs by summary
    idA = await getCaseIdBySummary(case_a?.summary)
    idB = await getCaseIdBySummary(case_b?.summary)
    orderedPair = getOrderedPair(idA, idB)

    // 2. Check comparisons table cache
    if (orderedPair) {
      const { orderedA, orderedB } = orderedPair
      try {
        const { data, error } = await supabase
          .from('comparisons')
          .select('common_issues, common_principles, structural_differences, adversarial_strategy')
          .eq('case_a_id', orderedA)
          .eq('case_b_id', orderedB)
          .maybeSingle()

        if (error) {
          console.warn('⚠️ Supabase comparisons cache fetch error:', error.message)
        } else if (data && data.common_issues && data.common_issues.length > 0) {
          console.log(`⚡ Cache Hit! Loaded full comparison matrix from database.`)
          return res.status(200).json({
            common_issues: data.common_issues,
            common_principles: data.common_principles,
            structural_differences: data.structural_differences,
            adversarial_strategy: data.adversarial_strategy,
            model_used: 'cached-database'
          })
        }
      } catch (err) {
        console.warn('⚠️ Comparison cache query exception:', err.message)
      }
    }
  }

  // 3. Cache Miss -> Call AI Service
  console.log('🔄 Proxying POST /compare-cases to Python AI Service (Cache Miss)...')
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/compare-cases`, req.body)
    const result = response.data

    // 4. Save to Database comparisons table if keys exist
    if (supabase && orderedPair) {
      const { orderedA, orderedB } = orderedPair
      try {
        console.log(`💾 Caching comparison results to Supabase database...`)
        await supabase
          .from('comparisons')
          .upsert({
            case_a_id: orderedA,
            case_b_id: orderedB,
            common_issues: result.common_issues || [],
            common_principles: result.common_principles || [],
            structural_differences: result.structural_differences || [],
            adversarial_strategy: result.adversarial_strategy || {}
          }, { onConflict: 'case_a_id,case_b_id' })
      } catch (dbErr) {
        console.warn('⚠️ Failed to cache comparison results:', dbErr.message)
      }
    }

    res.status(response.status).json(result)
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
