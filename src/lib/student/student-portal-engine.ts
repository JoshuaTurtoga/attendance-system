import type {
  AcademicClass,
  AttendanceRecord,
  AttendanceStatus,
  ExcuseRequest,
  GradeItem,
  StudentGrade,
} from "../../types/index.ts";
import {
  calculateCategoryScore,
  calculateStudentStanding,
} from "../grades/gradebook-engine.ts";
import { calculateAttendanceMetrics } from "../attendance/attendance-engine.ts";

export interface StudentAttendanceSummary {
  totalSessions: number;
  present: number;
  late: number;
  excused: number;
  absent: number;
  effectiveAbsences: number;
  fdaStanding: "SAFE" | "WARNING" | "FDA_RISK";
  attendanceRate: number;
}

export interface StudentGradesSummary {
  quizScore: { earned: number; totalMax: number; percentage: number | null };
  ptScore: { earned: number; totalMax: number; percentage: number | null };
  examScore: { earned: number; totalMax: number; percentage: number | null };
  finalGrade: number | null;
  letterGrade: string;
  isPassing: boolean;
}

export interface StudentPersonalSummary {
  studentId: string;
  classId: string;
  attendance: StudentAttendanceSummary;
  grades: StudentGradesSummary;
}

export interface ComputeSummaryParams {
  studentId: string;
  classId: string;
  attendanceRecords: AttendanceRecord[];
  gradeItems: GradeItem[];
  studentGrades: StudentGrade[];
  maxAbsenceThreshold?: number;
}

/**
 * Computes an individual student's real-time academic standing in an isolated enrolled class.
 */
export function computeStudentPersonalSummary(
  params: ComputeSummaryParams
): StudentPersonalSummary {
  const {
    studentId,
    classId,
    attendanceRecords,
    gradeItems,
    studentGrades,
    maxAbsenceThreshold = 4,
  } = params;

  // Filter records for this student and class
  const studentAttendance = attendanceRecords.filter(
    (a) => a.studentId === studentId && a.classId === classId
  );
  const classGradeItems = gradeItems.filter((g) => g.classId === classId);
  const studentGradesList = studentGrades.filter((g) => g.studentId === studentId);

  // 1. Attendance Metrics
  const metrics = calculateAttendanceMetrics(
    studentAttendance.map((a) => a.status),
    maxAbsenceThreshold
  );

  const fdaStanding: "SAFE" | "WARNING" | "FDA_RISK" = metrics.isFDA
    ? "FDA_RISK"
    : metrics.isWarning
    ? "WARNING"
    : "SAFE";

  const totalRecorded = metrics.present + metrics.late + metrics.excused + metrics.absent;
  const attendanceRate =
    totalRecorded > 0 ? Math.round(((metrics.present + metrics.late * 0.5) / totalRecorded) * 100) : 100;

  // 2. Grade Standing Metrics
  const quizScore = calculateCategoryScore(
    classGradeItems,
    studentGradesList,
    studentId,
    "quiz"
  );
  const ptScore = calculateCategoryScore(
    classGradeItems,
    studentGradesList,
    studentId,
    "performance_task"
  );
  const examScore = calculateCategoryScore(
    classGradeItems,
    studentGradesList,
    studentId,
    "exam"
  );

  const standing = calculateStudentStanding(
    classGradeItems,
    studentGradesList,
    studentId
  );

  return {
    studentId,
    classId,
    attendance: {
      totalSessions: metrics.totalSessions,
      present: metrics.present,
      late: metrics.late,
      excused: metrics.excused,
      absent: metrics.absent,
      effectiveAbsences: metrics.effectiveAbsences,
      fdaStanding,
      attendanceRate,
    },
    grades: {
      quizScore,
      ptScore,
      examScore,
      finalGrade: standing.finalGrade,
      letterGrade: standing.letterGrade,
      isPassing: standing.isPassing,
    },
  };
}

export interface ValidateExcuseParams {
  studentId: string;
  studentName: string;
  studentNumber: string;
  classId: string;
  date: string;
  reason: string;
  documentUrl?: string;
  attendanceStatus?: AttendanceStatus;
}

export interface ValidateExcuseResult {
  valid: boolean;
  error?: string;
  request?: ExcuseRequest;
}

/**
 * Validates and formats an excuse slip submission from a student.
 * Blocks excuse submissions for sessions where the student was marked Present.
 */
export function validateExcuseSubmission(
  params: ValidateExcuseParams
): ValidateExcuseResult {
  const {
    studentId,
    studentName,
    studentNumber,
    classId,
    date,
    reason,
    documentUrl,
    attendanceStatus,
  } = params;

  if (attendanceStatus === "P") {
    return {
      valid: false,
      error: "Cannot file excuse for a session marked Present (P).",
    };
  }

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 5) {
    return {
      valid: false,
      error: "Reason must be at least 5 characters describing the absence.",
    };
  }

  const request: ExcuseRequest = {
    id: `exc_${Date.now()}_${studentId}`,
    classId,
    studentId,
    studentName,
    studentNumber,
    date,
    reason: trimmedReason,
    documentUrl: documentUrl?.trim() || undefined,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  return {
    valid: true,
    request,
  };
}

export interface ExternalSubject {
  id: string;
  title: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room: string;
  color?: string;
}

export interface MergedTimetableItem {
  id: string;
  classId?: string;
  title: string;
  code?: string;
  section?: string;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isExternal: boolean;
  color?: string;
}

/**
 * Merges official university enrolled classes and student-added external classes
 * into a single unified weekly schedule.
 */
export function mergeStudentTimetable(
  enrolledClasses: AcademicClass[],
  externalSubjects: ExternalSubject[]
): MergedTimetableItem[] {
  const items: MergedTimetableItem[] = [];

  // 1. Add enrolled university classes
  for (const cls of enrolledClasses) {
    for (const block of cls.schedule) {
      items.push({
        id: `${cls.id}_${block.dayOfWeek}_${block.startTime}`,
        classId: cls.id,
        title: cls.courseTitle,
        code: cls.courseCode,
        section: cls.section,
        room: block.room,
        dayOfWeek: block.dayOfWeek,
        startTime: block.startTime,
        endTime: block.endTime,
        isExternal: false,
      });
    }
  }

  // 2. Add manual external subjects
  for (const ext of externalSubjects) {
    items.push({
      id: ext.id,
      title: ext.title,
      room: ext.room,
      dayOfWeek: ext.dayOfWeek,
      startTime: ext.startTime,
      endTime: ext.endTime,
      isExternal: true,
      color: ext.color || "#059669",
    });
  }

  // Sort by day and startTime
  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  return items.sort((a, b) => {
    const dayDiff = (dayOrder[a.dayOfWeek] || 0) - (dayOrder[b.dayOfWeek] || 0);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}
