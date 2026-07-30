const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not fully configured.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        transport: class DummyWebSocket {}
      }
    })
  : null;

module.exports = {
  supabase,
  getSupabaseClient() {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return supabase;
  },
};
