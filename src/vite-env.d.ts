/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** JWT anon key from Supabase Dashboard → Settings → API (preferred). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Legacy; used only if `VITE_SUPABASE_ANON_KEY` is unset. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
