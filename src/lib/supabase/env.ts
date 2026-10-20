/**
 * Supabase environment configuration.
 *
 * Academic production runs against a real Supabase project. There are no
 * placeholder fallbacks: when the variables are missing the app renders a
 * setup notice instead of silently running against fake data.
 */

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim();

/** True once both public Supabase variables are present. */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
