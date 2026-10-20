import type { Role, UserProfile } from "../../types/index.ts";

export interface ProvisionInstructorParams {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
}

export interface ProvisionInstructorResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
  temporaryPassword?: string;
}

export interface SystemPolicyConfig {
  activeTerm: string;
  miniTerm?: string;
  lateToAbsentRatio: number;
  maxAbsenceThreshold: number;
  departments: string[];
}

export interface PolicyValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Generates an institutional-compliant secure temporary password for provisioned faculty accounts.
 */
export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = Math.floor(1000 + Math.random() * 9000);
  const letterPart = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `Temp-${letterPart}${num}!`;
}

/**
 * Provisions a new instructor account with assigned academic department
 * and auto-generated temporary password (DOCUMENTATION.md § 4.A).
 * Enforces rule: Instructors cannot self-register; accounts must be provisioned by Admins.
 */
export function provisionInstructorAccount(
  params: ProvisionInstructorParams,
  existingUsers: UserProfile[]
): ProvisionInstructorResult {
  const { firstName, middleName, lastName, email, department } = params;

  if (!firstName.trim() || !lastName.trim() || !email.trim() || !department.trim()) {
    return {
      success: false,
      error: "First Name, Last Name, Official Email, and Department are required.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
    return {
      success: false,
      error: "Please provide a valid university email address.",
    };
  }

  const duplicate = existingUsers.some(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (duplicate) {
    return {
      success: false,
      error: `An account with email "${normalizedEmail}" already exists in the institution.`,
    };
  }

  const temporaryPassword = generateTemporaryPassword();
  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    firstName: firstName.trim(),
    middleName: middleName?.trim(),
    lastName: lastName.trim(),
    roles: ["instructor"],
    activeView: "instructor",
    department: department.trim(),
    createdAt: new Date().toISOString(),
    isSuspended: false,
    mustResetPassword: true,
  };

  return {
    success: true,
    user: newUser,
    temporaryPassword,
  };
}

/**
 * Filters institutional user directory by text search and role.
 */
export function filterUsers(
  users: UserProfile[],
  searchQuery: string,
  roleFilter: string
): UserProfile[] {
  const cleanQuery = searchQuery.trim().toLowerCase();

  return users.filter((u) => {
    // Role filter
    if (roleFilter !== "all" && !u.roles.includes(roleFilter as Role)) {
      return false;
    }

    // Text search query
    if (!cleanQuery) return true;

    const fullName = `${u.firstName} ${u.middleName || ""} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    const studentNum = u.studentNumber?.toLowerCase() || "";
    const dept = u.department?.toLowerCase() || "";

    return (
      fullName.includes(cleanQuery) ||
      email.includes(cleanQuery) ||
      studentNum.includes(cleanQuery) ||
      dept.includes(cleanQuery)
    );
  });
}

/**
 * Evaluates whether a target user account can be suspended or reactivated.
 * Rules:
 * - Admin accounts cannot be suspended.
 * - Administrators cannot suspend their own account.
 */
export function canSuspendUser(
  targetUser: UserProfile,
  currentUserId?: string
): { allowed: boolean; reason?: string } {
  if (currentUserId && targetUser.id === currentUserId) {
    return {
      allowed: false,
      reason: "Administrators cannot suspend their own account.",
    };
  }
  if (targetUser.roles.includes("admin")) {
    return {
      allowed: false,
      reason: "Administrator accounts are protected and cannot be suspended.",
    };
  }
  return { allowed: true };
}

/**
 * Toggles an account suspension status between ACTIVE and SUSPENDED.
 * Throws an error if the target account is an administrator or self.
 */
export function toggleUserSuspension(
  user: UserProfile,
  currentUserId?: string
): UserProfile {
  const check = canSuspendUser(user, currentUserId);
  if (!check.allowed) {
    throw new Error(check.reason);
  }
  return {
    ...user,
    isSuspended: !user.isSuspended,
  };
}

/**
 * Validates global institutional attendance and term configurations.
 */
export function validateSystemPolicyConfig(
  config: SystemPolicyConfig
): PolicyValidationResult {
  if (!config.activeTerm.trim()) {
    return { valid: false, error: "Active academic term title is required." };
  }

  if (config.lateToAbsentRatio < 1 || config.lateToAbsentRatio > 5) {
    return {
      valid: false,
      error: "Late-to-absent ratio must be between 1 and 5 (standard: 3 Lates = 1 Absent).",
    };
  }

  if (config.maxAbsenceThreshold < 2 || config.maxAbsenceThreshold > 10) {
    return {
      valid: false,
      error: "Maximum absence threshold (FDA limit) must be between 2 and 10 sessions.",
    };
  }

  if (!config.departments || config.departments.length === 0) {
    return { valid: false, error: "At least one active university department is required." };
  }

  return { valid: true };
}

/**
 * Enforces Strict Academic Privacy rule:
 * While Admins have systemic oversight over users and classes,
 * Admins are strictly blocked at both the UI and API levels from creating, editing,
 * or manipulating grades, attendance records, or individual student academic data.
 */
export function assertAcademicMutationPermitted(
  actor: UserProfile,
  assignedInstructorId: string
): void {
  if (actor.activeView === "admin") {
    throw new Error(
      "Strict Academic Privacy Violation: System Administrators are barred from creating or modifying student academic records, grades, or attendance."
    );
  }

  if (actor.id !== assignedInstructorId && !actor.roles.includes("instructor")) {
    throw new Error(
      "Academic Record Lock: Only the designated course faculty can modify attendance and grade records."
    );
  }
}
