import type { Role } from "../../types/index.ts";

export type { Role };

/**
 * Strict Academic Privacy Rule (DOCUMENTATION.md § 3.5):
 * While Admins have systemic oversight over users and classes, Admins are strictly
 * blocked at both the UI and API levels from creating, editing, or manipulating
 * grades, attendance records, or individual student academic data.
 * Academic record modification is exclusively locked to the assigned class instructor.
 */
export function canUserModifyAcademicRecords(role: Role): boolean {
  return role === "instructor";
}

/**
 * Dual-Role POV Toggle resolution (DOCUMENTATION.md § 3.4):
 * Returns the set of views the user is entitled to switch between.
 */
export function getAvailableViews(roles: Role[]): Role[] {
  if (!roles || roles.length === 0) {
    return [];
  }

  // Preserve priority ordering: instructor/student primary, admin secondary
  const result: Role[] = [];
  if (roles.includes("instructor")) result.push("instructor");
  if (roles.includes("student")) result.push("student");
  if (roles.includes("admin")) result.push("admin");

  return result;
}

/**
 * Validates and switches the active POV view for a user.
 * Throws an error if the user attempts to assume a role they do not possess.
 */
export function switchActiveView(roles: Role[], targetRole: Role): Role {
  if (!roles.includes(targetRole)) {
    throw new Error(`User does not hold the role '${targetRole}'`);
  }
  return targetRole;
}

/**
 * Determines whether a user with given roles can access a route.
 */
export function canAccessRoute(roles: Role[], pathname: string): boolean {
  if (!roles || roles.length === 0) return false;

  if (pathname.startsWith("/admin")) {
    return roles.includes("admin");
  }
  if (pathname.startsWith("/instructor")) {
    return roles.includes("instructor");
  }
  if (pathname.startsWith("/student")) {
    return roles.includes("student");
  }

  // Common/public routes
  return true;
}
