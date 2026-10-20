import type { SupabaseClient } from "@supabase/supabase-js";
import type { JoinRequest, RosterStudent } from "@/types";
import { parseStudentName } from "@/lib/roster/roster-engine";

export interface RosterRow {
  id: string;
  class_id: string;
  student_number: string;
  last_name: string;
  first_name: string;
  middle_initial: string | null;
  program: string;
  academic_level: string;
  user_id: string | null;
  avatar_url: string | null;
}

export interface JoinRequestRow {
  id: string;
  class_id: string;
  requester_id: string | null;
  student_number: string;
  student_name: string;
  program: string;
  academic_level: string;
  photo_id_url: string | null;
  status: "pending" | "approved" | "declined";
  rejection_reason: string | null;
  submitted_at: string;
}

export const ROSTER_COLUMNS =
  "id,class_id,student_number,last_name,first_name,middle_initial,program,academic_level,user_id,avatar_url";

export const JOIN_REQUEST_COLUMNS =
  "id,class_id,requester_id,student_number,student_name,program,academic_level,photo_id_url,status,rejection_reason,submitted_at";

export function mapRosterRow(row: RosterRow): RosterStudent {
  return {
    id: row.id,
    classId: row.class_id,
    studentNumber: row.student_number,
    lastName: row.last_name,
    firstName: row.first_name,
    middleInitial: row.middle_initial ?? undefined,
    program: row.program,
    academicLevel: row.academic_level,
    userId: row.user_id ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
  };
}

export function mapJoinRequestRow(row: JoinRequestRow): JoinRequest {
  return {
    id: row.id,
    classId: row.class_id,
    requesterId: row.requester_id ?? undefined,
    studentNumber: row.student_number,
    studentName: row.student_name,
    program: row.program,
    academicLevel: row.academic_level,
    photoIdUrl: row.photo_id_url ?? "",
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedAt: row.submitted_at,
  };
}

export async function listRoster(
  client: SupabaseClient,
  classId: string
): Promise<RosterStudent[]> {
  const { data, error } = await client
    .from("roster_students")
    .select(ROSTER_COLUMNS)
    .eq("class_id", classId)
    .order("last_name", { ascending: true });
  if (error) throw error;
  return (data as RosterRow[] | null ?? []).map(mapRosterRow);
}

export interface RosterImportRow {
  studentNumber: string;
  lastName: string;
  firstName: string;
  middleInitial?: string;
  program: string;
  academicLevel: string;
}

/** Adds pasted/imported students to a class roster, ignoring duplicates. */
export async function importRosterStudents(
  client: SupabaseClient,
  classId: string,
  students: RosterImportRow[]
): Promise<void> {
  if (students.length === 0) return;
  const { error } = await client.from("roster_students").upsert(
    students.map((s) => ({
      class_id: classId,
      student_number: s.studentNumber,
      last_name: s.lastName,
      first_name: s.firstName,
      middle_initial: s.middleInitial ?? null,
      program: s.program,
      academic_level: s.academicLevel,
    })),
    { onConflict: "class_id,student_number" }
  );
  if (error) throw error;
}

export async function listJoinRequests(
  client: SupabaseClient,
  classId: string
): Promise<JoinRequest[]> {
  const { data, error } = await client
    .from("join_requests")
    .select(JOIN_REQUEST_COLUMNS)
    .eq("class_id", classId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data as JoinRequestRow[] | null ?? []).map(mapJoinRequestRow);
}

/** Join applications submitted by the signed-in student, newest first. */
export async function listMyJoinRequests(
  client: SupabaseClient,
  userId: string
): Promise<JoinRequest[]> {
  const { data, error } = await client
    .from("join_requests")
    .select(JOIN_REQUEST_COLUMNS)
    .eq("requester_id", userId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data as JoinRequestRow[] | null ?? []).map(mapJoinRequestRow);
}

/** The roster rows linked to the signed-in student, across every class. */
export async function listMyRosterEntries(
  client: SupabaseClient,
  userId: string
): Promise<RosterStudent[]> {
  const { data, error } = await client
    .from("roster_students")
    .select(ROSTER_COLUMNS)
    .eq("user_id", userId);
  if (error) throw error;
  return (data as RosterRow[] | null ?? []).map(mapRosterRow);
}

/** Returns the enrolled headcount for every class the caller can see. */
export async function listRosterCounts(
  client: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await client
    .from("roster_students")
    .select("class_id");
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of (data as { class_id: string }[] | null) ?? []) {
    counts[row.class_id] = (counts[row.class_id] ?? 0) + 1;
  }
  return counts;
}

export interface SubmitJoinRequestInput {
  classId: string;
  requesterId: string;
  studentNumber: string;
  studentName: string;
  program: string;
  academicLevel: string;
  photoIdUrl?: string;
}

export async function submitJoinRequest(
  client: SupabaseClient,
  input: SubmitJoinRequestInput
): Promise<void> {
  const { error } = await client.from("join_requests").insert({
    class_id: input.classId,
    requester_id: input.requesterId,
    student_number: input.studentNumber,
    student_name: input.studentName,
    program: input.program,
    academic_level: input.academicLevel,
    photo_id_url: input.photoIdUrl ?? null,
  });
  if (error) throw error;
}

/**
 * Approves a join request and links the student to their roster row
 * (creating the row when the applicant was not pre-listed).
 */
export async function approveJoinRequest(
  client: SupabaseClient,
  request: JoinRequest
): Promise<void> {
  const { error: requestError } = await client
    .from("join_requests")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", request.id);
  if (requestError) throw requestError;

  const { data: existing, error: lookupError } = await client
    .from("roster_students")
    .select("id")
    .eq("class_id", request.classId)
    .eq("student_number", request.studentNumber)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    const { error } = await client
      .from("roster_students")
      .update({
        user_id: request.requesterId ?? null,
        avatar_url: request.photoIdUrl || null,
      })
      .eq("id", (existing as { id: string }).id);
    if (error) throw error;
    return;
  }

  const parsed = parseStudentName(request.studentName);
  const { error: insertError } = await client.from("roster_students").insert({
    class_id: request.classId,
    student_number: request.studentNumber,
    last_name: parsed.lastName,
    first_name: parsed.firstName,
    middle_initial: parsed.middleInitial ?? null,
    program: request.program,
    academic_level: request.academicLevel,
    user_id: request.requesterId ?? null,
    avatar_url: request.photoIdUrl || null,
  });
  if (insertError) throw insertError;
}

export async function declineJoinRequest(
  client: SupabaseClient,
  requestId: string,
  reason: string
): Promise<void> {
  const { error } = await client
    .from("join_requests")
    .update({ status: "declined", rejection_reason: reason })
    .eq("id", requestId);
  if (error) throw error;
}

export async function deleteRosterStudent(
  client: SupabaseClient,
  studentId: string
): Promise<void> {
  const { error } = await client.from("roster_students").delete().eq("id", studentId);
  if (error) throw error;
}
