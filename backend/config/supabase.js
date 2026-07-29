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

let exportVal;

if (supabase) {
  supabase.supabase = supabase;
  supabase.getSupabaseClient = function() {
    return supabase;
  };
  exportVal = supabase;
} else {
  const emptyExport = {
    supabase: null,
    getSupabaseClient: function() {
      throw new Error('Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
  };
  exportVal = emptyExport;
}

module.exports = exportVal;
