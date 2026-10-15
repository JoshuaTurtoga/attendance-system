import test from "node:test";
import assert from "node:assert/strict";
import {
  createRollCallSession,
  recordStudentStatus,
  handleRollCallHotkey,
  advanceRollCallIndex,
  jumpToRollCallIndex,
  updateStudentNote,
  computeRollCallSummary,
  finalizeRollCallSession,
} from "../src/lib/attendance/roll-call-engine.ts";
import type { RosterStudent } from "../src/types/index.ts";

const mockStudents: RosterStudent[] = [
  {
    id: "stu_01",
    classId: "cls_01",
    studentNumber: "2024-10492",
    lastName: "Chen",
    firstName: "Marcus",
    middleInitial: "L.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stu_02",
    classId: "cls_01",
    studentNumber: "2024-10821",
    lastName: "Aquino",
    firstName: "Sofia",
    middleInitial: "R.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stu_03",
    classId: "cls_01",
    studentNumber: "2024-10319",
    lastName: "Zubiri",
    firstName: "Gabriel",
    middleInitial: "K.",
    program: "BSIT",
    academicLevel: "2nd Year",
  },
];

test("Roll-Call Engine: createRollCallSession sorts students alphabetically and initializes state", () => {
  const session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");

  assert.equal(session.classId, "cls_01");
  assert.equal(session.date, "2026-10-16");
  assert.equal(session.currentIndex, 0);
  assert.equal(session.isComplete, false);
  assert.equal(session.items.length, 3);

  // Alphabetical sort: Aquino (#1), Chen (#2), Zubiri (#3)
  assert.equal(session.items[0].student.lastName, "Aquino");
  assert.equal(session.items[1].student.lastName, "Chen");
  assert.equal(session.items[2].student.lastName, "Zubiri");

  // Initial statuses should be null
  assert.equal(session.items[0].status, null);
  assert.equal(session.items[0].note, "");
});

test("Roll-Call Engine: recordStudentStatus updates status and note immutably", () => {
  const session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");
  const updated = recordStudentStatus(session, 0, "P", "On time");

  // Original state is not mutated
  assert.equal(session.items[0].status, null);

  // Updated state has status and note
  assert.equal(updated.items[0].status, "P");
  assert.equal(updated.items[0].note, "On time");
  assert.ok(updated.items[0].markedAt);
});

test("Roll-Call Engine: handleRollCallHotkey handles P, L, E, A (case-insensitive) and auto-advances", () => {
  let session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");

  // Pressing 'p' marks first student (Aquino) as Present and moves index to 1
  session = handleRollCallHotkey(session, "p");
  assert.equal(session.items[0].status, "P");
  assert.equal(session.currentIndex, 1);

  // Pressing 'L' marks second student (Chen) as Late and moves index to 2
  session = handleRollCallHotkey(session, "L");
  assert.equal(session.items[1].status, "L");
  assert.equal(session.currentIndex, 2);

  // Pressing 'a' marks third student (Zubiri) as Absent
  session = handleRollCallHotkey(session, "a");
  assert.equal(session.items[2].status, "A");
  // Once at end, index stays at last item and isComplete is true
  assert.equal(session.currentIndex, 2);
  assert.equal(session.isComplete, true);

  // Unrecognized key returns state without error
  const unchanged = handleRollCallHotkey(session, "x");
  assert.equal(unchanged, session);
});

test("Roll-Call Engine: navigation advanceRollCallIndex and jumpToRollCallIndex", () => {
  let session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");
  assert.equal(session.currentIndex, 0);

  // Advance next
  session = advanceRollCallIndex(session, "next");
  assert.equal(session.currentIndex, 1);

  // Advance next
  session = advanceRollCallIndex(session, "next");
  assert.equal(session.currentIndex, 2);

  // Advance next at boundary stays at 2
  session = advanceRollCallIndex(session, "next");
  assert.equal(session.currentIndex, 2);

  // Advance prev
  session = advanceRollCallIndex(session, "prev");
  assert.equal(session.currentIndex, 1);

  // Jump to index 0
  session = jumpToRollCallIndex(session, 0);
  assert.equal(session.currentIndex, 0);

  // Out of bound jump clamps safely
  session = jumpToRollCallIndex(session, 999);
  assert.equal(session.currentIndex, 2);

  session = jumpToRollCallIndex(session, -5);
  assert.equal(session.currentIndex, 0);
});

test("Roll-Call Engine: updateStudentNote updates note for target index", () => {
  let session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");
  session = updateStudentNote(session, 1, "Submitted medical certificate");

  assert.equal(session.items[1].note, "Submitted medical certificate");
  assert.equal(session.items[0].note, "");
});

test("Roll-Call Engine: computeRollCallSummary calculates statistics and percentages", () => {
  let session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");

  let summary = computeRollCallSummary(session);
  assert.equal(summary.total, 3);
  assert.equal(summary.marked, 0);
  assert.equal(summary.remaining, 3);
  assert.equal(summary.percentage, 0);

  // Mark 1 present, 1 late
  session = recordStudentStatus(session, 0, "P");
  session = recordStudentStatus(session, 1, "L");

  summary = computeRollCallSummary(session);
  assert.equal(summary.total, 3);
  assert.equal(summary.marked, 2);
  assert.equal(summary.remaining, 1);
  assert.equal(summary.percentage, 67); // 2/3 = 66.67% -> 67%
  assert.equal(summary.presentCount, 1);
  assert.equal(summary.lateCount, 1);
  assert.equal(summary.excusedCount, 0);
  assert.equal(summary.absentCount, 0);

  // Mark 3rd excused
  session = recordStudentStatus(session, 2, "E");
  summary = computeRollCallSummary(session);
  assert.equal(summary.marked, 3);
  assert.equal(summary.remaining, 0);
  assert.equal(summary.percentage, 100);
  assert.equal(summary.excusedCount, 1);
});

test("Roll-Call Engine: finalizeRollCallSession exports standard AttendanceRecord array", () => {
  let session = createRollCallSession(mockStudents, "cls_01", "2026-10-16");
  session = recordStudentStatus(session, 0, "P");
  session = recordStudentStatus(session, 1, "L", "Tardy 15 mins");
  session = recordStudentStatus(session, 2, "A", "Unnotified absence");

  const records = finalizeRollCallSession(session);
  assert.equal(records.length, 3);

  assert.equal(records[0].studentId, "stu_02"); // Aquino
  assert.equal(records[0].status, "P");
  assert.equal(records[0].classId, "cls_01");
  assert.equal(records[0].date, "2026-10-16");

  assert.equal(records[1].studentId, "stu_01"); // Chen
  assert.equal(records[1].status, "L");
  assert.equal(records[1].note, "Tardy 15 mins");

  assert.equal(records[2].studentId, "stu_03"); // Zubiri
  assert.equal(records[2].status, "A");
  assert.equal(records[2].note, "Unnotified absence");
});
