import type { AttendanceStatus } from "../../types/index.ts";

export type { AttendanceStatus };

export interface AttendanceMetrics {
  totalSessions: number;
  present: number;
  late: number;
  excused: number;
  absent: number;
  effectiveAbsences: number;
  isWarning: boolean;
  isFDA: boolean; // Failure Due to Absences
}

/**
 * Institutional attendance metrics calculation (DOCUMENTATION.md § 4.B.TAB 2):
 * - Statuses: Present (P), Late (L), Excused (E), Absent (A)
 * - Conversion ratio: 3 Lates = 1 Unexcused Absence
 * - Excused absences are tracked but do NOT penalize towards FDA
 * - FDA threshold: Reaching maxAbsenceThreshold marks student as FDA
 */
export function calculateAttendanceMetrics(
  records: AttendanceStatus[],
  maxAbsenceThreshold: number = 4
): AttendanceMetrics {
  let present = 0;
  let late = 0;
  let excused = 0;
  let absent = 0;

  for (const status of records) {
    if (status === "P") present++;
    else if (status === "L") late++;
    else if (status === "E") excused++;
    else if (status === "A") absent++;
  }

  // 3 Lates = 1 unexcused absence
  const effectiveAbsences = Math.floor(late / 3) + absent;
  const isWarning = effectiveAbsences >= Math.max(1, maxAbsenceThreshold - 1) && effectiveAbsences < maxAbsenceThreshold;
  const isFDA = effectiveAbsences >= maxAbsenceThreshold;

  return {
    totalSessions: records.length,
    present,
    late,
    excused,
    absent,
    effectiveAbsences,
    isWarning,
    isFDA,
  };
}

/**
 * Generates an uppercase 6-character alphanumeric class join code,
 * omitting visually ambiguous characters (0, O, 1, I).
 */
export function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}
