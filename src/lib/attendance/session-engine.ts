import type {
  AttendanceRecord,
  AttendanceStatus,
  ExcuseRequest,
  ScheduleBlock,
  SessionType,
} from "../../types/index.ts";

const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Automatically generates school date strings (YYYY-MM-DD) within a date range
 * matching the class's weekly schedule days (e.g., Monday and Wednesday).
 */
export function generateScheduleDates(
  schedule: ScheduleBlock[],
  startDate: string,
  endDate: string
): string[] {
  const targetDays = new Set(schedule.map((block) => DAY_MAP[block.dayOfWeek]));
  const results: string[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Use UTC dates to avoid timezone daylight shifts
  const current = new Date(start);

  while (current <= end) {
    if (targetDays.has(current.getDay())) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      results.push(`${year}-${month}-${day}`);
    }
    current.setDate(current.getDate() + 1);
  }

  return results.sort();
}

/**
 * Institutional policy rule: Holiday, Suspended, or Instructor Self-Absence
 * are non-penalizing sessions and are exempt from student FDA computations.
 */
export function isSessionExemptFromFDA(type: SessionType): boolean {
  return (
    type === "holiday" ||
    type === "suspended" ||
    type === "instructor_absence"
  );
}

export interface SessionAttendanceCalculation {
  totalRecords: number;
  present: number;
  late: number;
  excused: number;
  absent: number;
  effectiveAbsences: number;
  exemptSessionsCount: number;
  isWarning: boolean;
  isFDA: boolean;
}

/**
 * Computes institutional effective absences taking into account exempt session types.
 */
export function calculateEffectiveAbsencesWithSessions(
  records: { status: AttendanceStatus; sessionType: SessionType }[],
  maxThreshold: number = 4
): SessionAttendanceCalculation {
  let present = 0;
  let late = 0;
  let excused = 0;
  let absent = 0;
  let exemptSessionsCount = 0;

  for (const item of records) {
    if (isSessionExemptFromFDA(item.sessionType)) {
      exemptSessionsCount++;
      continue;
    }

    if (item.status === "P") present++;
    else if (item.status === "L") late++;
    else if (item.status === "E") excused++;
    else if (item.status === "A") absent++;
  }

  const effectiveAbsences = Math.floor(late / 3) + absent;
  const isWarning =
    effectiveAbsences >= Math.max(1, maxThreshold - 1) &&
    effectiveAbsences < maxThreshold;
  const isFDA = effectiveAbsences >= maxThreshold;

  return {
    totalRecords: records.length,
    present,
    late,
    excused,
    absent,
    effectiveAbsences,
    exemptSessionsCount,
    isWarning,
    isFDA,
  };
}

/**
 * Excuse Slip Approval Workflow:
 * Switches the student's attendance cell for the requested date to Excused (E),
 * attaches the submitted document link (medical cert/excuse letter), and marks the request as approved.
 */
export function resolveExcuseSlipApproval(
  request: ExcuseRequest,
  existingRecords: AttendanceRecord[]
): { updatedRecord: AttendanceRecord; updatedRequest: ExcuseRequest } {
  const existing = existingRecords.find(
    (r) =>
      r.classId === request.classId &&
      r.studentId === request.studentId &&
      r.date === request.date
  );

  const updatedRecord: AttendanceRecord = {
    id: existing?.id || `att_${request.classId}_${request.studentId}_${request.date}`,
    classId: request.classId,
    studentId: request.studentId,
    date: request.date,
    status: "E",
    documentUrl: request.documentUrl,
    note: request.reason ? `Approved Excuse: ${request.reason}` : "Approved Excuse Slip",
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  const updatedRequest: ExcuseRequest = {
    ...request,
    status: "approved",
    resolvedAt: new Date().toISOString(),
  };

  return { updatedRecord, updatedRequest };
}

/**
 * Excuse Slip Decline Workflow:
 * Retains existing attendance status (usually Absent or Late), records instructor's reason for decline.
 */
export function resolveExcuseSlipDecline(
  request: ExcuseRequest,
  rejectionReason: string
): ExcuseRequest {
  return {
    ...request,
    status: "declined",
    rejectionReason,
    resolvedAt: new Date().toISOString(),
  };
}
