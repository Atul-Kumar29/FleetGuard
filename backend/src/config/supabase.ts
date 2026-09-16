import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
// (especially for tests running from different directories)
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (
    supabaseAnonKey && supabaseAnonKey.startsWith('sb_secret_')
      ? supabaseAnonKey
      : null
  );

const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables are not fully configured.'
  );
}

// Debug: show which key type is present
console.log('Using Service Role:', !!supabaseServiceRoleKey);
console.log('Using Anon Key:', !!supabaseAnonKey);

function createSupabaseClient(
  accessToken?: string
): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },

    realtime: {
      transport: class DummyWebSocket {} as any
    },

    // The service-role client is used only by this server after
    // its own role middleware authorizes the request.
    //
    // Without it, a real user JWT is forwarded so Supabase RLS
    // can evaluate auth.uid().
    ...(accessToken
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        }
      : {})
  });
}

// The shared client is suitable for unauthenticated operations
// such as validating a token.
//
// Database requests protected by RLS receive a client configured
// with the requester's bearer token below.
const supabase = createSupabaseClient();

if (supabase) {
  (
    supabase as SupabaseClient & {
      getSupabaseClient?: () => SupabaseClient;
    }
  ).getSupabaseClient = function (): SupabaseClient {
    return supabase;
  };
} else {
  console.warn(
    'Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.'
  );
}

/**
 * Returns the configured Supabase client.
 *
 * Throws an error if Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.'
    );
  }

  return supabase;
}

/**
 * Creates a Supabase client using the provided access token.
 *
 * This allows Supabase RLS to evaluate the authenticated user's
 * JWT through auth.uid().
 */
export { createSupabaseClient };

export default supabase;