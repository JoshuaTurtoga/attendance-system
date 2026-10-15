import test from "node:test";
import assert from "node:assert/strict";
import {
  generateScheduleDates,
  isSessionExemptFromFDA,
  calculateEffectiveAbsencesWithSessions,
  resolveExcuseSlipApproval,
  resolveExcuseSlipDecline,
} from "../src/lib/attendance/session-engine.ts";
import type { ScheduleBlock, AttendanceRecord, ExcuseRequest, SessionType } from "../src/types/index.ts";

test("Session Engine: generateScheduleDates produces correct dates based on weekly schedule", () => {
  const schedule: ScheduleBlock[] = [
    { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Room 402" },
    { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:30", room: "Room 402" },
  ];

  // Range: 2 weeks (2026-10-05 to 2026-10-18)
  // Mon 2026-10-05, Wed 2026-10-07, Mon 2026-10-12, Wed 2026-10-14
  const dates = generateScheduleDates(schedule, "2026-10-05", "2026-10-18");

  assert.equal(dates.length, 4);
  assert.deepEqual(dates, [
    "2026-10-05",
    "2026-10-07",
    "2026-10-12",
    "2026-10-14",
  ]);
});

test("Session Engine: isSessionExemptFromFDA identifies non-penalizing session types", () => {
  assert.equal(isSessionExemptFromFDA("regular"), false);
  assert.equal(isSessionExemptFromFDA("makeup"), false);
  assert.equal(isSessionExemptFromFDA("holiday"), true);
  assert.equal(isSessionExemptFromFDA("suspended"), true);
  assert.equal(isSessionExemptFromFDA("instructor_absence"), true);
});

test("Session Engine: calculateEffectiveAbsencesWithSessions ignores absences on exempt session dates", () => {
  const sessionRecords = [
    { status: "A" as const, sessionType: "regular" as SessionType }, // 1 absence
    { status: "A" as const, sessionType: "instructor_absence" as SessionType }, // exempt! faculty absent
    { status: "A" as const, sessionType: "holiday" as SessionType }, // exempt! holiday
    { status: "L" as const, sessionType: "regular" as SessionType }, // 1 late
    { status: "L" as const, sessionType: "regular" as SessionType }, // 2 lates
    { status: "L" as const, sessionType: "regular" as SessionType }, // 3 lates -> +1 absence
    { status: "E" as const, sessionType: "regular" as SessionType }, // excused -> 0 penalty
  ];

  const result = calculateEffectiveAbsencesWithSessions(sessionRecords);
  // Total non-exempt: 1 unexcused absence + (3 lates / 3 = 1) = 2 effective absences
  assert.equal(result.effectiveAbsences, 2);
  assert.equal(result.exemptSessionsCount, 2);
  assert.equal(result.isFDA, false); // threshold default 4
});

test("Session Engine: resolveExcuseSlipApproval converts attendance cell to Excused (E) and attaches document link", () => {
  const excuse: ExcuseRequest = {
    id: "exc_01",
    classId: "cls_01",
    studentId: "stud_05",
    studentName: "Gabriel Zubiri",
    studentNumber: "2024-10319",
    date: "2026-10-09",
    reason: "Hospitalization for acute viral infection",
    documentUrl: "https://university.edu/storage/med_cert_zubiri.pdf",
    status: "pending",
    submittedAt: "2026-10-10T08:00:00Z",
  };

  const existingRecords: AttendanceRecord[] = [
    {
      id: "att_01",
      classId: "cls_01",
      studentId: "stud_05",
      date: "2026-10-09",
      status: "A",
      note: "Unnotified absence",
      createdAt: "2026-10-09T09:00:00Z",
    },
  ];

  const { updatedRecord, updatedRequest } = resolveExcuseSlipApproval(excuse, existingRecords);

  // Status must be converted to Excused (E)
  assert.equal(updatedRecord.status, "E");
  assert.equal(updatedRecord.documentUrl, "https://university.edu/storage/med_cert_zubiri.pdf");
  assert.ok(updatedRecord.note?.includes("Hospitalization"));

  // Request must be marked approved
  assert.equal(updatedRequest.status, "approved");
  assert.ok(updatedRequest.resolvedAt);
});

test("Session Engine: resolveExcuseSlipDecline marks request as declined with reason and retains original record", () => {
  const excuse: ExcuseRequest = {
    id: "exc_02",
    classId: "cls_01",
    studentId: "stud_03",
    studentName: "Marcus Chen",
    studentNumber: "2024-10492",
    date: "2026-10-14",
    reason: "Woke up late due to heavy rain",
    status: "pending",
    submittedAt: "2026-10-14T10:00:00Z",
  };

  const declined = resolveExcuseSlipDecline(excuse, "Non-valid medical/emergency reason per university policy");

  assert.equal(declined.status, "declined");
  assert.equal(declined.rejectionReason, "Non-valid medical/emergency reason per university policy");
  assert.ok(declined.resolvedAt);
});
