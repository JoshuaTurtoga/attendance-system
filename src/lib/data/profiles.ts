import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role, UserProfile } from "@/types";

/** Shape of a `public.profiles` row as returned by Supabase. */
export interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  roles: Role[];
  active_view: Role;
  department: string | null;
  student_number: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  must_reset_password?: boolean | null;
  created_at: string;
}

export const PROFILE_COLUMNS =
  "id,email,first_name,middle_name,last_name,roles,active_view,department,student_number,avatar_url,is_suspended,created_at";

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    roles: row.roles ?? [],
    activeView: row.active_view,
    department: row.department ?? undefined,
    studentNumber: row.student_number ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    isSuspended: row.is_suspended,
    mustResetPassword: Boolean(row.must_reset_password),
    createdAt: row.created_at,
  };
}

export async function fetchProfile(
  client: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    const fallback = await client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data ? mapProfileRow(fallback.data as ProfileRow) : null;
  }
  return data ? mapProfileRow(data as ProfileRow) : null;
}

/** Institutional user directory (admin only — enforced by RLS). */
export async function listProfiles(client: SupabaseClient): Promise<UserProfile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    const fallback = await client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("last_name", { ascending: true });
    if (fallback.error) throw fallback.error;
    return ((fallback.data as ProfileRow[] | null) ?? []).map(mapProfileRow);
  }
  return ((data as ProfileRow[] | null) ?? []).map(mapProfileRow);
}

export async function setActiveView(
  client: SupabaseClient,
  userId: string,
  view: Role
): Promise<void> {
  const { error } = await client
    .from("profiles")
    .update({ active_view: view })
    .eq("id", userId);
  if (error) throw error;
}

export async function setSuspension(
  client: SupabaseClient,
  userId: string,
  suspended: boolean
): Promise<void> {
  const { error } = await client
    .from("profiles")
    .update({ is_suspended: suspended })
    .eq("id", userId);
  if (error) throw error;
}
