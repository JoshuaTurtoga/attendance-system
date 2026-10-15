import test from "node:test";
import assert from "node:assert/strict";
import {
  matchJoinRequestToRoster,
  approveJoinRequest,
  declineJoinRequest,
} from "../src/lib/roster/smart-matching-engine.ts";
import type { JoinRequest, RosterStudent } from "../src/types/index.ts";

const sampleRoster: RosterStudent[] = [
  {
    id: "stud_01",
    classId: "cls_01",
    studentNumber: "2024-10821",
    lastName: "Aquino",
    firstName: "Sofia",
    middleInitial: "R.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stud_02",
    classId: "cls_01",
    studentNumber: "2024-10492",
    lastName: "Chen",
    firstName: "Marcus",
    middleInitial: "L.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stud_03",
    classId: "cls_01",
    studentNumber: "2024-10319",
    lastName: "Zubiri",
    firstName: "Gabriel",
    middleInitial: "K.",
    program: "BSIT",
    academicLevel: "3rd Year",
  },
];

test("Smart Matching Engine: matches by exact normalized Student ID", () => {
  const reqWithDashes: JoinRequest = {
    id: "req_01",
    classId: "cls_01",
    studentNumber: "2024-10492",
    studentName: "Marcus Chen",
    program: "BSCS",
    academicLevel: "3rd Year",
    photoIdUrl: "https://example.com/id.jpg",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  const match1 = matchJoinRequestToRoster(reqWithDashes, sampleRoster);
  assert.equal(match1.matchType, "EXACT_ID");
  assert.equal(match1.matchedStudent?.id, "stud_02");
  assert.equal(match1.confidence, 1.0);

  // Even if applicant omitted hyphens ("202410492")
  const reqWithoutDashes: JoinRequest = {
    ...reqWithDashes,
    studentNumber: "202410492",
  };
  const match2 = matchJoinRequestToRoster(reqWithoutDashes, sampleRoster);
  assert.equal(match2.matchType, "EXACT_ID");
  assert.equal(match2.matchedStudent?.id, "stud_02");
});

test("Smart Matching Engine: matches by Name when ID differs or is missing", () => {
  const reqNameOnly: JoinRequest = {
    id: "req_02",
    classId: "cls_01",
    studentNumber: "TEMP-9999",
    studentName: "Sofia Aquino",
    program: "BSCS",
    academicLevel: "3rd Year",
    photoIdUrl: "https://example.com/id2.jpg",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  const match = matchJoinRequestToRoster(reqNameOnly, sampleRoster);
  assert.equal(match.matchType, "NAME_MATCH");
  assert.equal(match.matchedStudent?.id, "stud_01");
  assert.ok(match.confidence >= 0.8);
});

test("Smart Matching Engine: returns NONE when applicant is not on pre-populated roster", () => {
  const reqUnmatched: JoinRequest = {
    id: "req_03",
    classId: "cls_01",
    studentNumber: "2024-99999",
    studentName: "Alexander Hamilton",
    program: "BSBA",
    academicLevel: "1st Year",
    photoIdUrl: "https://example.com/id3.jpg",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  const match = matchJoinRequestToRoster(reqUnmatched, sampleRoster);
  assert.equal(match.matchType, "NONE");
  assert.equal(match.matchedStudent, null);
  assert.equal(match.confidence, 0);
});

test("Smart Matching Engine: approveJoinRequest links student account and photo to roster row", () => {
  const req: JoinRequest = {
    id: "usr_stud_marcus",
    classId: "cls_01",
    studentNumber: "2024-10492",
    studentName: "Marcus Chen",
    program: "BSCS",
    academicLevel: "3rd Year",
    photoIdUrl: "https://example.com/marcus_id.jpg",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  const { updatedRequest, updatedRoster } = approveJoinRequest(req, sampleRoster, "stud_02");
  assert.equal(updatedRequest.status, "approved");

  const matchedSlot = updatedRoster.find((s) => s.id === "stud_02");
  assert.ok(matchedSlot);
  assert.equal(matchedSlot.userId, "usr_stud_marcus");
  assert.equal(matchedSlot.avatarUrl, "https://example.com/marcus_id.jpg");
});

test("Smart Matching Engine: declineJoinRequest records reason and does not touch roster", () => {
  const req: JoinRequest = {
    id: "req_04",
    classId: "cls_01",
    studentNumber: "2024-99999",
    studentName: "Fake Student",
    program: "BSCS",
    academicLevel: "1st Year",
    photoIdUrl: "https://example.com/fake.jpg",
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  const { updatedRequest, updatedRoster } = declineJoinRequest(
    req,
    sampleRoster,
    "Invalid Student ID photo provided"
  );

  assert.equal(updatedRequest.status, "declined");
  assert.equal(updatedRequest.rejectionReason, "Invalid Student ID photo provided");
  assert.deepEqual(updatedRoster, sampleRoster);
});
