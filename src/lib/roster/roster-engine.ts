import type { RosterStudent } from "../../types/index.ts";

export interface SequencedStudent extends RosterStudent {
  sequenceNumber: number;
}

/**
 * Parses full name strings into structured Last Name, First Name, and Middle Initial.
 * Handles:
 * - "Last, First M." (Standard Academic Format)
 * - "Last, First"
 * - "First Last" fallback
 */
export function parseStudentName(fullName: string): {
  lastName: string;
  firstName: string;
  middleInitial?: string;
} {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return { lastName: "Unknown", firstName: "" };
  }

  if (trimmed.includes(",")) {
    const [lastPart, firstPart] = trimmed.split(",").map((s) => s.trim());
    const firstNameTokens = (firstPart || "").split(/\s+/).filter(Boolean);

    let middleInitial: string | undefined;
    let firstName = firstPart || "";

    if (firstNameTokens.length > 1) {
      const lastToken = firstNameTokens[firstNameTokens.length - 1];
      if (lastToken.length <= 2 || lastToken.endsWith(".")) {
        middleInitial = lastToken;
        firstName = firstNameTokens.slice(0, -1).join(" ");
      }
    }

    return {
      lastName: lastPart,
      firstName,
      middleInitial,
    };
  }

  // Fallback: "First [Middle] Last"
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) {
    return { lastName: tokens[0], firstName: "" };
  }

  const lastName = tokens[tokens.length - 1];
  const firstName = tokens.slice(0, -1).join(" ");
  return { lastName, firstName };
}

/**
 * Parses raw copied TSV from Excel or Google Sheets into structured RosterStudent records.
 * Supports:
 * - 5-Column Table: [#], [Student Number], [Student Name], [Program / Strand], [Academic Level]
 * - 4-Column Table: [Student Number], [Student Name], [Program / Strand], [Academic Level]
 */
export function parseClipboardRosterData(
  clipboardText: string,
  classId: string
): RosterStudent[] {
  if (!clipboardText) return [];

  const lines = clipboardText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const students: RosterStudent[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawCols = lines[i].split("\t").map((c) => c.trim());
    if (rawCols.length < 2) continue;

    // Detect and skip header row
    const lineLower = lines[i].toLowerCase();
    if (
      lineLower.includes("student number") ||
      lineLower.includes("student name") ||
      lineLower.includes("program / strand")
    ) {
      continue;
    }

    let studentNumber = "";
    let rawName = "";
    let program = "General";
    let academicLevel = "1st Year";

    if (rawCols.length >= 5) {
      // 5-column format: [#], [ID], [Name], [Program], [Year]
      studentNumber = rawCols[1];
      rawName = rawCols[2];
      program = rawCols[3] || "General";
      academicLevel = rawCols[4] || "1st Year";
    } else if (rawCols.length === 4) {
      // 4-column format: [ID], [Name], [Program], [Year]
      studentNumber = rawCols[0];
      rawName = rawCols[1];
      program = rawCols[2] || "General";
      academicLevel = rawCols[3] || "1st Year";
    } else if (rawCols.length >= 2) {
      studentNumber = rawCols[0];
      rawName = rawCols[1];
      if (rawCols[2]) program = rawCols[2];
      if (rawCols[3]) academicLevel = rawCols[3];
    }

    if (!studentNumber && !rawName) continue;

    const { lastName, firstName, middleInitial } = parseStudentName(rawName);
    const cleanId = studentNumber.replace(/[^a-zA-Z0-9-]/g, "") || `tmp_${i + 1}`;

    students.push({
      id: `stud_${classId}_${cleanId}`,
      classId,
      studentNumber,
      lastName,
      firstName,
      middleInitial,
      program,
      academicLevel,
    });
  }

  return students;
}

/**
 * Sorts students strictly alphabetically by Last Name (then First Name),
 * returning them with an updated sequenceNumber (1-indexed).
 */
export function sortRosterAlphabetically(
  students: RosterStudent[]
): SequencedStudent[] {
  const sorted = [...students].sort((a, b) => {
    const lastCompare = a.lastName.localeCompare(b.lastName, undefined, {
      sensitivity: "base",
    });
    if (lastCompare !== 0) return lastCompare;
    return a.firstName.localeCompare(b.firstName, undefined, {
      sensitivity: "base",
    });
  });

  return sorted.map((student, index) => ({
    ...student,
    sequenceNumber: index + 1,
  }));
}

/**
 * Validates mandatory fields of a student row.
 */
export function validateStudentRow(student: Partial<RosterStudent>): {
  valid: boolean;
  error?: string;
} {
  if (!student.studentNumber?.trim()) {
    return { valid: false, error: "Student Number is required." };
  }
  if (!student.lastName?.trim()) {
    return { valid: false, error: "Student Last Name is required." };
  }
  return { valid: true };
}
