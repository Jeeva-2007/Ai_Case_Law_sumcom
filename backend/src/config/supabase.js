// backend/src/config/supabase.js
// -------------------------------------------------------
// This file initializes the Supabase client for backend database
// and storage operations.
// -------------------------------------------------------

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

// Helper to check if credentials are valid (and not just placeholders)
const isValidCredentials = 
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project-id') && 
  !supabaseKey.includes('your-supabase-service-role-key-here') &&
  !supabaseKey.includes('your-supabase-anon-key-here')

if (!isValidCredentials) {
  console.warn('⚠️ Supabase credentials are missing or using placeholders. Database & Storage operations will be bypassed, falling back to local storage.')
}

const supabase = isValidCredentials ? createClient(supabaseUrl, supabaseKey) : null

// Auto-create judgment-pdfs bucket if enabled and it doesn't exist
if (supabase) {
  supabase.storage.createBucket('judgment-pdfs', { public: false })
    .then(({ data, error }) => {
      if (error && error.message !== 'Bucket already exists' && error.message !== 'Already exists') {
        console.warn('⚠️ Supabase Storage: Error checking/creating "judgment-pdfs" bucket:', error.message)
      } else {
        console.log('✅ Supabase Storage: bucket "judgment-pdfs" is ready.')
      }
    })
    .catch(err => {
      console.warn('⚠️ Supabase Storage: Bucket auto-creation failed:', err.message)
    })
}

module.exports = supabase
