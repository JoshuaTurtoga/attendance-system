import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassSession,
  GradeItem,
  RosterStudent,
  StudentGrade,
} from "../../types/index.ts";

export interface CrossModuleDiscrepancy {
  studentId: string;
  studentName: string;
  studentNumber: string;
  date: string;
  type: "SCORE_WHILE_ABSENT" | "MISSING_GRADE_WHILE_PRESENT";
  message: string;
  severity: "warning" | "error";
  activityTitle?: string;
  score?: number | null;
  attendanceStatus?: AttendanceStatus;
}

export interface DetectDiscrepanciesParams {
  date: string;
  students: RosterStudent[];
  attendanceRecords: AttendanceRecord[];
  gradeItems: GradeItem[];
  studentGrades: StudentGrade[];
}

/**
 * Detects discrepancies between recorded attendance and graded activities on the same date.
 * Flag 1: Student is marked Absent ('A'), but has a recorded score on an assessment.
 */
export function detectCrossModuleDiscrepancies(
  params: DetectDiscrepanciesParams
): CrossModuleDiscrepancy[] {
  const { date, students, attendanceRecords, gradeItems, studentGrades } = params;
  const discrepancies: CrossModuleDiscrepancy[] = [];

  const itemsOnDate = gradeItems.filter((gi) => gi.date === date);
  if (itemsOnDate.length === 0) return discrepancies;

  const attendanceMap = new Map<string, AttendanceRecord>();
  attendanceRecords
    .filter((a) => a.date === date)
    .forEach((a) => attendanceMap.set(a.studentId, a));

  for (const student of students) {
    const attendance = attendanceMap.get(student.id);
    const fullName = `${student.lastName}, ${student.firstName}`;

    for (const item of itemsOnDate) {
      const grade = studentGrades.find(
        (g) => g.gradeItemId === item.id && g.studentId === student.id
      );

      const hasNumericalScore =
        grade !== undefined && grade.score !== null && grade.score !== undefined;

      // Discrepancy: Marked Absent ('A') on attendance sheet, but earned a score on activity
      if (attendance?.status === "A" && hasNumericalScore) {
        discrepancies.push({
          studentId: student.id,
          studentName: fullName,
          studentNumber: student.studentNumber,
          date,
          type: "SCORE_WHILE_ABSENT",
          activityTitle: item.title,
          score: grade.score,
          attendanceStatus: "A",
          severity: "warning",
          message: `${fullName} (${student.studentNumber}) was marked Absent on ${date}, but has an earned score of ${grade.score}/${item.maxScore} for "${item.title}".`,
        });
      }
    }
  }

  return discrepancies;
}

export interface ScenarioASkipParams {
  students: RosterStudent[];
  date: string;
  attendanceRecords: AttendanceRecord[];
}

export interface ScenarioASkipResult {
  eligibleStudents: RosterStudent[];
  skippedStudents: RosterStudent[];
  skipReason: string;
}

/**
 * Scenario A: When today's attendance has already been taken,
 * automatically skips absent students ('A') during the rapid grading spotlight glide.
 */
export function executeScenarioASkip(
  params: ScenarioASkipParams
): ScenarioASkipResult {
  const { students, date, attendanceRecords } = params;

  const attendanceOnDate = attendanceRecords.filter((a) => a.date === date);
  const absentStudentIds = new Set(
    attendanceOnDate.filter((a) => a.status === "A").map((a) => a.studentId)
  );

  const eligibleStudents = students.filter((s) => !absentStudentIds.has(s.id));
  const skippedStudents = students.filter((s) => absentStudentIds.has(s.id));

  const count = skippedStudents.length;
  const skipReason =
    count > 0
      ? `Scenario A: ${count} absent ${count === 1 ? "student" : "students"} automatically skipped`
      : "Scenario A: All students present or no absentees";

  return {
    eligibleStudents,
    skippedStudents,
    skipReason,
  };
}

export interface ScenarioBSyncParams {
  classId: string;
  date: string;
  activityName: string;
  students: RosterStudent[];
  gradeItem: GradeItem;
  studentGrades: StudentGrade[];
  existingSessions: ClassSession[];
  existingAttendance: AttendanceRecord[];
}

export interface ScenarioBSyncResult {
  updatedSessions: ClassSession[];
  updatedAttendance: AttendanceRecord[];
  createdSession: ClassSession;
  explicitNotice: string;
  stats: {
    presentCount: number;
    absentCount: number;
  };
}

export const SCENARIO_B_EXPLICIT_NOTICE =
  "Explicit System Notice: Auto-generation only assigns Present (P) to students with numerical scores and Absent (A) to missing assessments. Any Late (L) or Excused (E) statuses must be adjusted manually.";

/**
 * Scenario B: When no attendance has been recorded yet for today's session,
 * auto-generates attendance from student grades recorded for today.
 * Scored students -> Present ('P')
 * Missing students -> Absent ('A')
 */
export function executeScenarioBSync(
  params: ScenarioBSyncParams
): ScenarioBSyncResult {
  const {
    classId,
    date,
    activityName,
    students,
    gradeItem,
    studentGrades,
    existingSessions,
    existingAttendance,
  } = params;

  // 1. Find or create class session for date
  let session = existingSessions.find((s) => s.date === date);
  const updatedSessions = [...existingSessions];

  if (!session) {
    session = {
      id: `session-auto-${date}-${Date.now()}`,
      classId,
      date,
      type: "regular",
      title: `${activityName} Evaluation`,
    };
    updatedSessions.push(session);
    updatedSessions.sort((a, b) => a.date.localeCompare(b.date));
  }

  // 2. Map student scores to Present ('P') or Absent ('A')
  const updatedAttendance = [...existingAttendance.filter((a) => a.date !== date)];
  let presentCount = 0;
  let absentCount = 0;

  for (const student of students) {
    const grade = studentGrades.find(
      (g) => g.gradeItemId === gradeItem.id && g.studentId === student.id
    );

    // Any numerical score (including 0) indicates student took the test -> 'P'
    // Missing (null or undefined) indicates missed assessment -> 'A'
    const isPresent =
      grade !== undefined && grade.score !== null && grade.score !== undefined;

    const status: AttendanceStatus = isPresent ? "P" : "A";
    if (isPresent) {
      presentCount++;
    } else {
      absentCount++;
    }

    updatedAttendance.push({
      id: `att-sync-${date}-${student.id}`,
      classId,
      studentId: student.id,
      date,
      status,
      note: isPresent
        ? `Auto-synced from ${gradeItem.title} (Score: ${grade.score}/${gradeItem.maxScore})`
        : `Auto-synced: Missed ${gradeItem.title}`,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    updatedSessions,
    updatedAttendance,
    createdSession: session,
    explicitNotice: SCENARIO_B_EXPLICIT_NOTICE,
    stats: {
      presentCount,
      absentCount,
    },
  };
}
