"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useAuth } from "@/features/auth/auth-context";
import type {
  AcademicClass,
  AttendanceRecord,
  ExcuseRequest,
  GradeItem,
  JoinRequest,
  Notification,
  RosterStudent,
  StudentGrade,
} from "@/types";
import {
  computeStudentPersonalSummary,
  mergeStudentTimetable,
  type ExternalSubject,
} from "@/lib/student/student-portal-engine";
import { formatTime12Hour } from "@/lib/schedule/timetable-engine";
import { listVisibleClasses } from "@/lib/data/classes";
import { listMyJoinRequests, listMyRosterEntries } from "@/lib/data/roster";
import {
  listAttendanceForClasses,
  listExcusesForClasses,
  submitExcuse,
} from "@/lib/data/attendance";
import {
  listGradeItemsForClasses,
  listStudentGradesForClasses,
} from "@/lib/data/grades";
import { appCache } from "@/lib/cache/data-cache";
import {
  listNotifications,
  markNotificationRead,
  subscribeToNotifications,
} from "@/lib/data/notifications";
import { EmptyState } from "./empty-state";
import { StudentClassDetailModal } from "./student-class-detail-modal";
import { StudentJoinClassModal } from "./student-join-class-modal";
import { StudentExternalClassModal } from "./student-external-class-modal";
import { parseDepartment } from "@/lib/auth/auth-engine";
import {
  GraduationCap,
  KeyRound,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  Plus,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export type StudentTab = "today" | "classes" | "timetable" | "requests";

export interface StudentHubProps {
  activeTab?: StudentTab;
}

const emptySubscribe = () => () => {};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Local-time ISO date (YYYY-MM-DD) so "today" matches the user's calendar. */
function toLocalISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Human-readable relative time for a notification timestamp. */
function formatRelativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Reads the four attendance statuses without inventing new ones. */
function attendanceStatusLabel(status: AttendanceRecord["status"]): string {
  if (status === "P") return "Present (P)";
  if (status === "L") return "Late (L)";
  if (status === "E") return "Excused (E)";
  return "Absent (A)";
}

export function StudentHub({ activeTab = "today" }: StudentHubProps = {}) {
  const { currentUser, supabase } = useAuth();

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [enrolledClasses, setEnrolledClasses] = useState<AcademicClass[]>([]);
  const [rosterEntries, setRosterEntries] = useState<RosterStudent[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [excuseRequests, setExcuseRequests] = useState<ExcuseRequest[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // External subjects are local-only (no table) and never seeded with samples.
  const [externalSubjects, setExternalSubjects] = useState<ExternalSubject[]>([]);

  // Modals state
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<AcademicClass | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [joinSuccessBanner, setJoinSuccessBanner] = useState<string | null>(null);

  // The student's roster row per class carries the real identity used by
  // attendance and grade records (the roster row id is the `studentId`).
  const rosterByClass = useMemo(() => {
    const map = new Map<string, RosterStudent>();
    for (const entry of rosterEntries) map.set(entry.classId, entry);
    return map;
  }, [rosterEntries]);

  const rosterIdForClass = (classId: string) => rosterByClass.get(classId)?.id ?? "";

  const studentName =
    `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim();
  const primaryRoster = rosterEntries[0];
  const studentNumber =
    primaryRoster?.studentNumber ?? currentUser?.studentNumber ?? "";
  const program = primaryRoster?.program ?? currentUser?.department ?? "";
  const academicLevel = primaryRoster?.academicLevel ?? "";

  // Load the whole portal from Supabase whenever the signed-in user is ready.
  useEffect(() => {
    if (!supabase || !currentUser) return;

    let cancelled = false;
    const cacheKey = `student_portal_bundle_${currentUser.id}`;

    void (async () => {
      // SWR: serve immediately from cache to eliminate blank loading screens
      const cached = appCache.get<{
        classes: AcademicClass[];
        roster: RosterStudent[];
        attendance: AttendanceRecord[];
        items: GradeItem[];
        grades: StudentGrade[];
        excuses: ExcuseRequest[];
        requests: JoinRequest[];
      }>(cacheKey);

      if (cached) {
        setEnrolledClasses(cached.classes);
        setRosterEntries(cached.roster);
        setAttendanceRecords(cached.attendance);
        setGradeItems(cached.items);
        setStudentGrades(cached.grades);
        setExcuseRequests(cached.excuses);
        setJoinRequests(cached.requests);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);
      try {
        const classes = await listVisibleClasses(supabase);
        const roster = await listMyRosterEntries(supabase, currentUser.id);
        const classIds = classes.map((c) => c.id);

        // Single-round batch queries replacing the 4 * N per-class waterfall
        const [attendance, items, grades, excuses, requests] = await Promise.all([
          listAttendanceForClasses(supabase, classIds),
          listGradeItemsForClasses(supabase, classIds),
          listStudentGradesForClasses(supabase, classIds),
          listExcusesForClasses(supabase, classIds),
          listMyJoinRequests(supabase, currentUser.id),
        ]);

        if (cancelled) return;

        setEnrolledClasses(classes);
        setRosterEntries(roster);
        setAttendanceRecords(attendance);
        setGradeItems(items);
        setStudentGrades(grades);
        setExcuseRequests(excuses);
        setJoinRequests(requests);

        appCache.set(
          cacheKey,
          {
            classes,
            roster,
            attendance,
            items,
            grades,
            excuses,
            requests,
          },
          30_000,
          [`student-${currentUser.id}`]
        );
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error ? err.message : "Unable to load your student portal."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, currentUser]);

  // Live notifications: initial load + realtime INSERT stream.
  useEffect(() => {
    if (!supabase || !currentUser) return;
    let cancelled = false;

    void (async () => {
      try {
        const items = await listNotifications(supabase, currentUser.id);
        if (!cancelled) setNotifications(items);
      } catch {
        // Notifications are non-critical; the empty state covers failures.
      }
    })();

    const unsubscribe = subscribeToNotifications(
      supabase,
      currentUser.id,
      (notification) => setNotifications((prev) => [notification, ...prev])
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [supabase, currentUser]);

  const reloadJoinRequests = useCallback(async () => {
    if (!supabase || !currentUser) return;
    try {
      setJoinRequests(await listMyJoinRequests(supabase, currentUser.id));
    } catch {
      // Keep the existing list on a transient failure.
    }
  }, [supabase, currentUser]);

  const today = isMounted ? new Date() : null;
  const todayWeekday = today ? WEEKDAY_NAMES[today.getDay()] : "";
  const todayISO = today ? toLocalISODate(today) : "";
  const todayLabel = today
    ? today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const unifiedTimetable = mergeStudentTimetable(enrolledClasses, externalSubjects);

  const todayClasses = today
    ? enrolledClasses.filter((cls) =>
        cls.schedule.some((block) => block.dayOfWeek === todayWeekday)
      )
    : [];

  const hasUnreadNotifications = notifications.some((n) => !n.isRead);

  const handleToggleNotifications = () => {
    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);
    if (nextOpen && supabase) {
      const unread = notifications.filter((n) => !n.isRead);
      if (unread.length > 0) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        void Promise.all(
          unread.map((n) => markNotificationRead(supabase, n.id).catch(() => {}))
        );
      }
    }
  };

  const handleJoinSubmitted = (courseName: string) => {
    if (currentUser) appCache.invalidateTag(`student-${currentUser.id}`);
    setJoinSuccessBanner(
      `Application sent to join "${courseName}". Your instructor will review and approve your enrolment.`
    );
    setTimeout(() => setJoinSuccessBanner(null), 6000);
    void reloadJoinRequests();
  };

  const handleFileExcuseRequest = (request: ExcuseRequest) => {
    if (currentUser) appCache.invalidateTag(`student-${currentUser.id}`);
    setExcuseRequests((prev) => [request, ...prev]);
    if (!supabase || !currentUser) return;
    void submitExcuse(supabase, {
      classId: request.classId,
      studentId: request.studentId,
      submittedBy: currentUser.id,
      studentName: request.studentName,
      studentNumber: request.studentNumber,
      date: request.date,
      reason: request.reason,
      documentUrl: request.documentUrl,
    }).catch(() => {
      // A reload reconciles any server-side rejection.
    });
  };

  const joinClassEmptyState = (
    <EmptyState
      icon={<GraduationCap className="w-6 h-6" />}
      title="No classes joined yet"
      description="Join your first class with the join code from your instructor to unlock attendance, grades, and your personal timetable."
      action={
        <button
          type="button"
          onClick={() => setIsJoinModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 hover:bg-[#5E141B] transition cursor-pointer whitespace-nowrap"
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          <span>Join a Class</span>
        </button>
      }
    />
  );

  const loadingState = (
    <div className="flex items-center justify-center gap-2 py-12 text-xs font-semibold text-zinc-500">
      <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
      Loading your portal…
    </div>
  );

  const deptParsed = parseDepartment(program);
  const desktopProgramLabel = deptParsed.name
    ? (academicLevel ? `${deptParsed.name} (${academicLevel})` : deptParsed.name)
    : (academicLevel ? `${program} (${academicLevel})` : program);
  const mobileProgramLabel = deptParsed.code
    ? (academicLevel ? `${deptParsed.code} (${academicLevel})` : deptParsed.code)
    : (academicLevel ? `${program} (${academicLevel})` : program);

  const desktopMetaParts = [
    studentNumber ? `Student Number: ${studentNumber}` : null,
    desktopProgramLabel || null,
    currentUser?.email ?? null,
  ].filter(Boolean) as string[];

  const mobileMetaParts = [
    studentNumber ? `ID: ${studentNumber}` : null,
    mobileProgramLabel || null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {joinSuccessBanner && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <span className="min-w-0 break-words">{joinSuccessBanner}</span>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div
        className="stagger-block flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border-l-4 border-l-[#7C1D26]"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7C1D26]">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="min-w-0 truncate">Official University Student Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-950 mt-1 tracking-tight truncate">
            Welcome{studentName ? `, ${studentName}` : ""}
          </h1>
          {(desktopMetaParts.length > 0 || mobileMetaParts.length > 0) && (
            <p className="text-xs text-zinc-500 mt-1 font-mono truncate">
              <span className="hidden sm:inline">{desktopMetaParts.join(" • ")}</span>
              <span className="sm:hidden">{mobileMetaParts.join(" • ")}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="p-2.5 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition shadow-xs cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C1D26]" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-zinc-200 p-4 z-40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-900">Notifications</span>
                  <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                    Real-Time Alerts
                  </span>
                </div>
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-zinc-400">
                    No notifications yet
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="pt-2 text-xs">
                        <p className="font-bold text-zinc-900 truncate">{n.title}</p>
                        {n.body && (
                          <p className="text-zinc-500 text-[11px] mt-0.5">{n.body}</p>
                        )}
                        <span className="text-[10px] text-zinc-400 font-mono mt-1 block whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Join Class Launcher Button */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap"
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>Join a Class</span>
          </button>
        </div>
      </div>

      {/* Load error banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 1: TODAY'S DASHBOARD (DOCUMENTATION.md § 4.C.2)     */}
      {/* ======================================================= */}
      {activeTab === "today" && (
        <div className="space-y-6">
          <div
            className="stagger-block flex items-center justify-between"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Today&apos;s Scheduled Classes &amp; Real-Time Standing
              </h2>
              <p className="text-xs text-zinc-500 truncate">
                {todayLabel ? `${todayLabel} • ` : ""}Live attendance status &amp; daily
                assessment results
              </p>
            </div>
          </div>

          {isLoading ? (
            loadingState
          ) : enrolledClasses.length === 0 ? (
            joinClassEmptyState
          ) : todayClasses.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="No classes scheduled today"
              description="You have no classes on your timetable for today. Check the Classes and Timetable tabs for the rest of your week."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {todayClasses.map((cls, idx) => {
                const studentId = rosterIdForClass(cls.id);
                const summary = computeStudentPersonalSummary({
                  studentId,
                  classId: cls.id,
                  attendanceRecords,
                  gradeItems,
                  studentGrades,
                });

                const todayBlock = cls.schedule.find(
                  (block) => block.dayOfWeek === todayWeekday
                );

                const todayRecord = attendanceRecords.find(
                  (a) =>
                    a.classId === cls.id &&
                    a.studentId === studentId &&
                    a.date === todayISO
                );

                const todayGradesList = gradeItems
                  .filter((g) => g.classId === cls.id && g.date === todayISO)
                  .map((g) => {
                    const scoreObj = studentGrades.find(
                      (sg) => sg.gradeItemId === g.id && sg.studentId === studentId
                    );
                    return {
                      id: g.id,
                      title: g.title,
                      maxScore: g.maxScore,
                      score: scoreObj?.score,
                    };
                  });

                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassForDetail(cls)}
                    className="stagger-block p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-[#7C1D26]/40 transition space-y-5 cursor-pointer group"
                    style={{ "--i": 3 + idx } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2.5 py-0.5 rounded border border-[#7C1D26]/20 whitespace-nowrap">
                            {cls.courseCode} • {cls.section}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 whitespace-nowrap">
                            {cls.classType}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-950 mt-2 group-hover:text-[#7C1D26] transition truncate">
                          {cls.courseTitle}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span className="truncate">{todayBlock?.room ?? "TBA"}</span>
                          <span>•</span>
                          <span className="whitespace-nowrap">
                            {todayBlock
                              ? `${formatTime12Hour(todayBlock.startTime)} - ${formatTime12Hour(todayBlock.endTime)}`
                              : "Schedule TBA"}
                          </span>
                        </p>
                      </div>

                      <span className="p-2 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-[#7C1D26] group-hover:bg-[#7C1D26]/10 transition">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    </div>

                    {/* Today's Live Status Indicators */}
                    <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-zinc-600">
                          Today&apos;s Roll-Call Status:
                        </span>
                        {todayRecord ? (
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-xs border whitespace-nowrap ${
                              todayRecord.status === "P"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : todayRecord.status === "L"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : todayRecord.status === "E"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {attendanceStatusLabel(todayRecord.status)}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px] italic whitespace-nowrap">
                            Roll-call in progress
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-zinc-600">Assessments Today:</span>
                        {todayGradesList.length > 0 ? (
                          <div className="text-right">
                            {todayGradesList.map((tg) => (
                              <span
                                key={tg.id}
                                className="font-mono font-bold text-zinc-900 block whitespace-nowrap"
                              >
                                {tg.score !== null && tg.score !== undefined
                                  ? `${tg.score}/${tg.maxScore} pts`
                                  : "Unrecorded"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] whitespace-nowrap">
                            No assessments dated today
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Overall Standing Footer */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-zinc-100">
                      <span className="text-zinc-500 truncate">
                        Overall Standing:{" "}
                        <strong className="text-zinc-900">
                          {summary.grades.finalGrade !== null
                            ? `${summary.grades.finalGrade}%`
                            : "--"}
                        </strong>{" "}
                        ({summary.grades.letterGrade})
                      </span>
                      <span className="text-[#7C1D26] font-bold text-[11px] flex items-center gap-1 whitespace-nowrap">
                        <span>View My Records</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 2: MY ENROLLED CLASSES (PERSONAL ACADEMIC RECORDS)   */}
      {/* ======================================================= */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          <div
            className="stagger-block flex items-center justify-between"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                My Enrolled Classes &amp; Academic Performance
              </h2>
              <p className="text-xs text-zinc-500">
                Click any class card to view your complete personal attendance history,
                excused slips, and grade breakdown.
              </p>
            </div>
          </div>

          {isLoading ? (
            loadingState
          ) : enrolledClasses.length === 0 ? (
            joinClassEmptyState
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrolledClasses.map((cls, idx) => {
                const studentId = rosterIdForClass(cls.id);
                const summary = computeStudentPersonalSummary({
                  studentId,
                  classId: cls.id,
                  attendanceRecords,
                  gradeItems,
                  studentGrades,
                });

                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassForDetail(cls)}
                    className="stagger-block p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-[#7C1D26]/40 transition space-y-4 cursor-pointer group"
                    style={{ "--i": 3 + idx } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2.5 py-0.5 rounded border border-[#7C1D26]/20 whitespace-nowrap">
                            {cls.courseCode} • {cls.section}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 whitespace-nowrap">
                            {cls.classType}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-950 mt-1.5 group-hover:text-[#7C1D26] transition truncate">
                          {cls.courseTitle}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          {cls.units} Units • {cls.term}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${
                          summary.attendance.fdaStanding === "SAFE"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : summary.attendance.fdaStanding === "WARNING"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {summary.attendance.fdaStanding === "SAFE"
                          ? "Good Standing"
                          : summary.attendance.fdaStanding === "WARNING"
                          ? "Near Cut Limit"
                          : "FDA Risk"}
                      </span>
                    </div>

                    {/* Attendance & Grade Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/60 text-center">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 truncate">
                          Attendance
                        </p>
                        <p className="text-sm font-bold font-mono text-zinc-950 mt-0.5">
                          {summary.attendance.attendanceRate}%
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 truncate">
                          Current Standing
                        </p>
                        <p className="text-sm font-bold font-mono text-zinc-950 mt-0.5">
                          {summary.grades.finalGrade !== null
                            ? `${summary.grades.finalGrade}%`
                            : "--"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 truncate">
                          PH University Mark
                        </p>
                        <p className="text-sm font-black font-mono text-[#7C1D26] mt-0.5">
                          {summary.grades.letterGrade}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                      <span className="truncate">
                        {summary.attendance.effectiveAbsences} effective absences recorded
                      </span>
                      <span className="text-[#7C1D26] font-bold text-xs flex items-center gap-1 whitespace-nowrap">
                        <span>Full Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 3: INTERACTIVE VISUAL TIMETABLE (DOCUMENTATION §4.C) */}
      {/* ======================================================= */}
      {activeTab === "timetable" && (
        <div className="space-y-6">
          <div
            className="stagger-block flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-50 border border-zinc-200/80"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C1D26] whitespace-nowrap">
                  Personal College Timetable
                </span>
                <span className="text-[10px] font-mono bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                  Unified Schedule
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-950 mt-0.5">
                Weekly Class &amp; Subject Schedule
              </h2>
              <p className="text-xs text-zinc-500">
                Plots all enrolled courses and manual external subjects. Click any enrolled
                subject block to open your personal class view.
              </p>
            </div>

            <button
              onClick={() => setIsExternalModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 hover:border-[#7C1D26]/40 hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#7C1D26] shrink-0" />
              <span>Add External Subject</span>
            </button>
          </div>

          {isLoading ? (
            loadingState
          ) : unifiedTimetable.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="Your timetable is empty"
              description="Join a class to see its weekly schedule here. You can also add external subjects for courses outside the platform."
              action={
                <button
                  type="button"
                  onClick={() => setIsExternalModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 hover:bg-[#5E141B] transition cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add External Subject</span>
                </button>
              }
            />
          ) : (
            <div
              className="stagger-block grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              {unifiedTimetable.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isExternal && item.classId) {
                      const found = enrolledClasses.find((c) => c.id === item.classId);
                      if (found) setSelectedClassForDetail(found);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition space-y-3 ${
                    item.isExternal
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-white border-zinc-200/80 hover:shadow-md hover:border-[#7C1D26]/40 cursor-pointer"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#7C1D26] whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.dayOfWeek}</span>
                    </div>
                    {item.isExternal ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                        Manual External
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                        {item.code}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-zinc-950 truncate">{item.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1 font-mono whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>
                          {formatTime12Hour(item.startTime)} -{" "}
                          {formatTime12Hour(item.endTime)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{item.room}</span>
                      </span>
                    </div>
                  </div>

                  {!item.isExternal && (
                    <p className="text-[10px] text-[#7C1D26] font-bold pt-2 border-t border-zinc-100 flex items-center gap-1">
                      <span>Click to view personal records</span>
                      <ArrowRight className="w-3 h-3" />
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 4: JOIN REQUESTS & EXCUSES TRACKER                  */}
      {/* ======================================================= */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="stagger-block" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Class Join Applications &amp; Excuse Slip Resolutions
              </h2>
              <p className="text-xs text-zinc-500">
                Track status of sent class requests and view instructor feedback or decline
                remarks.
              </p>
            </div>
          </div>

          {isLoading ? (
            loadingState
          ) : joinRequests.length === 0 ? (
            <EmptyState
              icon={<KeyRound className="w-6 h-6" />}
              title="No join applications yet"
              description="Applications you send to join a class appear here with their approval status."
            />
          ) : (
            <div
              className="stagger-block space-y-4"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Submitted Class Join Applications
              </h3>
              <div className="divide-y divide-zinc-100 bg-white rounded-2xl border border-zinc-200">
                {joinRequests.map((req) => (
                  <div key={req.id} className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-xs text-zinc-900 truncate">
                          Class Application #{req.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap ${
                            req.status === "approved"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : req.status === "declined"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                        {formatRelativeTime(req.submittedAt)}
                      </span>
                    </div>

                    {req.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                        <strong className="block mb-0.5">Instructor Remarks:</strong>
                        <span>{req.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Class Personal Record Detail Modal */}
      {selectedClassForDetail && (
        <StudentClassDetailModal
          isOpen={true}
          onClose={() => setSelectedClassForDetail(null)}
          academicClass={selectedClassForDetail}
          studentId={rosterIdForClass(selectedClassForDetail.id)}
          studentName={studentName}
          studentNumber={studentNumber}
          attendanceRecords={attendanceRecords}
          gradeItems={gradeItems}
          studentGrades={studentGrades}
          excuseRequests={excuseRequests}
          onFileExcuseRequest={handleFileExcuseRequest}
        />
      )}

      {/* Join Class Modal */}
      <StudentJoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        availableClasses={enrolledClasses}
        studentNumber={studentNumber}
        studentName={studentName}
        program={program}
        academicLevel={academicLevel}
        onJoinSubmitted={handleJoinSubmitted}
      />

      {/* External Manual Subject Modal */}
      <StudentExternalClassModal
        isOpen={isExternalModalOpen}
        onClose={() => setIsExternalModalOpen(false)}
        onAddExternalSubject={(subj) => setExternalSubjects((prev) => [...prev, subj])}
      />
    </div>
  );
}
