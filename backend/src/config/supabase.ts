const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (supabaseAnonKey && supabaseAnonKey.startsWith('sb_secret_') ? supabaseAnonKey : null);
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not fully configured.');
}

console.log("Using Service Role:", !!supabaseServiceRoleKey);
console.log("Using Anon Key:", !!supabaseAnonKey);

function createSupabaseClient(accessToken?: string) {
  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: class DummyWebSocket {}
    },
    global: accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` },
    } : undefined,
  });
}

const supabase = createSupabaseClient();

let exportVal;

if (supabase) {
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
