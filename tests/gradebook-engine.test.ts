import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCategoryScore,
  calculateStudentStanding,
  validateScoreInput,
  determineEligibleStudentsForGrading,
  autoGenerateAttendanceFromGrades,
} from "../src/lib/grades/gradebook-engine.ts";
import type { GradeItem, StudentGrade, RosterStudent, AttendanceRecord } from "../src/types/index.ts";

const mockItems: GradeItem[] = [
  // Quizzes (weight 25%)
  { id: "item_q1", classId: "cls_01", category: "quiz", title: "Quiz 1 - Ethics", maxScore: 20, weightPercentage: 25, date: "2026-10-09" },
  { id: "item_q2", classId: "cls_01", category: "quiz", title: "Quiz 2 - AI Systems", maxScore: 30, weightPercentage: 25, date: "2026-10-14" },

  // Exams (weight 30%)
  { id: "item_ex1", classId: "cls_01", category: "exam", title: "Midterm Examination", maxScore: 100, weightPercentage: 30, date: "2026-10-16" },

  // Performance Tasks (weight 45%)
  { id: "item_pt1", classId: "cls_01", category: "performance_task", title: "PT 1 - Case Study Presentation", maxScore: 50, weightPercentage: 45, date: "2026-10-12" },
];

test("Gradebook Engine: strict blank/null vs zero (0) handling in category calculation", () => {
  // Student A: scored 18/20 in Q1, but Q2 is unrecorded (null)
  const gradesStudentA: StudentGrade[] = [
    { id: "g1", gradeItemId: "item_q1", studentId: "stud_01", score: 18 },
    { id: "g2", gradeItemId: "item_q2", studentId: "stud_01", score: null },
  ];

  const catA = calculateCategoryScore(mockItems, gradesStudentA, "stud_01", "quiz");
  // Only Q1 should be evaluated: 18 / 20 = 90% (not 18 / 50 = 36%!)
  assert.equal(catA.earned, 18);
  assert.equal(catA.totalMax, 20);
  assert.equal(catA.percentage, 90);

  // Student B: took Q2 and scored 0/30, and Q1 was 15/20
  const gradesStudentB: StudentGrade[] = [
    { id: "g3", gradeItemId: "item_q1", studentId: "stud_02", score: 15 },
    { id: "g4", gradeItemId: "item_q2", studentId: "stud_02", score: 0 },
  ];

  const catB = calculateCategoryScore(mockItems, gradesStudentB, "stud_02", "quiz");
  // Both evaluated: (15 + 0) / (20 + 30) = 15 / 50 = 30%
  assert.equal(catB.earned, 15);
  assert.equal(catB.totalMax, 50);
  assert.equal(catB.percentage, 30);
});

test("Gradebook Engine: calculateStudentStanding calculates weighted grade and institutional mark", () => {
  // Student scored:
  // Quiz: 18/20 + 27/30 = 45/50 = 90% (weight 25% -> 22.5)
  // Exam: 88/100 = 88% (weight 30% -> 26.4)
  // PT: 48/50 = 96% (weight 45% -> 43.2)
  // Total: 22.5 + 26.4 + 43.2 = 92.1%
  const grades: StudentGrade[] = [
    { id: "g1", gradeItemId: "item_q1", studentId: "stud_01", score: 18 },
    { id: "g2", gradeItemId: "item_q2", studentId: "stud_01", score: 27 },
    { id: "g3", gradeItemId: "item_ex1", studentId: "stud_01", score: 88 },
    { id: "g4", gradeItemId: "item_pt1", studentId: "stud_01", score: 48 },
  ];

  const standing = calculateStudentStanding(mockItems, grades, "stud_01");
  assert.equal(standing.quizPct, 90);
  assert.equal(standing.examPct, 88);
  assert.equal(standing.ptPct, 96);
  assert.equal(standing.finalGrade, 92.1);
  assert.equal(standing.letterGrade, "1.50"); // 91-93 -> 1.50
  assert.equal(standing.isPassing, true);
});

test("Gradebook Engine: validateScoreInput validates bounds and handles null/blank", () => {
  // Blank inputs
  assert.deepEqual(validateScoreInput("", 50), { valid: true, score: null });
  assert.deepEqual(validateScoreInput("missing", 50), { valid: true, score: null });
  assert.deepEqual(validateScoreInput(null, 50), { valid: true, score: null });

  // Valid numbers
  assert.deepEqual(validateScoreInput("45", 50), { valid: true, score: 45 });
  assert.deepEqual(validateScoreInput("0", 50), { valid: true, score: 0 });
  assert.deepEqual(validateScoreInput(50, 50), { valid: true, score: 50 });

  // Out of bounds
  assert.equal(validateScoreInput("-5", 50).valid, false);
  assert.equal(validateScoreInput("55", 50).valid, false);
  assert.equal(validateScoreInput("abc", 50).valid, false);
});

test("Gradebook Engine: determineEligibleStudentsForGrading detects absent students for today (Scenario A)", () => {
  const students: RosterStudent[] = [
    { id: "s1", classId: "c1", studentNumber: "101", lastName: "Aquino", firstName: "Sofia", program: "BSCS", academicLevel: "3rd" },
    { id: "s2", classId: "c1", studentNumber: "102", lastName: "Chen", firstName: "Marcus", program: "BSCS", academicLevel: "3rd" },
  ];

  const attendance: AttendanceRecord[] = [
    { id: "a1", classId: "c1", studentId: "s1", date: "2026-10-16", status: "P", createdAt: "..." },
    { id: "a2", classId: "c1", studentId: "s2", date: "2026-10-16", status: "A", createdAt: "..." },
  ];

  const result = determineEligibleStudentsForGrading(students, attendance);
  assert.equal(result[0].student.id, "s1");
  assert.equal(result[0].isAbsentToday, false);

  assert.equal(result[1].student.id, "s2");
  assert.equal(result[1].isAbsentToday, true); // Should be flagged so grading workflow can auto-skip
});

test("Gradebook Engine: autoGenerateAttendanceFromGrades maps scored to Present and missing to Absent (Scenario B)", () => {
  const students: RosterStudent[] = [
    { id: "s1", classId: "cls_01", studentNumber: "101", lastName: "Aquino", firstName: "Sofia", program: "BSCS", academicLevel: "3rd" },
    { id: "s2", classId: "cls_01", studentNumber: "102", lastName: "Chen", firstName: "Marcus", program: "BSCS", academicLevel: "3rd" },
  ];

  const activityGrades: StudentGrade[] = [
    { id: "g1", gradeItemId: "item_q1", studentId: "s1", score: 18 },
    { id: "g2", gradeItemId: "item_q1", studentId: "s2", score: null }, // Missing
  ];

  const records = autoGenerateAttendanceFromGrades("cls_01", "2026-10-16", students, activityGrades);
  assert.equal(records.length, 2);

  // Scored student -> Present (P)
  assert.equal(records[0].studentId, "s1");
  assert.equal(records[0].status, "P");

  // Missing student -> Absent (A)
  assert.equal(records[1].studentId, "s2");
  assert.equal(records[1].status, "A");
  assert.ok(records[1].note?.includes("Auto-generated"));
});
