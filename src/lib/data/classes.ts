import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcademicClass, ClassType, ScheduleBlock } from "@/types";
import { appCache } from "@/lib/cache/data-cache";

export interface ClassRow {
  id: string;
  course_code: string;
  course_title: string;
  section: string;
  class_type: ClassType;
  units: number;
  term: string;
  mini_term: string | null;
  instructor_id: string;
  join_code: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleRow {
  class_id: string;
  day_of_week: ScheduleBlock["dayOfWeek"];
  start_time: string;
  end_time: string;
  room: string;
}

export const CLASS_COLUMNS =
  "id,course_code,course_title,section,class_type,units,term,mini_term,instructor_id,join_code,created_at,updated_at";

export function mapClassRow(row: ClassRow, schedule: ScheduleBlock[]): AcademicClass {
  return {
    id: row.id,
    courseCode: row.course_code,
    courseTitle: row.course_title,
    section: row.section,
    classType: row.class_type,
    units: Number(row.units),
    term: row.term,
    miniTerm: row.mini_term ?? undefined,
    instructorId: row.instructor_id,
    joinCode: row.join_code,
    schedule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Loads the classes visible to the signed-in account. RLS returns the classes
 * the user teaches, is enrolled in, or (for admins) all classes.
 */
export async function listVisibleClasses(
  client: SupabaseClient,
  forceRefresh: boolean = false
): Promise<AcademicClass[]> {
  return appCache.fetchWithCache(
    "visible_classes",
    async () => {
      const { data, error } = await client
        .from("classes")
        .select(`${CLASS_COLUMNS}, class_schedules(day_of_week,start_time,end_time,room)`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((raw) => {
        const row = raw as ClassRow & { class_schedules?: ScheduleRow[] };
        const rows = row.class_schedules ?? [];
        const schedule: ScheduleBlock[] = rows.map((b) => ({
          dayOfWeek: b.day_of_week,
          startTime: b.start_time,
          endTime: b.end_time,
          room: b.room,
        }));
        return mapClassRow(row, schedule);
      });
    },
    { ttlMs: 30_000, tags: ["classes"], forceRefresh }
  );
}

export interface CreateClassInput {
  courseCode: string;
  courseTitle: string;
  section: string;
  classType: ClassType;
  units: number;
  term: string;
  miniTerm?: string;
  joinCode: string;
  schedule: ScheduleBlock[];
}

export async function createClass(
  client: SupabaseClient,
  instructorId: string,
  input: CreateClassInput
): Promise<AcademicClass> {
  const { data, error } = await client
    .from("classes")
    .insert({
      course_code: input.courseCode,
      course_title: input.courseTitle,
      section: input.section,
      class_type: input.classType,
      units: input.units,
      term: input.term,
      mini_term: input.miniTerm ?? null,
      instructor_id: instructorId,
      join_code: input.joinCode,
    })
    .select(CLASS_COLUMNS)
    .single();

  if (error) throw error;
  const row = data as ClassRow;

  if (input.schedule.length > 0) {
    const { error: scheduleError } = await client.from("class_schedules").insert(
      input.schedule.map((block) => ({
        class_id: row.id,
        day_of_week: block.dayOfWeek,
        start_time: block.startTime,
        end_time: block.endTime,
        room: block.room,
      }))
    );
    if (scheduleError) throw scheduleError;
  }

  // Every class gets a configurable policy row (never hardcoded rules).
  await client.from("class_policies").insert({ class_id: row.id });

  appCache.invalidateTag("classes");
  return mapClassRow(row, input.schedule);
}

/**
 * Finds a class by its 6-character join code (used by student enrolment).
 * Runs through a security-definer RPC because the applicant is not yet a class
 * member and the plain select policy would otherwise hide the row.
 */
export async function findClassByJoinCode(
  client: SupabaseClient,
  joinCode: string
): Promise<AcademicClass | null> {
  const { data, error } = await client.rpc("lookup_class_by_join_code", {
    p_code: joinCode,
  });

  if (error) throw error;
  const rows = (data as ClassRow[] | null) ?? [];
  return rows.length > 0 ? mapClassRow(rows[0], []) : null;
}
