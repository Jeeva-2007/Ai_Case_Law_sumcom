// backend/src/routes/history.js
// -------------------------------------------------------
// This router manages history queries: retrieving saved cases,
// listing comparisons, and handling case deletion.
// -------------------------------------------------------

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const supabase = require('../config/supabase')

// GET /api/history/cases -> retrieve list of all saved cases
router.get('/cases', async (req, res, next) => {
  console.log('🔍 Fetching saved cases history from database...')
  if (!supabase) {
    return res.status(200).json([]) // return empty array if db is bypassed
  }
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }
    res.status(200).json(data || [])
  } catch (error) {
    console.error('❌ Failed to fetch case history:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch case history.',
      error: error.message
    })
  }
})

// DELETE /api/history/cases/:id -> Delete a case (and its associated PDF storage + comparisons)
router.delete('/cases/:id', async (req, res, next) => {
  const { id } = req.params
  console.log(`🗑️ Processing deletion request for case ID: ${id}`)
  
  if (!supabase) {
    return res.status(400).json({
      success: false,
      message: 'Database operations are currently disabled.'
    })
  }

  try {
    // 1. Fetch saved_name to delete the storage file and local backup
    const { data: caseData, error: fetchError } = await supabase
      .from('cases')
      .select('saved_name')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case judgment not found in database.'
      })
    }

    // 2. Delete file from Supabase Storage bucket
    const { error: storageError } = await supabase.storage
      .from('judgment-pdfs')
      .remove([caseData.saved_name])

    if (storageError) {
      console.warn(`⚠️ Supabase Storage: failed to delete PDF file: ${caseData.saved_name}`, storageError.message)
    } else {
      console.log(`   [Supabase Storage] Deleted: ${caseData.saved_name}`)
    }

    // 3. Delete file from local uploads disk storage if present
    const localPath = path.join(__dirname, '..', '..', 'uploads', caseData.saved_name)
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath)
        console.log(`   [Local Disk] Deleted: ${caseData.saved_name}`)
      } catch (diskErr) {
        console.warn(`⚠️ Local Disk: failed to delete file:`, diskErr.message)
      }
    }

    // 4. Delete case row from database (cascades automatically to 'comparisons')
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    console.log(`✅ Successfully deleted case ${id} from database (cascaded comparison records).`)
    res.status(200).json({
      success: true,
      message: 'Case deleted successfully from database, comparisons, and storage.'
    })
  } catch (error) {
    console.error(`❌ Failed to delete case ${id}:`, error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to delete case.',
      error: error.message
    })
  }
})

module.exports = router
