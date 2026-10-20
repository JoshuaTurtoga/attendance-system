import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  validateEmail,
  isUniversityEmail,
  validatePassword,
  validateStudentNumber,
  maskEmail,
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
