"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AcademicClass, UserProfile } from "@/types";
import { useAuth } from "@/features/auth/auth-context";
import { listProfiles, setSuspension } from "@/lib/data/profiles";
import { listVisibleClasses } from "@/lib/data/classes";
import { listRosterCounts } from "@/lib/data/roster";
import { fetchSystemPolicy, saveSystemPolicy } from "@/lib/data/admin";
import { formatTime12Hour } from "@/lib/schedule/timetable-engine";
import {
  filterUsers,
  toggleUserSuspension,
  type SystemPolicyConfig,
} from "@/lib/admin/admin-portal-engine";
import { AdminProvisionModal } from "./admin-provision-modal";
import { AdminTermConfigModal } from "./admin-term-config-modal";
import { EmptyState } from "./empty-state";
import { DepartmentLabel, DepartmentBadge } from "./department-label";
import {
  ShieldAlert,
  Users,
  Settings,
  GraduationCap,
  Lock,
  UserPlus,
  BookOpen,
  Search,
  CheckCircle2,
  Ban,
  Building2,
  Calendar,
  Clock,
  Info,
  ShieldCheck,
  Check,
} from "lucide-react";

interface AdminClassOverview {
  id: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  instructorName: string;
  instructorEmail: string;
  department: string;
  enrolledCount: number;
  schedule: string;
  room: string;
  joinCode: string;
}

const EMPTY_POLICY: SystemPolicyConfig = {
  activeTerm: "No term configured",
  miniTerm: undefined,
  lateToAbsentRatio: 0,
  maxAbsenceThreshold: 0,
  departments: [],
};

/** Projects a stored class + its instructor + headcount into the admin table row. */
function toClassOverview(
  cls: AcademicClass,
  usersById: Map<string, UserProfile>,
  rosterCounts: Record<string, number>
): AdminClassOverview {
  const instructor = usersById.get(cls.instructorId);
  const primary = cls.schedule[0];
  const schedule = cls.schedule.length
    ? `${cls.schedule.map((b) => b.dayOfWeek.slice(0, 3)).join(" / ")}${
        primary
          ? ` (${formatTime12Hour(primary.startTime)} - ${formatTime12Hour(
              primary.endTime
            )})`
          : ""
      }`
    : "Schedule not set";

  return {
    id: cls.id,
    courseCode: cls.courseCode,
    courseTitle: cls.courseTitle,
    section: cls.section,
    instructorName: instructor
      ? `${instructor.firstName} ${instructor.lastName}`
      : "Unassigned",
    instructorEmail: instructor?.email ?? "—",
    department: instructor?.department ?? cls.term,
    enrolledCount: rosterCounts[cls.id] ?? 0,
    schedule,
    room: primary?.room ?? "TBA",
    joinCode: cls.joinCode,
  };
}

export type AdminTab = "overview" | "users" | "classes" | "policies";

export interface AdminHubProps {
  activeTab?: AdminTab;
}

export function AdminHub({ activeTab = "overview" }: AdminHubProps = {}) {
  const { supabase } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [rosterCounts, setRosterCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & Filters for User Directory
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  // Search for Classes
  const [classSearchQuery, setClassSearchQuery] = useState("");

  // Modals state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isTermConfigModalOpen, setIsTermConfigModalOpen] = useState(false);

  // System Policy Config state
  const [systemConfig, setSystemConfig] = useState<SystemPolicyConfig>(EMPTY_POLICY);

  // Action status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAdminData = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const [profiles, classList, counts, policy] = await Promise.all([
        listProfiles(supabase),
        listVisibleClasses(supabase),
        listRosterCounts(supabase),
        fetchSystemPolicy(supabase),
      ]);
      setUsers(profiles);
      setClasses(classList);
      setRosterCounts(counts);
      if (policy) setSystemConfig(policy);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Unable to load institutional data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAdminData();
    });
  }, [loadAdminData]);

  const handleToggleSuspension = async (user: UserProfile) => {
    const updated = toggleUserSuspension(user);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    try {
      if (supabase) await setSuspension(supabase, user.id, Boolean(updated.isSuspended));
      showToast(
        updated.isSuspended
          ? `Account for ${user.firstName} ${user.lastName} has been suspended.`
          : `Account for ${user.firstName} ${user.lastName} has been reactivated.`
      );
    } catch (err) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      showToast(err instanceof Error ? err.message : "Unable to update the account.");
    }
  };

  const handleInstructorProvisioned = (newUser: UserProfile) => {
    setUsers((prev) => [
      newUser,
      ...prev.filter((u) => u.id !== newUser.id && u.email !== newUser.email),
    ]);
    showToast(
      `Faculty account for ${newUser.firstName} ${newUser.lastName} provisioned successfully.`
    );
  };

  const handleSaveConfig = async (newConfig: SystemPolicyConfig) => {
    try {
      if (supabase) await saveSystemPolicy(supabase, newConfig);
      setSystemConfig(newConfig);
      showToast("Institutional policies and term settings updated.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to save policies.");
    }
  };

  // Filtered User list
  const filteredUsers = filterUsers(users, userSearchQuery, userRoleFilter);

  const usersById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  const classOverviews = useMemo(
    () => classes.map((cls) => toClassOverview(cls, usersById, rosterCounts)),
    [classes, usersById, rosterCounts]
  );

  // Filtered Classes list
  const filteredClasses = classOverviews.filter((c) => {
    if (!classSearchQuery.trim()) return true;
    const q = classSearchQuery.toLowerCase();
    return (
      c.courseCode.toLowerCase().includes(q) ||
      c.courseTitle.toLowerCase().includes(q) ||
      c.instructorName.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q)
    );
  });

  const facultyCount = users.filter((u) => u.roles.includes("instructor")).length;
  const studentCount = users.filter((u) => u.roles.includes("student")).length;

  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-950 text-white shadow-2xl border border-zinc-800 flex items-start gap-3 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200 max-w-[calc(100vw-3rem)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{toastMessage}</span>
        </div>
      )}

      {/* Strict Privacy Banner (DOCUMENTATION.md § 3.5) */}
      <div
        className="stagger-block flex items-start gap-4 p-5 rounded-3xl bg-amber-50/80 border border-amber-200/90 text-amber-950 shadow-xs"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-amber-900 text-sm">
              Institutional Governance &amp; Strict Academic Privacy Active
            </p>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold whitespace-nowrap">
              DOC § 3.5 ENFORCED
            </span>
          </div>
          <p className="text-amber-800/90 leading-relaxed">
            As System Administrator, you manage accounts, academic departments, and attendance policies.
            Per university policy,{" "}
            <strong>
              academic records (grades, roll-call sessions, student scores) are strictly locked from administrative modification.
            </strong>{" "}
            Only designated course faculty may create or edit academic evaluations.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{loadError}</span>
        </div>
      )}

      {/* TAB 1: SYSTEM OVERSIGHT */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Admin Stat Cards */}
          <div
            className="stagger-block grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Faculty Members
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#7C1D26] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-zinc-950 mt-3">{facultyCount}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Across {systemConfig.departments.length} departments
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Registered Students
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-zinc-950 mt-3">{studentCount}</p>
              <p className="text-xs text-zinc-500 mt-1">Verified university numbers</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Active Classes
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-zinc-950 mt-3">{classes.length}</p>
              <p className="text-xs text-zinc-500 mt-1">{systemConfig.activeTerm}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Attendance Policy
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-zinc-950 mt-3">
                {systemConfig.lateToAbsentRatio} L = 1 A
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                FDA Limit: Max {systemConfig.maxAbsenceThreshold} Absences
              </p>
            </div>
          </div>

          {/* Quick Actions & Governance Overview */}
          <div
            className="stagger-block grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">
                    Faculty Account Provisioning
                  </h3>
                  <p className="text-xs text-zinc-400">Exclusive admin workflow</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Faculty accounts cannot self-register. Provision instructors with temporary credentials and assigned academic departments.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setIsProvisionModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                >
                  Provision New Instructor
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">
                    Institutional Policies & Term
                  </h3>
                  <p className="text-xs text-zinc-400">Semester calendar & FDA ratios</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Configure the active academic semester, mini-terms, departmental structures, and failure due to absences (FDA) thresholds.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setIsTermConfigModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                >
                  Configure Term &amp; Rules
                </button>
              </div>
            </div>
          </div>

          {/* Institutional Compliance & Audit Card */}
          <div
            className="stagger-block p-6 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-4"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-zinc-100">
                  Academic Integrity & Privacy Lock (DOCUMENTATION.md § 3.5)
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                AUDIT COMPLIANT
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Institutional safeguards actively isolate administrative portal controls from course records. System administrators can provision accounts, manage department catalogs, and inspect course rosters, but are strictly prohibited from altering student marks, exam scores, or roll-call results.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div
            className="stagger-block flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user by name, email, student ID, department..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["all", "instructor", "student", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer capitalize ${
                    userRoleFilter === role
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {role === "all" ? "All Roles" : `${role}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
              <p className="text-xs font-semibold">Loading institutional accounts…</p>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No user accounts yet"
              description="Faculty and student accounts will appear here once instructors are provisioned and students register with a verified university email."
            />
          ) : (
          <div
            className="stagger-block bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/60 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Roles</th>
                    <th className="py-3.5 px-4">Academic Dept / ID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        No user accounts match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700 overflow-hidden shrink-0">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.firstName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                `${user.firstName[0]}${user.lastName[0]}`
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-950">
                                {user.firstName} {user.middleName || ""} {user.lastName}
                              </p>
                              <p className="text-[11px] text-zinc-400 font-mono">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((r) => (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                  r === "admin"
                                    ? "bg-amber-100 text-amber-800"
                                    : r === "instructor"
                                    ? "bg-rose-100 text-[#7C1D26]"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-zinc-900">
                            <DepartmentLabel
                              department={user.department}
                              fallback="General Administration"
                            />
                          </p>
                          {user.studentNumber && (
                            <p className="text-[10px] text-zinc-400 font-mono">
                              ID: {user.studentNumber}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {user.isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                              <Ban className="w-3 h-3" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleSuspension(user)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                              user.isSuspended
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            }`}
                          >
                            {user.isSuspended ? "Reactivate" : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* TAB 3: INSTITUTIONAL CLASS OVERSIGHT */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          {/* Read-Only Notice */}
          <div
            className="stagger-block p-4 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5 sm:mt-0" />
              <span className="min-w-0 break-words">
                <strong>Read-Only Oversight:</strong> You have high-level visibility across all active class enrollments and course assignments. Individual gradebooks and attendance sheets are locked to assigned instructors.
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono font-semibold whitespace-nowrap self-start sm:self-auto shrink-0">
              Term: {systemConfig.activeTerm}
            </span>
          </div>

          {/* Class Search Bar */}
          <div
            className="stagger-block relative"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={classSearchQuery}
              onChange={(e) => setClassSearchQuery(e.target.value)}
              placeholder="Search classes by code, title, section, or faculty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] shadow-xs"
            />
          </div>

          {/* Classes Table */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
              <p className="text-xs font-semibold">Loading class records…</p>
            </div>
          ) : classes.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-6 h-6" />}
              title="No classes created yet"
              description="Once instructors create their first course, enrollments and scheduled sessions will appear here for institutional oversight."
            />
          ) : (
          <div
            className="stagger-block bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/60 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-4">Faculty Assigned</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Schedule & Venue</th>
                    <th className="py-3.5 px-4">Enrollment</th>
                    <th className="py-3.5 px-4 text-right">Join Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        No university classes match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => (
                      <tr key={cls.id} className="hover:bg-zinc-50/60 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-950">
                            {cls.courseCode}{" "}
                            <span className="text-zinc-500 font-normal">({cls.section})</span>
                          </p>
                          <p className="text-[11px] text-zinc-500">{cls.courseTitle}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-zinc-900">{cls.instructorName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {cls.instructorEmail}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-zinc-600">
                            <DepartmentLabel department={cls.department} />
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-zinc-900">{cls.schedule}</p>
                          <p className="text-[10px] text-zinc-400">{cls.room}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            <Users className="w-3 h-3" />
                            {cls.enrolledCount} Students
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-xs px-2 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {cls.joinCode}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* TAB 4: INSTITUTIONAL POLICY & TERM SETTINGS */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          <div
            className="stagger-block flex items-center justify-between"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                Institutional Policy Governance
              </h3>
              <p className="text-xs text-zinc-400">
                Standardized academic term calendar and attendance cut-limit parameters
              </p>
            </div>
            <button
              onClick={() => setIsTermConfigModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure Settings
            </button>
          </div>

          <div
            className="stagger-block grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            {/* Term & Calendar Card */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#7C1D26] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-950 text-sm">Active Academic Term</h4>
                  <p className="text-[11px] text-zinc-400">Current calendar cycle</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Term Title:</span>
                  <span className="font-bold text-zinc-900 text-xs">
                    {systemConfig.activeTerm}
                  </span>
                </div>
                {systemConfig.miniTerm && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                    <span className="text-xs text-zinc-500">Grading Cycles:</span>
                    <span className="font-semibold text-zinc-700 text-xs">
                      {systemConfig.miniTerm}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance & FDA Policy Card */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-950 text-sm">Attendance & FDA Rules</h4>
                  <p className="text-[11px] text-zinc-400">University standard cut-limits</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Late-to-Absent Ratio:</span>
                  <span className="font-bold text-zinc-900 text-xs">
                    {systemConfig.lateToAbsentRatio} Lates = 1 Absent
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                  <span className="text-xs text-zinc-500">FDA Cut-Limit Threshold:</span>
                  <span className="font-bold text-rose-700 text-xs">
                    Max {systemConfig.maxAbsenceThreshold} Absences
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Catalog */}
          <div
            className="stagger-block p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#7C1D26]" />
                <h4 className="font-bold text-sm text-zinc-950">
                  Registered University Departments ({systemConfig.departments.length})
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {systemConfig.departments.length === 0 ? (
                <p className="text-xs text-zinc-400">
                  No departments configured yet. Use “Configure Settings” to define the
                  university’s academic departments.
                </p>
              ) : (
                systemConfig.departments.map((dept) => (
                  <DepartmentBadge key={dept} department={dept} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminProvisionModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        existingUsers={users}
        departments={systemConfig.departments}
        onInstructorProvisioned={handleInstructorProvisioned}
      />

      <AdminTermConfigModal
        isOpen={isTermConfigModalOpen}
        onClose={() => setIsTermConfigModalOpen(false)}
        initialConfig={systemConfig}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
