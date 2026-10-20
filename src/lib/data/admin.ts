import type { SupabaseClient } from "@supabase/supabase-js";
import type { SystemPolicyConfig } from "@/lib/admin/admin-portal-engine";

export interface SystemPolicyRow {
  active_term: string;
  mini_term: string | null;
  late_to_absent_ratio: number;
  max_absence_threshold: number;
  departments: string[];
}

/** Reads the institutional policy singleton (admin configuration). */
export async function fetchSystemPolicy(
  client: SupabaseClient
): Promise<SystemPolicyConfig | null> {
  const { data, error } = await client
    .from("system_policies")
    .select("active_term,mini_term,late_to_absent_ratio,max_absence_threshold,departments")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as SystemPolicyRow;
  return {
    activeTerm: row.active_term,
    miniTerm: row.mini_term ?? undefined,
    lateToAbsentRatio: row.late_to_absent_ratio,
    maxAbsenceThreshold: row.max_absence_threshold,
    departments: row.departments,
  };
}

export async function saveSystemPolicy(
  client: SupabaseClient,
  config: SystemPolicyConfig
): Promise<void> {
  const { error } = await client.from("system_policies").upsert(
    {
      id: 1,
      active_term: config.activeTerm,
      mini_term: config.miniTerm ?? null,
      late_to_absent_ratio: config.lateToAbsentRatio,
      max_absence_threshold: config.maxAbsenceThreshold,
      departments: config.departments,
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}
