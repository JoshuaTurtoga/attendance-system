import type { SupabaseClient } from "@supabase/supabase-js";
import { appCache } from "@/lib/cache/data-cache";
import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassSession,
  ExcuseRequest,
  SessionType,
} from "@/types";

export interface SessionRow {
  id: string;
  class_id: string;
  date: string;
  type: SessionType;
  title: string | null;
  notes: string | null;
  exempt_from_fda: boolean;
}

export interface AttendanceRow {
  id: string;
  class_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  document_url: string | null;
  created_at: string;
}

export interface ExcuseRow {
  id: string;
  class_id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  date: string;
  reason: string;
  document_url: string | null;
  status: "pending" | "approved" | "declined";
  rejection_reason: string | null;
  submitted_at: string;
  resolved_at: string | null;
}

export const SESSION_COLUMNS =
  "id,class_id,date,type,title,notes,exempt_from_fda";
export const ATTENDANCE_COLUMNS =
  "id,class_id,student_id,date,status,note,document_url,created_at";
export const EXCUSE_COLUMNS =
  "id,class_id,student_id,student_name,student_number,date,reason,document_url,status,rejection_reason,submitted_at,resolved_at";

export function mapSessionRow(row: SessionRow): ClassSession {
  return {
    id: row.id,
    classId: row.class_id,
    date: row.date,
    type: row.type,
    title: row.title ?? undefined,
    notes: row.notes ?? undefined,
    exemptFromFDA: row.exempt_from_fda,
  };
}

export function mapAttendanceRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    classId: row.class_id,
    studentId: row.student_id,
    date: row.date,
    status: row.status,
    note: row.note ?? undefined,
    documentUrl: row.document_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapExcuseRow(row: ExcuseRow): ExcuseRequest {
  return {
    id: row.id,
    classId: row.class_id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentNumber: row.student_number,
    date: row.date,
    reason: row.reason,
    documentUrl: row.document_url ?? undefined,
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedAt: row.submitted_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

export async function listSessions(
  client: SupabaseClient,
  classId: string
): Promise<ClassSession[]> {
  const { data, error } = await client
    .from("class_sessions")
    .select(SESSION_COLUMNS)
    .eq("class_id", classId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data as SessionRow[] | null ?? []).map(mapSessionRow);
}

/** Records (or updates) a dated session for the class. */
export async function upsertSession(
  client: SupabaseClient,
  classId: string,
  date: string,
  type: SessionType
): Promise<void> {
  const { error } = await client.from("class_sessions").upsert(
    { class_id: classId, date, type },
    { onConflict: "class_id,date", ignoreDuplicates: true }
  );
  if (error) throw error;
  appCache.invalidateTag(`class-${classId}`);
  appCache.invalidateTag("attendance");
}

export async function listAttendance(
  client: SupabaseClient,
  classId: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await client
    .from("attendance_records")
    .select(ATTENDANCE_COLUMNS)
    .eq("class_id", classId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data as AttendanceRow[] | null ?? []).map(mapAttendanceRow);
}

/** Batch fetches attendance records across multiple classes in a single query. */
export async function listAttendanceForClasses(
  client: SupabaseClient,
  classIds: string[]
): Promise<AttendanceRecord[]> {
  if (classIds.length === 0) return [];
  const { data, error } = await client
    .from("attendance_records")
    .select(ATTENDANCE_COLUMNS)
    .in("class_id", classIds)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data as AttendanceRow[] | null ?? []).map(mapAttendanceRow);
}

export interface AttendanceUpsertRow {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
}

/** Saves a roll-call / attendance snapshot for the class. */
export async function saveAttendance(
  client: SupabaseClient,
  classId: string,
  rows: AttendanceUpsertRow[]
): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await client.from("attendance_records").upsert(
    rows.map((r) => ({
      class_id: classId,
      student_id: r.studentId,
      date: r.date,
      status: r.status,
      note: r.note ?? null,
    })),
    { onConflict: "class_id,student_id,date" }
  );
  if (error) throw error;
  appCache.invalidateTag(`class-${classId}`);
  appCache.invalidateTag("attendance");
}

export async function listExcuses(
  client: SupabaseClient,
  classId: string
): Promise<ExcuseRequest[]> {
  const { data, error } = await client
    .from("excuse_requests")
    .select(EXCUSE_COLUMNS)
    .eq("class_id", classId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data as ExcuseRow[] | null ?? []).map(mapExcuseRow);
}

/** Batch fetches excuse requests across multiple classes in a single query. */
export async function listExcusesForClasses(
  client: SupabaseClient,
  classIds: string[]
): Promise<ExcuseRequest[]> {
  if (classIds.length === 0) return [];
  const { data, error } = await client
    .from("excuse_requests")
    .select(EXCUSE_COLUMNS)
    .in("class_id", classIds)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data as ExcuseRow[] | null ?? []).map(mapExcuseRow);
}

export interface SubmitExcuseInput {
  classId: string;
  studentId: string;
  submittedBy: string;
  studentName: string;
  studentNumber: string;
  date: string;
  reason: string;
  documentUrl?: string;
}

export async function submitExcuse(
  client: SupabaseClient,
  input: SubmitExcuseInput
): Promise<void> {
  const { error } = await client.from("excuse_requests").insert({
    class_id: input.classId,
    student_id: input.studentId,
    submitted_by: input.submittedBy,
    student_name: input.studentName,
    student_number: input.studentNumber,
    date: input.date,
    reason: input.reason,
    document_url: input.documentUrl ?? null,
  });
  if (error) throw error;
  appCache.invalidateTag(`class-${input.classId}`);
  appCache.invalidateTag("attendance");
}

/**
 * Approves an excuse slip: marks the request approved and records the date as
 * Excused (E) on the attendance sheet.
 */
export async function approveExcuse(
  client: SupabaseClient,
  request: ExcuseRequest
): Promise<void> {
  const { error: requestError } = await client
    .from("excuse_requests")
    .update({
      status: "approved",
      rejection_reason: null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", request.id);
  if (requestError) throw requestError;

  const { error: attendanceError } = await client
    .from("attendance_records")
    .upsert(
      {
        class_id: request.classId,
        student_id: request.studentId,
        date: request.date,
        status: "E",
        note: "Approved excuse slip",
      },
      { onConflict: "class_id,student_id,date" }
    );
  if (attendanceError) throw attendanceError;
  appCache.invalidateTag(`class-${request.classId}`);
  appCache.invalidateTag("attendance");
}

export async function declineExcuse(
  client: SupabaseClient,
  requestId: string,
  reason: string
): Promise<void> {
  const { error } = await client
    .from("excuse_requests")
    .update({
      status: "declined",
      rejection_reason: reason,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) throw error;
  appCache.invalidateTag("attendance");
}

export async function deleteSession(
  client: SupabaseClient,
  classId: string,
  date: string
): Promise<void> {
  const { error } = await client
    .from("class_sessions")
    .delete()
    .eq("class_id", classId)
    .eq("date", date);
  if (error) throw error;
  appCache.invalidateTag(`class-${classId}`);
  appCache.invalidateTag("attendance");
}
