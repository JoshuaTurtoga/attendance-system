import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Service-role Supabase client for privileged server-only operations such as
 * provisioning faculty accounts (which the anon key is not permitted to do).
 *
 * NEVER import this into a client component — the key bypasses Row-Level
 * Security and must stay on the server.
 */
export function createAdminClient(): SupabaseClient | null {
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!isSupabaseConfigured() || serviceRoleKey.length === 0) {
    return null;
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
