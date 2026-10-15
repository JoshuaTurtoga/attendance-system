import test from "node:test";
import assert from "node:assert/strict";
import {
  parseClipboardRosterData,
  sortRosterAlphabetically,
  parseStudentName,
  validateStudentRow,
} from "../src/lib/roster/roster-engine.ts";
import type { RosterStudent } from "../src/types/index.ts";

test("Roster Engine: parseStudentName correctly splits Last, First M.I. or First Last", () => {
  // Standard format: "Last, First M."
  const res1 = parseStudentName("Dela Cruz, Juan M.");
  assert.equal(res1.lastName, "Dela Cruz");
  assert.equal(res1.firstName, "Juan");
  assert.equal(res1.middleInitial, "M.");

  // Format without M.I.: "Santos, Maria"
  const res2 = parseStudentName("Santos, Maria");
  assert.equal(res2.lastName, "Santos");
  assert.equal(res2.firstName, "Maria");
  assert.equal(res2.middleInitial, undefined);

  // Single string fallback: "Vance Elena"
  const res3 = parseStudentName("Elena Vance");
  assert.equal(res3.lastName, "Vance");
  assert.equal(res3.firstName, "Elena");
});

test("Roster Engine: parseClipboardRosterData parses TSV pasted from Excel/Google Sheets", () => {
  // Typical copied TSV from Google Sheets with headers
  const clipboardTSV = [
    "#\tStudent Number\tStudent Name\tProgram / Strand\tAcademic Level",
    "1\t2024-10492\tChen, Marcus L.\tBSCS\t3rd Year",
    "2\t2024-10821\tAquino, Sofia R.\tBSCS\t3rd Year",
    "3\t2024-10319\tZubiri, Gabriel K.\tBSIT\t2nd Year",
  ].join("\n");

  const students = parseClipboardRosterData(clipboardTSV, "cls_test_01");
  assert.equal(students.length, 3);

  assert.equal(students[0].studentNumber, "2024-10492");
  assert.equal(students[0].lastName, "Chen");
  assert.equal(students[0].firstName, "Marcus");
  assert.equal(students[0].program, "BSCS");
  assert.equal(students[0].academicLevel, "3rd Year");

  assert.equal(students[1].studentNumber, "2024-10821");
  assert.equal(students[1].lastName, "Aquino");

  assert.equal(students[2].studentNumber, "2024-10319");
  assert.equal(students[2].lastName, "Zubiri");
});

test("Roster Engine: parseClipboardRosterData handles 4-column TSV without sequence number column", () => {
  const clipboard4Col = [
    "2024-10001\tBautista, Clara T.\tBSCS\t1st Year",
    "2024-10002\tAlvarez, Miguel S.\tBSN\t1st Year",
  ].join("\n");

  const students = parseClipboardRosterData(clipboard4Col, "cls_test_02");
  assert.equal(students.length, 2);
  assert.equal(students[0].lastName, "Bautista");
  assert.equal(students[1].lastName, "Alvarez");
});

test("Roster Engine: sortRosterAlphabetically sorts by Last Name and assigns sequence numbers", () => {
  const unsorted: RosterStudent[] = [
    {
      id: "s1",
      classId: "cls_01",
      studentNumber: "2024-10492",
      lastName: "Zubiri",
      firstName: "Gabriel",
      program: "BSIT",
      academicLevel: "2nd Year",
    },
    {
      id: "s2",
      classId: "cls_01",
      studentNumber: "2024-10821",
      lastName: "Aquino",
      firstName: "Sofia",
      program: "BSCS",
      academicLevel: "3rd Year",
    },
    {
      id: "s3",
      classId: "cls_01",
      studentNumber: "2024-10319",
      lastName: "Chen",
      firstName: "Marcus",
      program: "BSCS",
      academicLevel: "3rd Year",
    },
  ];

  const sorted = sortRosterAlphabetically(unsorted);
  assert.equal(sorted.length, 3);

  // #1 should be Aquino
  assert.equal(sorted[0].sequenceNumber, 1);
  assert.equal(sorted[0].lastName, "Aquino");

  // #2 should be Chen
  assert.equal(sorted[1].sequenceNumber, 2);
  assert.equal(sorted[1].lastName, "Chen");

  // #3 should be Zubiri
  assert.equal(sorted[2].sequenceNumber, 3);
  assert.equal(sorted[2].lastName, "Zubiri");
});

test("Roster Engine: validateStudentRow rejects invalid or missing fields", () => {
  assert.equal(
    validateStudentRow({ studentNumber: "", lastName: "Smith" }).valid,
    false
  );
  assert.equal(
    validateStudentRow({ studentNumber: "2024-12345", lastName: "" }).valid,
    false
  );
  assert.equal(
    validateStudentRow({
      studentNumber: "2024-12345",
      lastName: "Smith",
      firstName: "John",
      program: "BSCS",
      academicLevel: "1st Year",
    }).valid,
    true
  );
});
