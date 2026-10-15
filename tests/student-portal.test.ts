import test from "node:test";
import assert from "node:assert/strict";
import type {
  AttendanceRecord,
  GradeItem,
  StudentGrade,
  AcademicClass,
} from "../src/types/index.ts";
import {
  computeStudentPersonalSummary,
  validateExcuseSubmission,
  mergeStudentTimetable,
  type ExternalSubject,
} from "../src/lib/student/student-portal-engine.ts";

const mockGradeItems: GradeItem[] = [
  { id: "g1", classId: "cls_01", category: "quiz", title: "Quiz 1", maxScore: 20, weightPercentage: 25, date: "2026-10-09" },
  { id: "g2", classId: "cls_01", category: "quiz", title: "Quiz 2", maxScore: 30, weightPercentage: 25, date: "2026-10-14" },
  { id: "g3", classId: "cls_01", category: "performance_task", title: "PT 1", maxScore: 50, weightPercentage: 45, date: "2026-10-12" },
  { id: "g4", classId: "cls_01", category: "exam", title: "Midterms", maxScore: 100, weightPercentage: 30, date: "2026-10-16" },
];

const mockStudentGrades: StudentGrade[] = [
  { id: "sg1", gradeItemId: "g1", studentId: "stud_01", score: 19 }, // 95%
  { id: "sg2", gradeItemId: "g2", studentId: "stud_01", score: 27 }, // 90%
  { id: "sg3", gradeItemId: "g3", studentId: "stud_01", score: 48 }, // 96%
  { id: "sg4", gradeItemId: "g4", studentId: "stud_01", score: 92 }, // 92%
];

const mockAttendance: AttendanceRecord[] = [
  { id: "a1", classId: "cls_01", studentId: "stud_01", date: "2026-10-09", status: "P", createdAt: "2026-10-09" },
  { id: "a2", classId: "cls_01", studentId: "stud_01", date: "2026-10-14", status: "L", note: "Traffic", createdAt: "2026-10-14" },
  { id: "a3", classId: "cls_01", studentId: "stud_01", date: "2026-10-16", status: "P", createdAt: "2026-10-16" },
];

test("Student Portal: computeStudentPersonalSummary computes accurate personal metrics and marks", () => {
  const summary = computeStudentPersonalSummary({
    studentId: "stud_01",
    classId: "cls_01",
    attendanceRecords: mockAttendance,
    gradeItems: mockGradeItems,
    studentGrades: mockStudentGrades,
  });

  // Attendance metrics
  assert.equal(summary.attendance.present, 2);
  assert.equal(summary.attendance.late, 1);
  assert.equal(summary.attendance.absent, 0);
  assert.equal(summary.attendance.effectiveAbsences, 0); // Math.floor(1/3) + 0 = 0
  assert.equal(summary.attendance.fdaStanding, "SAFE");

  // Grade standing metrics
  assert.equal(summary.grades.isPassing, true);
  assert.ok(summary.grades.finalGrade !== null);
  assert.ok(summary.grades.finalGrade > 90);
  assert.equal(summary.grades.letterGrade, "1.50"); // 93% in PH scale is 1.50
});

test("Student Portal: validateExcuseSubmission validates reasons and prevents excuses for present sessions", () => {
  // Test 1: Trying to excuse a Present session should be rejected
  const presentCheck = validateExcuseSubmission({
    studentId: "stud_01",
    studentName: "Sofia Aquino",
    studentNumber: "2024-10821",
    classId: "cls_01",
    date: "2026-10-09",
    reason: "Doctor appointment",
    attendanceStatus: "P",
  });
  assert.equal(presentCheck.valid, false);
  assert.ok(presentCheck.error?.includes("Cannot file excuse for a session marked Present"));

  // Test 2: Valid excuse submission for an absent date
  const validCheck = validateExcuseSubmission({
    studentId: "stud_01",
    studentName: "Sofia Aquino",
    studentNumber: "2024-10821",
    classId: "cls_01",
    date: "2026-10-14",
    reason: "Represented university in collegiate debate tournament",
    documentUrl: "https://example.com/cert.pdf",
    attendanceStatus: "A",
  });
  assert.equal(validCheck.valid, true);
  assert.ok(validCheck.request !== undefined);
  assert.equal(validCheck.request?.status, "pending");
  assert.equal(validCheck.request?.studentNumber, "2024-10821");
});

test("Student Portal: mergeStudentTimetable combines enrolled classes with external manual subjects", () => {
  const enrolledClass: AcademicClass = {
    id: "cls_01",
    courseCode: "STAS",
    courseTitle: "Science, Technology and Society",
    section: "E106-R",
    classType: "Lecture",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "inst_01",
    joinCode: "STAS01",
    createdAt: "2026-10-01",
    updatedAt: "2026-10-01",
    schedule: [
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:30",
        room: "Room 402",
      },
    ],
  };

  const externalSubject: ExternalSubject = {
    id: "ext_01",
    title: "PE 3 - Physical Fitness",
    dayOfWeek: "Monday",
    startTime: "13:00",
    endTime: "15:00",
    room: "Gymnasium",
    color: "#059669",
  };

  const timetable = mergeStudentTimetable([enrolledClass], [externalSubject]);

  assert.equal(timetable.length, 2);
  const mondayClasses = timetable.filter((t) => t.dayOfWeek === "Monday");
  assert.equal(mondayClasses.length, 2);
  assert.equal(mondayClasses[0].title, "Science, Technology and Society");
  assert.equal(mondayClasses[1].title, "PE 3 - Physical Fitness");
  assert.equal(mondayClasses[1].isExternal, true);
});
