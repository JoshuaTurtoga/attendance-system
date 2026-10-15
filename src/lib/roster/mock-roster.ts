import type {
  RosterStudent,
  JoinRequest,
  ExcuseRequest,
  GradeItem,
  StudentGrade,
} from "../../types/index.ts";

export const DEFAULT_ROSTER: RosterStudent[] = [
  {
    id: "stud_01",
    classId: "cls_01",
    studentNumber: "2024-10821",
    lastName: "Aquino",
    firstName: "Sofia",
    middleInitial: "R.",
    program: "BSCS",
    academicLevel: "3rd Year",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "stud_02",
    classId: "cls_01",
    studentNumber: "2024-10001",
    lastName: "Bautista",
    firstName: "Clara",
    middleInitial: "T.",
    program: "BSCS",
    academicLevel: "3rd Year",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "stud_03",
    classId: "cls_01",
    studentNumber: "2024-10492",
    lastName: "Chen",
    firstName: "Marcus",
    middleInitial: "L.",
    program: "BSCS",
    academicLevel: "3rd Year",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "stud_04",
    classId: "cls_01",
    studentNumber: "2024-10555",
    lastName: "Dela Cruz",
    firstName: "Juan",
    middleInitial: "M.",
    program: "BSIT",
    academicLevel: "3rd Year",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "stud_05",
    classId: "cls_01",
    studentNumber: "2024-10319",
    lastName: "Zubiri",
    firstName: "Gabriel",
    middleInitial: "K.",
    program: "BSIT",
    academicLevel: "3rd Year",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

export const DEFAULT_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: "req_01",
    classId: "cls_01",
    studentNumber: "2024-10492",
    studentName: "Marcus Chen",
    program: "BSCS",
    academicLevel: "3rd Year",
    photoIdUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    status: "pending",
    submittedAt: "2026-10-14 09:30 AM",
  },
  {
    id: "req_02",
    classId: "cls_01",
    studentNumber: "2024-10821",
    studentName: "Sofia Aquino",
    program: "BSCS",
    academicLevel: "3rd Year",
    photoIdUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    status: "pending",
    submittedAt: "2026-10-14 10:15 AM",
  },
  {
    id: "req_03",
    classId: "cls_01",
    studentNumber: "2024-99999",
    studentName: "Lucas Walker",
    program: "BSBA",
    academicLevel: "1st Year",
    photoIdUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    status: "pending",
    submittedAt: "2026-10-14 11:00 AM",
  },
];

export const DEFAULT_EXCUSE_REQUESTS: ExcuseRequest[] = [
  {
    id: "exc_01",
    classId: "cls_01",
    studentId: "stud_05",
    studentName: "Gabriel Zubiri",
    studentNumber: "2024-10319",
    date: "2026-10-09",
    reason: "Severe viral fever with hospital medical certificate",
    documentUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    status: "pending",
    submittedAt: "2026-10-10 08:30 AM",
  },
  {
    id: "exc_02",
    classId: "cls_01",
    studentId: "stud_03",
    studentName: "Marcus Chen",
    studentNumber: "2024-10492",
    date: "2026-10-14",
    reason: "Represented university in Inter-Collegiate Programming Contest (ICPC)",
    documentUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    status: "pending",
    submittedAt: "2026-10-15 09:15 AM",
  },
];

export const DEFAULT_GRADE_ITEMS: GradeItem[] = [
  {
    id: "gi_q1",
    classId: "cls_01",
    category: "quiz",
    title: "Quiz 1: Scientific Revolution",
    maxScore: 20,
    weightPercentage: 25,
    date: "2026-10-09",
  },
  {
    id: "gi_q2",
    classId: "cls_01",
    category: "quiz",
    title: "Quiz 2: Tech & Human Flourishing",
    maxScore: 25,
    weightPercentage: 25,
    date: "2026-10-14",
  },
  {
    id: "gi_pt1",
    classId: "cls_01",
    category: "performance_task",
    title: "PT 1: Case Analysis Essay",
    maxScore: 50,
    weightPercentage: 45,
    date: "2026-10-12",
  },
  {
    id: "gi_ex1",
    classId: "cls_01",
    category: "exam",
    title: "Midterm Examination",
    maxScore: 100,
    weightPercentage: 30,
    date: "2026-10-16",
  },
];

export const DEFAULT_STUDENT_GRADES: StudentGrade[] = [
  // Sofia Aquino (stud_01)
  { id: "sg_1", gradeItemId: "gi_q1", studentId: "stud_01", score: 19 },
  { id: "sg_2", gradeItemId: "gi_q2", studentId: "stud_01", score: 24 },
  { id: "sg_3", gradeItemId: "gi_pt1", studentId: "stud_01", score: 48 },
  { id: "sg_4", gradeItemId: "gi_ex1", studentId: "stud_01", score: 94 },

  // Clara Bautista (stud_02)
  { id: "sg_5", gradeItemId: "gi_q1", studentId: "stud_02", score: 17 },
  { id: "sg_6", gradeItemId: "gi_q2", studentId: "stud_02", score: 22 },
  { id: "sg_7", gradeItemId: "gi_pt1", studentId: "stud_02", score: 45 },
  { id: "sg_8", gradeItemId: "gi_ex1", studentId: "stud_02", score: 88 },

  // Marcus Chen (stud_03)
  { id: "sg_9", gradeItemId: "gi_q1", studentId: "stud_03", score: 18 },
  { id: "sg_10", gradeItemId: "gi_q2", studentId: "stud_03", score: 20 },
  { id: "sg_11", gradeItemId: "gi_pt1", studentId: "stud_03", score: 46 },
  { id: "sg_12", gradeItemId: "gi_ex1", studentId: "stud_03", score: 91 },

  // Juan Dela Cruz (stud_04)
  { id: "sg_13", gradeItemId: "gi_q1", studentId: "stud_04", score: 15 },
  { id: "sg_14", gradeItemId: "gi_q2", studentId: "stud_04", score: 18 },
  { id: "sg_15", gradeItemId: "gi_pt1", studentId: "stud_04", score: 40 },
  { id: "sg_16", gradeItemId: "gi_ex1", studentId: "stud_04", score: 82 },

  // Gabriel Zubiri (stud_05) - Note: has a null score demonstrating unrecorded assessment
  { id: "sg_17", gradeItemId: "gi_q1", studentId: "stud_05", score: 14 },
  { id: "sg_18", gradeItemId: "gi_q2", studentId: "stud_05", score: null }, // Excused / unrecorded
  { id: "sg_19", gradeItemId: "gi_pt1", studentId: "stud_05", score: 42 },
  { id: "sg_20", gradeItemId: "gi_ex1", studentId: "stud_05", score: 78 },
];
