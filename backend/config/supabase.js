const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded (especially for tests running from different directories)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not fully configured.');
}

// Debug: show which key type is present
console.log("Using Service Role:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("Using Anon Key:", !!process.env.SUPABASE_ANON_KEY);

function createSupabaseClient(accessToken) {
  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    // The service-role client is used only by this server after its own role
    // middleware authorizes the request. Without it, a real user JWT is
    // forwarded so Supabase RLS can evaluate auth.uid().
    global: accessToken && !supabaseServiceRoleKey ? {
      headers: { Authorization: `Bearer ${accessToken}` },
    } : undefined,
  });
}

// The shared client is suitable for unauthenticated operations such as
// validating a token. Database requests protected by RLS receive a client
// configured with the requester's bearer token below.
const supabase = createSupabaseClient();

let exportVal;

if (supabase) {
  supabase.supabase = supabase;
  supabase.getSupabaseClient = function(accessToken) {
    return accessToken ? createSupabaseClient(accessToken) : supabase;
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
