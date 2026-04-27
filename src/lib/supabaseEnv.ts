/**
 * Validates Supabase client env at runtime (Vite exposes only VITE_* to the browser).
 * Prefer the classic JWT **anon** key (`eyJ…`) — it is what PostgREST expects and avoids
 * `sb_publishable_…` mismatches that surface as 400/401.
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const anonKey =
    String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim() ||
    String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (JWT from Supabase → Settings → API) on Vercel, then redeploy. Legacy VITE_SUPABASE_PUBLISHABLE_KEY is only used if anon is unset."
    );
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error("VITE_SUPABASE_URL must use https");
    }
  } catch {
    throw new Error(`Invalid VITE_SUPABASE_URL: "${url}"`);
  }

  return { url, anonKey };
}

export function assertSupabaseConfigured(): void {
  getSupabaseCredentials();
}

/** Same rules as getSupabaseCredentials but returns null instead of throwing (for client bootstrap). */
export function peekSupabaseCredentials(): { url: string; anonKey: string } | null {
  try {
    return getSupabaseCredentials();
  } catch {
    return null;
  }
}
