import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { assertSupabaseConfigured } from "@/lib/supabaseEnv";
import type { Database } from "@/integrations/supabase/types";

export function mapPostgrestError(err: PostgrestError): Error {
  const parts = [err.message, err.code ? `code ${err.code}` : "", err.hint ? `hint: ${err.hint}` : ""].filter(Boolean);
  return new Error(parts.join(" — "));
}

type BookRow = Database["public"]["Tables"]["books"]["Row"];

export async function fetchAllBooks(): Promise<BookRow[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
  if (error) throw mapPostgrestError(error);
  return data ?? [];
}

export async function fetchMyBorrowings(userId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("borrowings")
    .select("*, books(*)")
    .eq("user_id", userId)
    .order("borrowed_at", { ascending: false });
  if (error) throw mapPostgrestError(error);
  return data ?? [];
}

export async function fetchActiveBorrowingBookIds(userId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("borrowings")
    .select("book_id")
    .eq("user_id", userId)
    .eq("status", "borrowed");
  if (error) throw mapPostgrestError(error);
  return data ?? [];
}

export async function fetchAllBorrowingsAdmin() {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("borrowings")
    .select("*, books(*)")
    .order("borrowed_at", { ascending: false });
  if (error) throw mapPostgrestError(error);
  return data ?? [];
}

export async function fetchProfileForUser(userId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw mapPostgrestError(error);
  return data;
}
