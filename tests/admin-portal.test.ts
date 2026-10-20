import test from "node:test";
import assert from "node:assert/strict";
import type { UserProfile } from "../src/types/index.ts";
import {
  provisionInstructorAccount,
  filterUsers,
  toggleUserSuspension,
  canSuspendUser,
  validateSystemPolicyConfig,
  assertAcademicMutationPermitted,
  type SystemPolicyConfig,
  type ProvisionInstructorParams,
} from "../src/lib/admin/admin-portal-engine.ts";

const mockUsers: UserProfile[] = [
  {
    id: "u1",
    email: "admin@university.edu",
    firstName: "Maria",
    lastName: "Santos",
    roles: ["admin"],
    activeView: "admin",
    createdAt: "2026-01-01",
  },
  {
    id: "u2",
    email: "joshua.aquino@university.edu",
    firstName: "Joshua",
    lastName: "Aquino",
    roles: ["instructor"],
    activeView: "instructor",
    department: "Computer Science",
    createdAt: "2026-01-05",
  },
  {
    id: "u3",
    email: "sofia.aquino@student.university.edu",
    firstName: "Sofia",
    lastName: "Aquino",
    roles: ["student"],
    activeView: "student",
    studentNumber: "2024-10821",
    department: "Computer Science",
    createdAt: "2026-08-15",
  },
];

test("Admin Portal: provisionInstructorAccount creates instructor with temporary password", () => {
  const params: ProvisionInstructorParams = {
    firstName: "Arthur",
    middleName: "C.",
    lastName: "Pendelton",
    email: "arthur.pendelton@university.edu",
    department: "Natural Sciences",
  };

  const result = provisionInstructorAccount(params, mockUsers);

  assert.equal(result.success, true);
  assert.ok(result.user !== undefined);
  assert.equal(result.user?.firstName, "Arthur");
  assert.equal(result.user?.lastName, "Pendelton");
  assert.deepEqual(result.user?.roles, ["instructor"]);
  assert.equal(result.user?.department, "Natural Sciences");
  assert.equal(result.user?.mustResetPassword, true);
  assert.ok(result.temporaryPassword !== undefined);
  assert.ok(result.temporaryPassword.length >= 8);
  assert.ok(/[A-Z]/.test(result.temporaryPassword));
  assert.ok(/[0-9]/.test(result.temporaryPassword));
});

test("Admin Portal: provisionInstructorAccount rejects duplicate email or missing fields", () => {
  const duplicateParams: ProvisionInstructorParams = {
    firstName: "Joshua",
    lastName: "Aquino",
    email: "joshua.aquino@university.edu", // duplicate
    department: "Computer Science",
  };

  const result = provisionInstructorAccount(duplicateParams, mockUsers);
  assert.equal(result.success, false);
  assert.ok(result.error?.includes("already exists"));
});

test("Admin Portal: filterUsers and toggleUserSuspension manages accounts", () => {
  // Search by name
  const filteredByName = filterUsers(mockUsers, "Sofia", "all");
  assert.equal(filteredByName.length, 1);
  assert.equal(filteredByName[0].firstName, "Sofia");

  // Filter by role
  const instructors = filterUsers(mockUsers, "", "instructor");
  assert.equal(instructors.length, 1);
  assert.equal(instructors[0].lastName, "Aquino");

  // Toggle suspension
  const updatedUser = toggleUserSuspension(mockUsers[2]);
  assert.equal(updatedUser.isSuspended, true);

  const reactivatedUser = toggleUserSuspension(updatedUser);
  assert.equal(reactivatedUser.isSuspended, false);
});

test("Admin Portal: admin accounts cannot be suspended and admins cannot suspend themselves", () => {
  const adminUser = mockUsers[0]; // id: "u1", role: ["admin"]
  const instructorUser = mockUsers[1]; // id: "u2", role: ["instructor"]

  // Admin trying to suspend another admin account -> blocked
  const adminCheck = canSuspendUser(adminUser, "u_other_admin");
  assert.equal(adminCheck.allowed, false);
  assert.throws(
    () => toggleUserSuspension(adminUser, "u_other_admin"),
    /Administrator accounts are protected and cannot be suspended/
  );

  // Admin trying to suspend their own account -> blocked
  const selfCheck = canSuspendUser(adminUser, "u1");
  assert.equal(selfCheck.allowed, false);
  assert.throws(
    () => toggleUserSuspension(adminUser, "u1"),
    /Administrators cannot suspend their own account/
  );

  // Admin suspending an instructor -> allowed
  const instructorCheck = canSuspendUser(instructorUser, "u1");
  assert.equal(instructorCheck.allowed, true);
  const suspendedInstructor = toggleUserSuspension(instructorUser, "u1");
  assert.equal(suspendedInstructor.isSuspended, true);
});

test("Admin Portal: validateSystemPolicyConfig enforces realistic university attendance parameters", () => {
  const validConfig: SystemPolicyConfig = {
    activeTerm: "1st Semester 2026-2027",
    lateToAbsentRatio: 3,
    maxAbsenceThreshold: 4,
    departments: ["Computer Science", "Information Technology", "Natural Sciences"],
  };

  const validResult = validateSystemPolicyConfig(validConfig);
  assert.equal(validResult.valid, true);

  // Invalid ratio check (< 1 or > 5)
  const invalidConfig: SystemPolicyConfig = {
    ...validConfig,
    lateToAbsentRatio: 0,
  };
  const invalidResult = validateSystemPolicyConfig(invalidConfig);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.error?.includes("Late-to-absent ratio"));
});

test("Admin Portal: assertAcademicMutationPermitted blocks Admins from modifying grades or attendance", () => {
  const adminActor: UserProfile = {
    id: "admin_1",
    email: "admin@university.edu",
    firstName: "Admin",
    lastName: "User",
    roles: ["admin"],
    activeView: "admin",
    createdAt: "2026-01-01",
  };

  const instructorActor: UserProfile = {
    id: "inst_1",
    email: "prof@university.edu",
    firstName: "Faculty",
    lastName: "Member",
    roles: ["instructor"],
    activeView: "instructor",
    createdAt: "2026-01-01",
  };

  // Admin attempting to edit academic records -> must be blocked
  assert.throws(
    () => {
      assertAcademicMutationPermitted(adminActor, "inst_1");
    },
    /Strict Academic Privacy/
  );

  // Assigned instructor editing own class records -> permitted
  assert.doesNotThrow(() => {
    assertAcademicMutationPermitted(instructorActor, "inst_1");
  });

  const suspendedInstructor: UserProfile = {
    ...instructorActor,
    id: "inst_suspended",
    isSuspended: true,
  };

  // Suspended faculty attempting to edit academic records -> must be blocked
  assert.throws(
    () => {
      assertAcademicMutationPermitted(suspendedInstructor, "inst_suspended");
    },
    /Restricted Account/
  );
});

test("Admin Portal: provisioned instructor retains mustResetPassword until permanent password is established", () => {
  const provisionResult = provisionInstructorAccount(
    {
      firstName: "Gabriel",
      lastName: "Reyes",
      email: "gabriel.reyes@university.edu",
      department: "College of Law: COL",
    },
    mockUsers
  );

  assert.equal(provisionResult.success, true);
  const newUser = provisionResult.user!;
  assert.equal(newUser.mustResetPassword, true);
  assert.deepEqual(newUser.roles, ["instructor"]);

  // After setting permanent password:
  const updatedUser: UserProfile = { ...newUser, mustResetPassword: false };
  assert.equal(updatedUser.mustResetPassword, false);
});

