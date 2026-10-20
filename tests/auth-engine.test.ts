import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  validateEmail,
  isUniversityEmail,
  validatePassword,
  validateStudentNumber,
  maskEmail,
  UNIVERSITY_DEPARTMENTS,
  parseDepartment,
  formatDepartment,
} from "../src/lib/auth/auth-engine.ts";

test("Auth Engine: normalizeEmail trims and lowercases the address", () => {
  assert.equal(normalizeEmail("  Elena.Vance@University.EDU "), "elena.vance@university.edu");
});

test("Auth Engine: validateEmail accepts well-formed addresses and rejects malformed ones", () => {
  assert.equal(validateEmail("arthur.pendelton@university.edu"), true);
  assert.equal(validateEmail("student@student.university.edu"), true);
  assert.equal(validateEmail("not-an-email"), false);
  assert.equal(validateEmail("missing@domain"), false);
  assert.equal(validateEmail(""), false);
});

test("Auth Engine: isUniversityEmail enforces the official domain", () => {
  assert.equal(isUniversityEmail("student@universityofbohol.edu.ph"), true);
  assert.equal(isUniversityEmail("STUDENT@UNIVERSITYOFBOHOL.EDU.PH"), true);
  assert.equal(isUniversityEmail("student@gmail.com"), false);
  assert.equal(isUniversityEmail("faculty@universityofbohol.edu.ph"), true);
});

test("Auth Engine: validatePassword enforces length and mixed character classes", () => {
  assert.equal(validatePassword("short1").valid, false);
  assert.equal(validatePassword("alllettersonly").valid, false);
  assert.equal(validatePassword("12345678").valid, false);
  assert.equal(validatePassword("Academia2026!").valid, true);
});

test("Auth Engine: validateStudentNumber enforces the YYYY-NNNNN university format", () => {
  assert.equal(validateStudentNumber("2024-10492"), true);
  assert.equal(validateStudentNumber("2024-101010"), true);
  assert.equal(validateStudentNumber("2410492"), false);
  assert.equal(validateStudentNumber("2024-104"), false);
});

test("Auth Engine: maskEmail hides the local part beyond the first two characters", () => {
  assert.equal(maskEmail("elena.vance@university.edu"), "el*********@university.edu");
  assert.equal(maskEmail("no-domain"), "no-domain");
});

test("Auth Engine: UNIVERSITY_DEPARTMENTS defines the 11 official departments with separated names and abbreviations", () => {
  assert.equal(UNIVERSITY_DEPARTMENTS.length, 11);
  const cba = UNIVERSITY_DEPARTMENTS.find((d) => d.code === "CBA");
  assert.ok(cba);
  assert.equal(cba?.name, "College of Business and Accountancy");
  assert.equal(cba?.code, "CBA");

  const vdtalc = UNIVERSITY_DEPARTMENTS.find((d) => d.code === "VDTALC");
  assert.ok(vdtalc);
  assert.equal(vdtalc?.name, "Victoriano D. Tirol Advanced Learning Center");
});

test("Auth Engine: parseDepartment splits department into full name and abbreviation across formats", () => {
  // Colon format
  assert.deepEqual(parseDepartment("College of Business and Accountancy: CBA"), {
    name: "College of Business and Accountancy",
    code: "CBA",
  });

  // Parentheses format
  assert.deepEqual(parseDepartment("College of Law (COL)"), {
    name: "College of Law",
    code: "COL",
  });

  // Full name only
  assert.deepEqual(parseDepartment("College of Criminal Justice"), {
    name: "College of Criminal Justice",
    code: "CCJ",
  });

  // Code only
  assert.deepEqual(parseDepartment("CETAFA"), {
    name: "College of Engineering, Technology, Architecture, and Fine Arts",
    code: "CETAFA",
  });

  // Custom or unknown fallback
  assert.deepEqual(parseDepartment("Computer Science"), {
    name: "Computer Science",
    code: "CS",
  });

  // Empty or undefined
  assert.deepEqual(parseDepartment(""), { name: "", code: "" });
  assert.deepEqual(parseDepartment(null), { name: "", code: "" });
});

test("Auth Engine: formatDepartment supports full, short (abbreviation), and both modes", () => {
  const dept = "College of Pharmacy: COP";
  assert.equal(formatDepartment(dept, "full"), "College of Pharmacy");
  assert.equal(formatDepartment(dept, "short"), "COP");
  assert.equal(formatDepartment(dept, "both"), "College of Pharmacy (COP)");
});

