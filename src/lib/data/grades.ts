import type { SupabaseClient } from "@supabase/supabase-js";
import type { GradeCategory, GradeItem, StudentGrade } from "@/types";

export interface GradeItemRow {
  id: string;
  class_id: string;
  category: GradeCategory;
  title: string;
  max_score: number;
  weight_percentage: number;
  date: string;
}

export interface StudentGradeRow {
  id: string;
  grade_item_id: string;
  student_id: string;
  score: number | null;
  feedback: string | null;
}

export const GRADE_ITEM_COLUMNS =
  "id,class_id,category,title,max_score,weight_percentage,date";

export function mapGradeItemRow(row: GradeItemRow): GradeItem {
  return {
    id: row.id,
    classId: row.class_id,
    category: row.category,
    title: row.title,
    maxScore: Number(row.max_score),
    weightPercentage: Number(row.weight_percentage),
    date: row.date,
  };
}

export function mapStudentGradeRow(row: StudentGradeRow): StudentGrade {
  return {
    id: row.id,
    gradeItemId: row.grade_item_id,
    studentId: row.student_id,
    score: row.score === null ? null : Number(row.score),
    feedback: row.feedback ?? undefined,
  };
}

export async function listGradeItems(
  client: SupabaseClient,
  classId: string
): Promise<GradeItem[]> {
  const { data, error } = await client
    .from("grade_items")
    .select(GRADE_ITEM_COLUMNS)
    .eq("class_id", classId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data as GradeItemRow[] | null ?? []).map(mapGradeItemRow);
}

export interface CreateGradeItemInput {
  category: GradeCategory;
  title: string;
  maxScore: number;
  weightPercentage: number;
  date: string;
}

export async function createGradeItem(
  client: SupabaseClient,
  classId: string,
  input: CreateGradeItemInput
): Promise<GradeItem> {
  const { data, error } = await client
    .from("grade_items")
    .insert({
      class_id: classId,
      category: input.category,
      title: input.title,
      max_score: input.maxScore,
      weight_percentage: input.weightPercentage,
      date: input.date,
    })
    .select(GRADE_ITEM_COLUMNS)
    .single();
  if (error) throw error;
  return mapGradeItemRow(data as GradeItemRow);
}

/** Loads every grade entry for a class (joined through its grade items). */
export async function listStudentGrades(
  client: SupabaseClient,
  classId: string
): Promise<StudentGrade[]> {
  const { data, error } = await client
    .from("student_grades")
    .select("id,grade_item_id,student_id,score,feedback,grade_items!inner(class_id)")
    .eq("grade_items.class_id", classId);
  if (error) throw error;
  return (data as StudentGradeRow[] | null ?? []).map(mapStudentGradeRow);
}

export interface GradeUpsertRow {
  gradeItemId: string;
  studentId: string;
  score: number | null;
  feedback?: string | null;
}

/** Saves a batch of scores. A null score means ungraded/missed, never zero. */
export async function saveGrades(
  client: SupabaseClient,
  rows: GradeUpsertRow[]
): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await client.from("student_grades").upsert(
    rows.map((r) => ({
      grade_item_id: r.gradeItemId,
      student_id: r.studentId,
      score: r.score,
      is_missing: r.score === null,
      feedback: r.feedback ?? null,
    })),
    { onConflict: "grade_item_id,student_id" }
  );
  if (error) throw error;
}

export async function deleteGradeItem(
  client: SupabaseClient,
  itemId: string
): Promise<void> {
  const { error } = await client.from("grade_items").delete().eq("id", itemId);
  if (error) throw error;
}
