const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded (especially for tests running from different directories)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not fully configured.');
}

// Initialize the Supabase Client with disabled persistSession/autoRefreshToken for Node/Express environment
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (supabase) {
  // Attach properties for backwards compatibility with Dev branch destructured imports
  supabase.supabase = supabase;
  supabase.getSupabaseClient = function() {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return supabase;
  };
} else {
  // If supabase client couldn't be configured, build a mock/empty export structure
  // that throws when getSupabaseClient is invoked
  const emptyExport = {};
  emptyExport.supabase = null;
  emptyExport.getSupabaseClient = function() {
    throw new Error('Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
  };
  module.exports = emptyExport;
  return;
}

module.exports = supabase;
