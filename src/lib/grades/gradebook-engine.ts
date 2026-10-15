import type {
  AttendanceRecord,
  GradeCategory,
  GradeItem,
  RosterStudent,
  StudentGrade,
} from "../../types/index.ts";

export interface CategoryScoreResult {
  earned: number;
  totalMax: number;
  percentage: number | null;
}

export interface StudentStandingResult {
  quizPct: number | null;
  examPct: number | null;
  ptPct: number | null;
  finalGrade: number | null;
  letterGrade: string;
  isPassing: boolean;
}

export interface ScoreValidationResult {
  valid: boolean;
  score: number | null;
  error?: string;
}

export interface EligibleStudentGradingItem {
  student: RosterStudent;
  isAbsentToday: boolean;
}

const DEFAULT_CATEGORY_WEIGHTS: Record<GradeCategory, number> = {
  quiz: 0.25,
  exam: 0.30,
  performance_task: 0.45,
};

/**
 * Calculates a student's subtotal and percentage for a specific category
 * (Quizzes, Exams, or Performance Tasks).
 *
 * Strict Blank vs Zero (0) Policy (DOCUMENTATION.md § 4.B.TAB 3):
 * - A score of 0 means the student completed the assessment and scored 0.
 * - NULL or unrecorded assessments are excluded from the denominator to prevent premature grade deflation.
 */
export function calculateCategoryScore(
  items: GradeItem[],
  grades: StudentGrade[],
  studentId: string,
  category: GradeCategory
): CategoryScoreResult {
  const categoryItems = items.filter((item) => item.category === category);

  let earned = 0;
  let totalMax = 0;
  let hasRecordedScore = false;

  for (const item of categoryItems) {
    const studentGrade = grades.find(
      (g) => g.gradeItemId === item.id && g.studentId === studentId
    );

    if (
      studentGrade &&
      studentGrade.score !== null &&
      studentGrade.score !== undefined
    ) {
      hasRecordedScore = true;
      earned += studentGrade.score;
      totalMax += item.maxScore;
    }
  }

  if (!hasRecordedScore || totalMax === 0) {
    return { earned: 0, totalMax: 0, percentage: null };
  }

  const rawPct = (earned / totalMax) * 100;
  const percentage = Math.round(rawPct * 10) / 10;

  return {
    earned,
    totalMax,
    percentage,
  };
}

/**
 * Institutional Philippine University Grading Scale conversion:
 * 97 - 100: 1.00 (Excellent)
 * 94 - 96:  1.25 (Very Good)
 * 91 - 93:  1.50 (Good)
 * 88 - 90:  1.75
 * 85 - 87:  2.00
 * 82 - 84:  2.25
 * 79 - 81:  2.50
 * 76 - 78:  2.75
 * 75:       3.00 (Passing)
 * < 75:     5.00 (Failed)
 */
export function convertPercentageToMark(pct: number): string {
  if (pct >= 97) return "1.00";
  if (pct >= 94) return "1.25";
  if (pct >= 91) return "1.50";
  if (pct >= 88) return "1.75";
  if (pct >= 85) return "2.00";
  if (pct >= 82) return "2.25";
  if (pct >= 79) return "2.50";
  if (pct >= 76) return "2.75";
  if (pct >= 75) return "3.00";
  return "5.00";
}

/**
 * Calculates a student's overall weighted standing and final grade
 * across all active categories.
 */
export function calculateStudentStanding(
  items: GradeItem[],
  grades: StudentGrade[],
  studentId: string,
  weights: Record<GradeCategory, number> = DEFAULT_CATEGORY_WEIGHTS
): StudentStandingResult {
  const quiz = calculateCategoryScore(items, grades, studentId, "quiz");
  const exam = calculateCategoryScore(items, grades, studentId, "exam");
  const pt = calculateCategoryScore(items, grades, studentId, "performance_task");

  const activeCategories: { percentage: number; weight: number }[] = [];

  if (quiz.percentage !== null) {
    activeCategories.push({ percentage: quiz.percentage, weight: weights.quiz });
  }
  if (exam.percentage !== null) {
    activeCategories.push({ percentage: exam.percentage, weight: weights.exam });
  }
  if (pt.percentage !== null) {
    activeCategories.push({ percentage: pt.percentage, weight: weights.performance_task });
  }

  if (activeCategories.length === 0) {
    return {
      quizPct: null,
      examPct: null,
      ptPct: null,
      finalGrade: null,
      letterGrade: "--",
      isPassing: true,
    };
  }

  const activeWeightTotal = activeCategories.reduce((acc, cat) => acc + cat.weight, 0);
  const weightedSum = activeCategories.reduce(
    (acc, cat) => acc + cat.percentage * cat.weight,
    0
  );

  const rawFinalGrade = weightedSum / activeWeightTotal;
  const finalGrade = Math.round(rawFinalGrade * 10) / 10;
  const letterGrade = convertPercentageToMark(finalGrade);
  const isPassing = finalGrade >= 75;

  return {
    quizPct: quiz.percentage,
    examPct: exam.percentage,
    ptPct: pt.percentage,
    finalGrade,
    letterGrade,
    isPassing,
  };
}

/**
 * Validates a numerical score input against maxScore.
 * Handles blanks / missing values without error.
 */
export function validateScoreInput(
  input: string | number | null | undefined,
  maxScore: number
): ScoreValidationResult {
  if (input === null || input === undefined || input === "") {
    return { valid: true, score: null };
  }

  if (typeof input === "string") {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === "" || trimmed === "missing" || trimmed === "blank" || trimmed === "--") {
      return { valid: true, score: null };
    }

    const num = Number(trimmed);
    if (isNaN(num)) {
      return { valid: false, score: null, error: "Must be a valid number" };
    }

    if (num < 0) {
      return { valid: false, score: null, error: "Score cannot be negative" };
    }

    if (num > maxScore) {
      return {
        valid: false,
        score: null,
        error: `Score cannot exceed maximum of ${maxScore}`,
      };
    }

    return { valid: true, score: num };
  }

  if (typeof input === "number") {
    if (isNaN(input)) {
      return { valid: false, score: null, error: "Must be a valid number" };
    }
    if (input < 0) {
      return { valid: false, score: null, error: "Score cannot be negative" };
    }
    if (input > maxScore) {
      return {
        valid: false,
        score: null,
        error: `Score cannot exceed maximum of ${maxScore}`,
      };
    }
    return { valid: true, score: input };
  }

  return { valid: false, score: null, error: "Invalid score format" };
}

/**
 * Cross-Module Helper (Scenario A):
 * Determines which students are absent today so the inline row-focus grading workflow
 * can automatically glide past them without interrupting the instructor.
 */
export function determineEligibleStudentsForGrading(
  students: RosterStudent[],
  todayAttendance?: AttendanceRecord[]
): EligibleStudentGradingItem[] {
  return students.map((student) => {
    const record = todayAttendance?.find((r) => r.studentId === student.id);
    const isAbsentToday = record ? record.status === "A" : false;

    return {
      student,
      isAbsentToday,
    };
  });
}

/**
 * Cross-Module Helper (Scenario B):
 * If no attendance was recorded for today, auto-generates attendance from this assessment activity.
 * Students with a recorded score -> Present (P)
 * Students marked as missing -> Absent (A)
 */
export function autoGenerateAttendanceFromGrades(
  classId: string,
  date: string,
  students: RosterStudent[],
  gradesForActivity: StudentGrade[]
): AttendanceRecord[] {
  return students.map((student) => {
    const studentGrade = gradesForActivity.find((g) => g.studentId === student.id);
    const hasScore =
      studentGrade !== undefined &&
      studentGrade.score !== null &&
      !isNaN(studentGrade.score);

    return {
      id: `att_${classId}_${student.id}_${date}`,
      classId,
      studentId: student.id,
      date,
      status: hasScore ? "P" : "A",
      note: hasScore
        ? "Auto-generated from activity score"
        : "Auto-generated from unrecorded activity",
      createdAt: new Date().toISOString(),
    };
  });
}
