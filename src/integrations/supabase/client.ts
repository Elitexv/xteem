import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { peekSupabaseCredentials } from "@/lib/supabaseEnv";

const creds = peekSupabaseCredentials();
const SUPABASE_URL = creds?.url ?? "";
const SUPABASE_ANON_KEY = creds?.anonKey ?? "";

if (!creds && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.error(
    "[eLibrary] Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (JWT anon key) on Vercel, then redeploy."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});