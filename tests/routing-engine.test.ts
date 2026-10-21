import test from "node:test";
import assert from "node:assert/strict";
import {
  ROUTES,
  getRoleDefaultRoute,
  parsePortalPathname,
  isAuthorizedForRoute,
  resolvePostLoginRedirect,
} from "../src/lib/routing/routes.ts";

test("Routing Engine: routes constants define correct path structures", () => {
  assert.equal(ROUTES.auth.landing, "/");
  assert.equal(ROUTES.auth.login, "/login");
  assert.equal(ROUTES.auth.register, "/register");
  assert.equal(ROUTES.auth.forgotPassword, "/forgot-password");

  assert.equal(ROUTES.instructor.today, "/instructor/today");
  assert.equal(ROUTES.instructor.schedule, "/instructor/schedule");
  assert.equal(ROUTES.instructor.classes, "/instructor/classes");
  assert.equal(
    ROUTES.instructor.classWorkspace("cls-123", "attendance"),
    "/instructor/classes/cls-123/attendance"
  );
  assert.equal(
    ROUTES.instructor.classWorkspace("cls-123"),
    "/instructor/classes/cls-123/roster"
  );

  assert.equal(ROUTES.admin.overview, "/admin/overview");
  assert.equal(ROUTES.admin.users, "/admin/users");
  assert.equal(ROUTES.admin.classes, "/admin/classes");
  assert.equal(ROUTES.admin.policies, "/admin/policies");

  assert.equal(ROUTES.student.today, "/student/today");
  assert.equal(ROUTES.student.classes, "/student/classes");
  assert.equal(ROUTES.student.timetable, "/student/timetable");
  assert.equal(ROUTES.student.requests, "/student/requests");
});

test("Routing Engine: getRoleDefaultRoute returns designated home path for each role", () => {
  assert.equal(getRoleDefaultRoute("instructor"), "/instructor/today");
  assert.equal(getRoleDefaultRoute("admin"), "/admin/overview");
  assert.equal(getRoleDefaultRoute("student"), "/student/today");
});

test("Routing Engine: parsePortalPathname decomposes standard and workspace URLs", () => {
  // Standard role tabs
  const parsedAdmin = parsePortalPathname("/admin/users");
  assert.equal(parsedAdmin.role, "admin");
  assert.equal(parsedAdmin.tab, "users");
  assert.equal(parsedAdmin.isWorkspace, false);

  const parsedInstructor = parsePortalPathname("/instructor/schedule");
  assert.equal(parsedInstructor.role, "instructor");
  assert.equal(parsedInstructor.tab, "schedule");
  assert.equal(parsedInstructor.isWorkspace, false);

  // Instructor Class workspace tab
  const parsedWorkspace = parsePortalPathname(
    "/instructor/classes/c9d4a8e2/attendance"
  );
  assert.equal(parsedWorkspace.role, "instructor");
  assert.equal(parsedWorkspace.classId, "c9d4a8e2");
  assert.equal(parsedWorkspace.workspaceTab, "attendance");
  assert.equal(parsedWorkspace.isWorkspace, true);

  // Fallback / root
  const parsedRoot = parsePortalPathname("/");
  assert.equal(parsedRoot.role, null);
  assert.equal(parsedRoot.tab, null);
});

test("Routing Engine: isAuthorizedForRoute verifies role access boundaries", () => {
  assert.equal(isAuthorizedForRoute("instructor", "/instructor/today"), true);
  assert.equal(
    isAuthorizedForRoute("instructor", "/instructor/classes/cls-1/grades"),
    true
  );
  assert.equal(isAuthorizedForRoute("instructor", "/admin/users"), false);
  assert.equal(isAuthorizedForRoute("instructor", "/student/classes"), false);

  assert.equal(isAuthorizedForRoute("admin", "/admin/overview"), true);
  assert.equal(isAuthorizedForRoute("admin", "/instructor/today"), false);

  assert.equal(isAuthorizedForRoute("student", "/student/today"), true);
  assert.equal(isAuthorizedForRoute("student", "/admin/users"), false);

  // Public routes allow any role
  assert.equal(isAuthorizedForRoute("student", "/login"), true);
  assert.equal(isAuthorizedForRoute("admin", "/"), true);
});

test("Routing Engine: resolvePostLoginRedirect respects valid return destinations and rejects foreign roles", () => {
  // Valid matching redirect
  assert.equal(
    resolvePostLoginRedirect("/admin/users", "admin"),
    "/admin/users"
  );
  assert.equal(
    resolvePostLoginRedirect("/instructor/classes/123/attendance", "instructor"),
    "/instructor/classes/123/attendance"
  );

  // Mismatched role redirect falls back to user role default
  assert.equal(
    resolvePostLoginRedirect("/admin/users", "student"),
    "/student/today"
  );

  // Empty / null redirect falls back to role default
  assert.equal(resolvePostLoginRedirect(null, "instructor"), "/instructor/today");
  assert.equal(resolvePostLoginRedirect("", "admin"), "/admin/overview");

  // Auth pages redirect to role default
  assert.equal(resolvePostLoginRedirect("/login", "student"), "/student/today");
});
