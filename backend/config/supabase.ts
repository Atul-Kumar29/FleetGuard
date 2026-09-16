import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (supabaseAnonKey && supabaseAnonKey.startsWith("sb_secret_")
    ? supabaseAnonKey
    : null);

const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are not fully configured.");
}

// Debug: show which key type is present
console.log("Using Service Role:", !!supabaseServiceRoleKey);
console.log("Using Anon Key:", !!supabaseAnonKey);

function createSupabaseClient(
  accessToken?: string
): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },

    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

// Create shared client
const supabase = createSupabaseClient();

if (supabase) {
  const client = supabase as SupabaseClient & {
    getSupabaseClient: () => SupabaseClient;
  };

  client.getSupabaseClient = function () {
    return supabase;
  };

  module.exports = client;
} else {
  module.exports = {
    supabase: null,

    getSupabaseClient: function (): never {
      throw new Error(
        "Supabase client is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY."
      );
    },
  };
}