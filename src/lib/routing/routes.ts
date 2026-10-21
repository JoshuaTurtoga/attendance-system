/**
 * Routing Engine & Page Address Registry
 *
 * Centralizes all application route definitions, role access validation,
 * portal URL parsing, and session view persistence.
 */

import type { Role } from "@/types";

export type WorkspaceTab = "roster" | "attendance" | "grades" | "notes";

export const ROUTES = {
  auth: {
    landing: "/",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
  },
  instructor: {
    root: "/instructor",
    today: "/instructor/today",
    schedule: "/instructor/schedule",
    classes: "/instructor/classes",
    classWorkspace: (classId: string, tab: WorkspaceTab = "roster") =>
      `/instructor/classes/${classId}/${tab}`,
  },
  admin: {
    root: "/admin",
    overview: "/admin/overview",
    users: "/admin/users",
    classes: "/admin/classes",
    policies: "/admin/policies",
  },
  student: {
    root: "/student",
    today: "/student/today",
    classes: "/student/classes",
    timetable: "/student/timetable",
    requests: "/student/requests",
  },
} as const;

const ROLE_DEFAULT_ROUTES: Record<Role, string> = {
  instructor: ROUTES.instructor.today,
  admin: ROUTES.admin.overview,
  student: ROUTES.student.today,
};

const LAST_ACTIVE_PATH_STORAGE_KEY = "academiatrack_last_active_path";

/**
 * Returns the default home destination route for a given user role.
 */
export function getRoleDefaultRoute(role: Role): string {
  return ROLE_DEFAULT_ROUTES[role] ?? ROUTES.student.today;
}

export interface ParsedPortalPath {
  role: Role | null;
  tab: string | null;
  classId: string | null;
  workspaceTab: WorkspaceTab | null;
  isWorkspace: boolean;
}

/**
 * Parses any incoming URL pathname into portal domain components.
 */
export function parsePortalPathname(pathname: string): ParsedPortalPath {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const segments = cleanPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return {
      role: null,
      tab: null,
      classId: null,
      workspaceTab: null,
      isWorkspace: false,
    };
  }

  const first = segments[0];
  if (first === "admin") {
    return {
      role: "admin",
      tab: segments[1] || "overview",
      classId: null,
      workspaceTab: null,
      isWorkspace: false,
    };
  }

  if (first === "student") {
    return {
      role: "student",
      tab: segments[1] || "today",
      classId: null,
      workspaceTab: null,
      isWorkspace: false,
    };
  }

  if (first === "instructor") {
    // Check if class workspace route: /instructor/classes/[classId]/[workspaceTab]
    if (segments[1] === "classes" && segments[2]) {
      const validWorkspaceTabs: WorkspaceTab[] = [
        "roster",
        "attendance",
        "grades",
        "notes",
      ];
      const subTab = segments[3] as WorkspaceTab;
      return {
        role: "instructor",
        tab: "classes",
        classId: segments[2],
        workspaceTab: validWorkspaceTabs.includes(subTab) ? subTab : "roster",
        isWorkspace: true,
      };
    }

    return {
      role: "instructor",
      tab: segments[1] || "today",
      classId: null,
      workspaceTab: null,
      isWorkspace: false,
    };
  }

  return {
    role: null,
    tab: null,
    classId: null,
    workspaceTab: null,
    isWorkspace: false,
  };
}

/**
 * Validates whether the active role is permitted to navigate to the specified path.
 */
export function isAuthorizedForRoute(role: Role, pathname: string): boolean {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // Public/auth routes are accessible to any user
  if (
    cleanPath === "/" ||
    cleanPath === "/login" ||
    cleanPath === "/register" ||
    cleanPath === "/forgot-password"
  ) {
    return true;
  }

  const parsed = parsePortalPathname(cleanPath);
  if (!parsed.role) return true;
  return parsed.role === role;
}

/**
 * Resolves post-login redirection URL ensuring users land on their intended
 * destination within their permitted role boundaries.
 */
export function resolvePostLoginRedirect(
  redirectTo: string | null | undefined,
  role: Role
): string {
  if (!redirectTo || redirectTo.trim() === "") {
    return getRoleDefaultRoute(role);
  }

  const clean = redirectTo.trim().split("?")[0];
  if (clean === "/" || clean === "/login" || clean === "/register" || clean === "/forgot-password") {
    return getRoleDefaultRoute(role);
  }

  if (isAuthorizedForRoute(role, redirectTo)) {
    return redirectTo;
  }

  return getRoleDefaultRoute(role);
}

/**
 * Reads the last active path for the given role from browser storage.
 */
export function getLastActivePath(role: Role): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${LAST_ACTIVE_PATH_STORAGE_KEY}_${role}`);
    if (raw && isAuthorizedForRoute(role, raw)) {
      return raw;
    }
  } catch {
    // Ignore storage unavailability
  }
  return null;
}

/**
 * Records the current active path for the given role into browser storage.
 */
export function setLastActivePath(role: Role, path: string): void {
  if (typeof window === "undefined") return;
  try {
    if (isAuthorizedForRoute(role, path)) {
      localStorage.setItem(`${LAST_ACTIVE_PATH_STORAGE_KEY}_${role}`, path);
    }
  } catch {
    // Ignore storage unavailability
  }
}
