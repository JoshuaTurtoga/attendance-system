import test from "node:test";
import assert from "node:assert/strict";
import type {
  AttendanceRecord,
  ClassSession,
  GradeItem,
  RosterStudent,
  StudentGrade,
} from "../src/types/index.ts";
import {
  detectCrossModuleDiscrepancies,
  executeScenarioBSync,
  executeScenarioASkip,
} from "../src/lib/sync/cross-module-sync.ts";
import { generateMultiSheetExcelXml } from "../src/lib/export/excel-export.ts";

const mockStudents: RosterStudent[] = [
  {
    id: "s1",
    classId: "c1",
    studentNumber: "2024-0001",
    lastName: "Aquino",
    firstName: "Maria",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "s2",
    classId: "c1",
    studentNumber: "2024-0002",
    lastName: "Cruz",
    firstName: "Juan",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "s3",
    classId: "c1",
    studentNumber: "2024-0003",
    lastName: "Dela Cruz",
    firstName: "Ana",
    program: "BSIT",
    academicLevel: "2nd Year",
  },
];

const mockGradeItem: GradeItem = {
  id: "gi-today",
  classId: "c1",
  category: "quiz",
  title: "Quiz 3 - State Coordination",
  maxScore: 30,
  weightPercentage: 25,
  date: "2026-10-15",
};

test("Cross-Module Sync: detectCrossModuleDiscrepancies flags score recorded for absent student", () => {
  const attendance: AttendanceRecord[] = [
    {
      id: "a1",
      classId: "c1",
      studentId: "s1",
      date: "2026-10-15",
      status: "A",
      createdAt: "2026-10-15T08:00:00Z",
    },
    {
      id: "a2",
      classId: "c1",
      studentId: "s2",
      date: "2026-10-15",
      status: "P",
      createdAt: "2026-10-15T08:00:00Z",
    },
  ];

  const grades: StudentGrade[] = [
    {
      id: "g1",
      gradeItemId: "gi-today",
      studentId: "s1",
      score: 28, // Conflict: marked absent on attendance, but scored 28 on quiz!
    },
    {
      id: "g2",
      gradeItemId: "gi-today",
      studentId: "s2",
      score: 25,
    },
  ];

  const discrepancies = detectCrossModuleDiscrepancies({
    date: "2026-10-15",
    students: mockStudents,
    attendanceRecords: attendance,
    gradeItems: [mockGradeItem],
    studentGrades: grades,
  });

  assert.equal(discrepancies.length, 1);
  assert.equal(discrepancies[0].studentId, "s1");
  assert.equal(discrepancies[0].type, "SCORE_WHILE_ABSENT");
  assert.ok(discrepancies[0].message.includes("Aquino"));
  assert.ok(discrepancies[0].message.includes("marked Absent"));
});

test("Cross-Module Sync: executeScenarioBSync auto-generates attendance from grades with explicit notice", () => {
  const grades: StudentGrade[] = [
    {
      id: "g1",
      gradeItemId: "gi-today",
      studentId: "s1",
      score: 25,
    },
    {
      id: "g2",
      gradeItemId: "gi-today",
      studentId: "s2",
      score: null, // missing assessment -> should be Absent
    },
    {
      id: "g3",
      gradeItemId: "gi-today",
      studentId: "s3",
      score: 0, // zero is a real numerical score -> should be Present!
    },
  ];

  const existingSessions: ClassSession[] = [];
  const existingAttendance: AttendanceRecord[] = [];

  const result = executeScenarioBSync({
    classId: "c1",
    date: "2026-10-15",
    activityName: "Quiz 3",
    students: mockStudents,
    gradeItem: mockGradeItem,
    studentGrades: grades,
    existingSessions,
    existingAttendance,
  });

  // Verify created session
  assert.equal(result.updatedSessions.length, 1);
  assert.equal(result.updatedSessions[0].date, "2026-10-15");
  assert.equal(result.updatedSessions[0].title, "Quiz 3 Evaluation");

  // Verify attendance mapping
  const s1Record = result.updatedAttendance.find((a) => a.studentId === "s1");
  const s2Record = result.updatedAttendance.find((a) => a.studentId === "s2");
  const s3Record = result.updatedAttendance.find((a) => a.studentId === "s3");

  assert.equal(s1Record?.status, "P");
  assert.equal(s2Record?.status, "A");
  assert.equal(s3Record?.status, "P", "Zero score indicates student was present to submit");

  // Explicit policy notice check
  assert.ok(result.explicitNotice.includes("Auto-generation"));
  assert.ok(result.explicitNotice.includes("Present"));
  assert.ok(result.explicitNotice.includes("Absent"));
  assert.ok(result.explicitNotice.includes("Late"));
  assert.ok(result.explicitNotice.includes("Excused"));
});

test("Cross-Module Sync: executeScenarioASkip filters absent students from rapid grading spotlight", () => {
  const attendance: AttendanceRecord[] = [
    { id: "a1", classId: "c1", studentId: "s1", date: "2026-10-15", status: "P", createdAt: "2026-10-15T08:00:00Z" },
    { id: "a2", classId: "c1", studentId: "s2", date: "2026-10-15", status: "A", createdAt: "2026-10-15T08:00:00Z" },
    { id: "a3", classId: "c1", studentId: "s3", date: "2026-10-15", status: "L", createdAt: "2026-10-15T08:00:00Z" },
  ];

  const result = executeScenarioASkip({
    students: mockStudents,
    date: "2026-10-15",
    attendanceRecords: attendance,
  });

  assert.equal(result.eligibleStudents.length, 2);
  assert.deepEqual(
    result.eligibleStudents.map((s) => s.id),
    ["s1", "s3"]
  );
  assert.equal(result.skippedStudents.length, 1);
  assert.equal(result.skippedStudents[0].id, "s2");
  assert.equal(result.skipReason, "Scenario A: 1 absent student automatically skipped");
});

test("Excel Export: generateMultiSheetExcelXml outputs valid SpreadsheetML workbook with 3 worksheets", () => {
  const xml = generateMultiSheetExcelXml({
    courseTitle: "Science, Technology and Society",
    courseCode: "STAS",
    section: "E106-R",
    term: "1st Semester AY 2025-2026",
    instructorName: "Dr. Joshua Aquino",
    students: mockStudents,
    sessions: [
      {
        id: "sess1",
        classId: "c1",
        date: "2026-10-15",
        type: "regular",
      },
    ],
    attendanceRecords: [
      { id: "a1", classId: "c1", studentId: "s1", date: "2026-10-15", status: "P", createdAt: "2026-10-15T08:00:00Z" },
      { id: "a2", classId: "c1", studentId: "s2", date: "2026-10-15", status: "A", createdAt: "2026-10-15T08:00:00Z" },
    ],
    gradeItems: [mockGradeItem],
    studentGrades: [
      { id: "g1", gradeItemId: "gi-today", studentId: "s1", score: 28 },
    ],
  });

  assert.ok(xml.includes('<?xml version="1.0"?>'));
  assert.ok(xml.includes('<?mso-application progid="Excel.Sheet"?>'));
  assert.ok(xml.includes('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'));
  assert.ok(xml.includes('<Worksheet ss:Name="Master Roster">'));
  assert.ok(xml.includes('<Worksheet ss:Name="Attendance Matrix">'));
  assert.ok(xml.includes('<Worksheet ss:Name="Categorized Grades">'));
  assert.ok(xml.includes("Aquino"));
  assert.ok(xml.includes("STAS"));
});
