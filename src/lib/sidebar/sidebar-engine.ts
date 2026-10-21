/**
 * Curved Tab Sidebar Engine
 *
 * Implements mathematical layout parameters, spring easing curves,
 * concave radial gradient inverted corner geometry, and accessibility
 * attributes for the curved cutout sidebar navigation.
 */

export const CURVED_TAB_DURATION_MS = 587;

export const CURVED_TAB_EASING =
  "linear(0, 0.094 5.6%, 0.274 11.1%, 0.455 16.7%, 0.608 22.2%, 0.726 27.8%, 0.812 33.3%, 0.873 38.9%, 0.916 44.4%, 0.944 50%, 0.964 55.6%, 0.976 61.1%, 0.985 66.7%, 0.99 72.2%, 1 100%)";

export const CURVED_TAB_CORNER_RADIUS_PX = 14;

export const CURVED_TAB_TRANSITION = `transform ${CURVED_TAB_DURATION_MS}ms ${CURVED_TAB_EASING}`;

/**
 * Top concave inverted corner radial gradient.
 * Positioned above .tab on its right edge (top: -14px, right: 0).
 * Center at (0, 0), transparent for radius 14px, transitioning to panelColor at 14.5px.
 */
export function CURVED_TAB_TOP_GRADIENT(panelColor: string = "#FFFFFF"): string {
  return `radial-gradient(circle at 0 0, transparent 14px, ${panelColor} 14.5px)`;
}

/**
 * Bottom concave inverted corner radial gradient.
 * Positioned below .tab on its right edge (bottom: -14px, right: 0).
 * Center at (0, 100%), transparent for radius 14px, transitioning to panelColor at 14.5px.
 */
export function CURVED_TAB_BOTTOM_GRADIENT(panelColor: string = "#FFFFFF"): string {
  return `radial-gradient(circle at 0 100%, transparent 14px, ${panelColor} 14.5px)`;
}

/**
 * Computes CSS transform translateY expression for the active tab position.
 */
export function computeTabTransform(
  index: number | string,
  itemHeight: number | string = "48px"
): string {
  const heightStr = typeof itemHeight === "number" ? `${itemHeight}px` : itemHeight;
  return `translateY(calc(${index} * ${heightStr}))`;
}

/**
 * Returns accessibility attributes for active vs inactive sidebar nav items.
 */
export function getSidebarAriaAttributes(isActive: boolean): {
  "aria-current": "page" | undefined;
} {
  return {
    "aria-current": isActive ? "page" : undefined,
  };
}

/**
 * Resolves the CSS transition property based on prefers-reduced-motion.
 */
export function resolveSidebarMotionTransition(prefersReducedMotion: boolean): string {
  if (prefersReducedMotion) {
    return "none";
  }
  return CURVED_TAB_TRANSITION;
}

export interface RoleNavigationItem {
  id: string;
  label: string;
  href?: string;
  badge?: string | number;
}

/**
 * Returns the default page tab items for a given academic role.
 */
export function getRoleNavigationItems(role: string): RoleNavigationItem[] {
  switch (role) {
    case "instructor":
      return [
        { id: "today", label: "Today's Hub", href: "/instructor/today" },
        { id: "calendar", label: "Weekly Timetable", href: "/instructor/schedule" },
        { id: "classes", label: "All Classes", href: "/instructor/classes" },
      ];
    case "admin":
      return [
        { id: "overview", label: "System Oversight", href: "/admin/overview" },
        { id: "users", label: "User Directory", href: "/admin/users" },
        { id: "classes", label: "Class Oversight", href: "/admin/classes" },
        { id: "policies", label: "Policy & Terms", href: "/admin/policies" },
      ];
    case "student":
      return [
        { id: "today", label: "Today's Hub", href: "/student/today" },
        { id: "classes", label: "My Enrolled Classes", href: "/student/classes" },
        { id: "timetable", label: "Weekly Timetable", href: "/student/timetable" },
        { id: "requests", label: "Join Requests & Appeals", href: "/student/requests" },
      ];
    default:
      return [];
  }
}

/**
 * Safely resolves the active tab index from activeId or a default/fallback index,
 * clamping within the valid bounds of the items array.
 */
export function findActiveTabIndex<T extends { id: string }>(
  items: T[],
  activeId?: string,
  fallbackIndex: number = 0
): number {
  if (!items || items.length === 0) return 0;
  if (activeId !== undefined) {
    const idx = items.findIndex((item) => item.id === activeId);
    if (idx !== -1) return idx;
  }
  return Math.min(Math.max(0, fallbackIndex), Math.max(0, items.length - 1));
}
