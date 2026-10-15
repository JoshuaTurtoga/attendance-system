import type { JoinRequest, RosterStudent } from "../../types/index.ts";
import { parseStudentName } from "./roster-engine.ts";

export type MatchType = "EXACT_ID" | "NAME_MATCH" | "NONE";

export interface MatchResult {
  matchedStudent: RosterStudent | null;
  matchType: MatchType;
  confidence: number;
}

/**
 * Normalizes Student IDs by stripping non-alphanumeric characters (hyphens, spaces)
 * e.g. "2024-10492" -> "202410492"
 */
export function normalizeStudentId(id: string): string {
  return (id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/**
 * Smart Matching Engine (DOCUMENTATION.md § 4.B.5.TAB 1):
 * Automatically compares applicant credentials against the pre-populated 5-column class roster.
 * 1. Checks exact normalized Student Number match (Confidence: 1.0)
 * 2. Checks name token match (Confidence: 0.85)
 * 3. Falls back to NONE if no pre-existing roster slot matches
 */
export function matchJoinRequestToRoster(
  request: JoinRequest,
  roster: RosterStudent[]
): MatchResult {
  const reqIdNorm = normalizeStudentId(request.studentNumber);

  // 1. Exact ID Match
  if (reqIdNorm) {
    const idMatch = roster.find(
      (student) => normalizeStudentId(student.studentNumber) === reqIdNorm
    );
    if (idMatch) {
      return {
        matchedStudent: idMatch,
        matchType: "EXACT_ID",
        confidence: 1.0,
      };
    }
  }

  // 2. Name Match
  const { lastName: reqLast, firstName: reqFirst } = parseStudentName(
    request.studentName
  );

  const nameMatch = roster.find((student) => {
    const sameLast =
      student.lastName.toLowerCase() === reqLast.toLowerCase();
    const sameFirst =
      !reqFirst ||
      student.firstName.toLowerCase().includes(reqFirst.toLowerCase()) ||
      reqFirst.toLowerCase().includes(student.firstName.toLowerCase());

    return sameLast && sameFirst;
  });

  if (nameMatch) {
    return {
      matchedStudent: nameMatch,
      matchType: "NAME_MATCH",
      confidence: 0.85,
    };
  }

  // 3. No match found
  return {
    matchedStudent: null,
    matchType: "NONE",
    confidence: 0,
  };
}

/**
 * Approves student join request and binds the applicant's live account and photo avatar
 * to the corresponding roster row slot.
 */
export function approveJoinRequest(
  request: JoinRequest,
  roster: RosterStudent[],
  targetStudentId?: string
): {
  updatedRequest: JoinRequest;
  updatedRoster: RosterStudent[];
} {
  const slotId =
    targetStudentId ||
    matchJoinRequestToRoster(request, roster).matchedStudent?.id;

  const updatedRoster = roster.map((student) => {
    if (student.id === slotId) {
      return {
        ...student,
        userId: request.id,
        avatarUrl: request.photoIdUrl,
      };
    }
    return student;
  });

  const updatedRequest: JoinRequest = {
    ...request,
    status: "approved",
  };

  return { updatedRequest, updatedRoster };
}

/**
 * Declines student join request and records the optional rejection reason.
 */
export function declineJoinRequest(
  request: JoinRequest,
  roster: RosterStudent[],
  reason?: string
): {
  updatedRequest: JoinRequest;
  updatedRoster: RosterStudent[];
} {
  const updatedRequest: JoinRequest = {
    ...request,
    status: "declined",
    rejectionReason: reason,
  };

  return { updatedRequest, updatedRoster: roster };
}
