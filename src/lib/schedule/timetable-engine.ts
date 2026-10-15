import type { AcademicClass, ScheduleBlock } from "../../types/index.ts";

export type DayOfWeek = ScheduleBlock["dayOfWeek"];

export const WEEKDAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface ScheduledClassItem {
  class: AcademicClass;
  block: ScheduleBlock;
}

/**
 * Parses "HH:MM" 24-hour string into integer minutes since midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Computes duration in minutes between start and end time.
 */
export function computeClassDurationMinutes(startTime: string, endTime: string): number {
  return Math.max(0, parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime));
}

/**
 * Filters all classes that meet on the given day and sorts them chronologically by start time.
 */
export function filterClassesForDay(
  classes: AcademicClass[],
  day: DayOfWeek
): ScheduledClassItem[] {
  const items: ScheduledClassItem[] = [];

  for (const cls of classes) {
    for (const block of cls.schedule) {
      if (block.dayOfWeek === day) {
        items.push({ class: cls, block });
      }
    }
  }

  return items.sort(
    (a, b) =>
      parseTimeToMinutes(a.block.startTime) - parseTimeToMinutes(b.block.startTime)
  );
}

/**
 * Detects whether a candidate schedule block collides in time with any existing blocks.
 * Returns the conflicting block if found, otherwise null.
 */
export function detectScheduleConflict(
  existingBlocks: ScheduleBlock[],
  candidate: ScheduleBlock
): ScheduleBlock | null {
  const candStart = parseTimeToMinutes(candidate.startTime);
  const candEnd = parseTimeToMinutes(candidate.endTime);

  for (const existing of existingBlocks) {
    if (existing.dayOfWeek !== candidate.dayOfWeek) {
      continue;
    }

    const exStart = parseTimeToMinutes(existing.startTime);
    const exEnd = parseTimeToMinutes(existing.endTime);

    // Overlap condition: start < otherEnd && end > otherStart
    if (candStart < exEnd && candEnd > exStart) {
      return existing;
    }
  }

  return null;
}

/**
 * Formats "13:30" to "1:30 PM"
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return time24;
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
