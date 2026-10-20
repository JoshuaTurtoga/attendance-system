import test from "node:test";
import assert from "node:assert/strict";
import {
  canUserModifyAcademicRecords,
  getAvailableViews,
  switchActiveView,
  type Role,
} from "../src/lib/auth/permissions.ts";
import {
  calculateAttendanceMetrics,
  generateClassCode,
  type AttendanceStatus,
} from "../src/lib/attendance/attendance-engine.ts";

test("Academic Data Isolation: only instructors can modify academic records", () => {
  assert.equal(canUserModifyAcademicRecords("instructor"), true);
  // Admins are strictly blocked at UI and API level from editing grades/attendance
  assert.equal(canUserModifyAcademicRecords("admin"), false);
  assert.equal(canUserModifyAcademicRecords("student"), false);
});

test("Role Resolution: single-role accounts resolve available view options", () => {
  const singleInstructor: Role[] = ["instructor"];
  assert.deepEqual(getAvailableViews(singleInstructor), ["instructor"]);

  const singleStudent: Role[] = ["student"];
  assert.deepEqual(getAvailableViews(singleStudent), ["student"]);

  const singleAdmin: Role[] = ["admin"];
  assert.deepEqual(getAvailableViews(singleAdmin), ["admin"]);
});

test("Role Permissions: users can only access their assigned role and are blocked from other views", () => {
  const instructorRoles: Role[] = ["instructor"];
  assert.equal(switchActiveView(instructorRoles, "instructor"), "instructor");
  assert.throws(
    () => switchActiveView(instructorRoles, "admin"),
    /User does not hold the role 'admin'/
  );
  assert.throws(
    () => switchActiveView(instructorRoles, "student"),
    /User does not hold the role 'student'/
  );

  const studentRoles: Role[] = ["student"];
  assert.equal(switchActiveView(studentRoles, "student"), "student");
  assert.throws(
    () => switchActiveView(studentRoles, "admin"),
    /User does not hold the role 'admin'/
  );
});

test("Attendance Engine: calculates lates-to-absent conversion and FDA standing", () => {
  // 1. All present
  const recordsAllPresent: AttendanceStatus[] = ["P", "P", "P", "P"];
  const res1 = calculateAttendanceMetrics(recordsAllPresent, 4);
  assert.equal(res1.present, 4);
  assert.equal(res1.late, 0);
  assert.equal(res1.excused, 0);
  assert.equal(res1.absent, 0);
  assert.equal(res1.effectiveAbsences, 0);
  assert.equal(res1.isWarning, false);
  assert.equal(res1.isFDA, false);

  // 2. 3 Lates = 1 effective absence (institutional ratio)
  const recordsWithLates: AttendanceStatus[] = ["P", "L", "L", "L", "A"];
  const res2 = calculateAttendanceMetrics(recordsWithLates, 4);
  assert.equal(res2.late, 3);
  assert.equal(res2.absent, 1);
  assert.equal(res2.effectiveAbsences, 2); // 1 + floor(3/3)
  assert.equal(res2.isFDA, false);

  // 3. 4 effective absences triggers FDA (Failure Due to Absences)
  const recordsFDA: AttendanceStatus[] = ["A", "A", "A", "A"];
  const res3 = calculateAttendanceMetrics(recordsFDA, 4);
  assert.equal(res3.effectiveAbsences, 4);
  assert.equal(res3.isFDA, true);

  // 4. Excused absences do not penalize towards FDA
  const recordsExcused: AttendanceStatus[] = ["E", "E", "E", "E"];
  const res4 = calculateAttendanceMetrics(recordsExcused, 4);
  assert.equal(res4.excused, 4);
  assert.equal(res4.effectiveAbsences, 0);
  assert.equal(res4.isFDA, false);
});

test("Class Code Generator: creates valid 6-char alphanumeric code without ambiguous characters", () => {
  const code = generateClassCode();
  assert.equal(code.length, 6);
  assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/); // Excludes 0, O, 1, I
});
