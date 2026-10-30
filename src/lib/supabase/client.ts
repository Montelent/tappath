/**
 * Legacy Supabase helpers — disabled.
 * Backend now uses Neon via DATABASE_URL (@/lib/db/neon).
 * Kept so any residual imports resolve without @supabase/supabase-js.
 */

export function getSupabaseBrowser(): null {
  return null;
}

export function getSupabaseServer(): null {
  return null;
}

export function getSupabaseAdmin(): null {
  return null;
}

export function isSupabaseConfigured(): boolean {
  return false;
}
