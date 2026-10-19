"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import type {
  AcademicClass,
  AttendanceRecord,
  ExcuseRequest,
  GradeItem,
  JoinRequest,
  StudentGrade,
} from "@/types";
import {
  DEFAULT_GRADE_ITEMS,
  DEFAULT_STUDENT_GRADES,
  INITIAL_ATTENDANCE_RECORDS,
  DEFAULT_EXCUSE_REQUESTS,
} from "@/lib/roster/mock-roster";
import {
  computeStudentPersonalSummary,
  mergeStudentTimetable,
  type ExternalSubject,
} from "@/lib/student/student-portal-engine";
import { StudentClassDetailModal } from "./student-class-detail-modal";
import { StudentJoinClassModal } from "./student-join-class-modal";
import { StudentExternalClassModal } from "./student-external-class-modal";
import {
  GraduationCap,
  KeyRound,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  Plus,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export type StudentTab = "today" | "classes" | "timetable" | "requests";

export interface StudentHubProps {
  activeTab?: StudentTab;
  onTabChange?: (tab: StudentTab) => void;
}

export function StudentHub({
  activeTab: propActiveTab,
  onTabChange,
}: StudentHubProps = {}) {
  const { currentUser } = useAuth();

  // Active student identity
  const studentId = "stud_01"; // Sofia Aquino's ID in roster
  const studentNumber = currentUser.studentNumber || "2024-10821";
  const studentName = `${currentUser.firstName} ${currentUser.lastName}`;
  const program = "BSCS";
  const academicLevel = "3rd Year";

  // Sub-Navigation Tabs
  const [internalTab, setInternalTab] = useState<StudentTab>("today");
  const activeTab = propActiveTab ?? internalTab;
  const setActiveTab = (tab: StudentTab) => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Enrolled university classes
  const [enrolledClasses] = useState<AcademicClass[]>([
    {
      id: "cls_01",
      courseCode: "STAS",
      courseTitle: "Science, Technology and Society",
      section: "E106-R",
      classType: "Lecture",
      units: 3,
      term: "1st Semester 2026-2027",
      instructorId: "inst_01",
      joinCode: "STAS01",
      createdAt: "2026-10-01",
      updatedAt: "2026-10-01",
      schedule: [
        {
          dayOfWeek: "Friday",
          startTime: "09:00",
          endTime: "10:30",
          room: "Room 402",
        },
        {
          dayOfWeek: "Wednesday",
          startTime: "09:00",
          endTime: "10:30",
          room: "Room 402",
        },
      ],
    },
    {
      id: "cls_02",
      courseCode: "CS 312",
      courseTitle: "Algorithms & Complex Data Structures",
      section: "CS3A",
      classType: "Laboratory",
      units: 3,
      term: "1st Semester 2026-2027",
      instructorId: "inst_02",
      joinCode: "CS312A",
      createdAt: "2026-10-01",
      updatedAt: "2026-10-01",
      schedule: [
        {
          dayOfWeek: "Tuesday",
          startTime: "13:00",
          endTime: "15:00",
          room: "Lab 3",
        },
        {
          dayOfWeek: "Thursday",
          startTime: "13:00",
          endTime: "15:00",
          room: "Lab 3",
        },
      ],
    },
  ]);

  // Personal academic records
  const [attendanceRecords] = useState<AttendanceRecord[]>(
    INITIAL_ATTENDANCE_RECORDS
  );
  const [gradeItems] = useState<GradeItem[]>(DEFAULT_GRADE_ITEMS);
  const [studentGrades] = useState<StudentGrade[]>(DEFAULT_STUDENT_GRADES);
  const [excuseRequests, setExcuseRequests] = useState<ExcuseRequest[]>(
    DEFAULT_EXCUSE_REQUESTS
  );

  // External timetable subjects (DOCUMENTATION.md § 4.C.3)
  const [externalSubjects, setExternalSubjects] = useState<ExternalSubject[]>([
    {
      id: "ext_01",
      title: "PATHFIT 3 - Sports & Physical Fitness",
      dayOfWeek: "Monday",
      startTime: "10:00",
      endTime: "12:00",
      room: "University Gymnasium",
      color: "#059669",
    },
  ]);

  // Join Requests Tracker
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: "req_demo_01",
      classId: "cls_03",
      studentNumber,
      studentName,
      program,
      academicLevel,
      photoIdUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      status: "declined",
      rejectionReason: "Official pre-populated master roster quota for Section A is full. Please apply for Section B.",
      submittedAt: "2026-10-12 10:15 AM",
    },
  ]);

  // Modals state
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<AcademicClass | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [joinSuccessBanner, setJoinSuccessBanner] = useState<string | null>(null);

  // In-app notifications
  const [notifications] = useState([
    {
      id: "notif_1",
      title: "New Assessment Grade Recorded",
      body: "Dr. Joshua Aquino posted scores for Quiz 1: Scientific Revolution (STAS).",
      time: "2 hours ago",
      type: "grade",
    },
    {
      id: "notif_2",
      title: "Join Application Status",
      body: "Your application for MATH 201 was updated by instructor.",
      time: "1 day ago",
      type: "application",
    },
    {
      id: "notif_3",
      title: "Attendance Notice",
      body: "Today's roll-call for STAS has been completed.",
      time: "2 days ago",
      type: "attendance",
    },
  ]);

  // Unified timetable
  const unifiedTimetable = mergeStudentTimetable(enrolledClasses, externalSubjects);

  // Today's classes (active mock day is Friday / 2026-10-16)
  const todayClasses = enrolledClasses.filter((cls) =>
    cls.schedule.some((s) => s.dayOfWeek === "Friday")
  );

  const handleJoinSubmitted = (
    request: JoinRequest,
    courseName: string,
    instructorName: string
  ) => {
    setJoinRequests((prev) => [request, ...prev]);
    setJoinSuccessBanner(
      `Successfully sent a request to join the class "${courseName}" to Instructor ${instructorName}.`
    );
    setTimeout(() => setJoinSuccessBanner(null), 6000);
  };

  const handleFileExcuseRequest = (request: ExcuseRequest) => {
    setExcuseRequests((prev) => [request, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {joinSuccessBanner && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{joinSuccessBanner}</span>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div
        className="stagger-block flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border-l-4 border-l-[#7C1D26]"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7C1D26]">
            <GraduationCap className="w-4 h-4" />
            <span>Official University Student Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-950 mt-1 tracking-tight">
            Welcome, {studentName}
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Student Number: {studentNumber} • {program} ({academicLevel}) • {currentUser.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2.5 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition shadow-xs cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C1D26]" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 p-4 z-40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-900">Notifications</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Real-Time Alerts</span>
                </div>
                <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="pt-2 text-xs">
                      <p className="font-bold text-zinc-900">{n.title}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{n.body}</p>
                      <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Join Class Launcher Button */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Join a Class</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div
        className="stagger-block flex items-center gap-2 border-b border-zinc-200/80 pb-1"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "today"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>&quot;Today&quot; Hub</span>
        </button>

        <button
          onClick={() => setActiveTab("classes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "classes"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Enrolled Classes ({enrolledClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("timetable")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "timetable"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "requests"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Requests &amp; Excuses</span>
          {joinRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold">
              {joinRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================= */}
      {/* TAB 1: TODAY'S DASHBOARD (DOCUMENTATION.md § 4.C.2)     */}
      {/* ======================================================= */}
      {activeTab === "today" && (
        <div className="space-y-6">
          <div
            className="stagger-block flex items-center justify-between"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div>
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Today&apos;s Scheduled Classes &amp; Real-Time Standing
              </h2>
              <p className="text-xs text-zinc-500">
                Friday, October 16, 2026 • Live attendance status &amp; daily assessment results
              </p>
            </div>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="text-xs font-bold text-[#7C1D26] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Have a new join code?</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {todayClasses.map((cls, idx) => {
              const summary = computeStudentPersonalSummary({
                studentId,
                classId: cls.id,
                attendanceRecords,
                gradeItems,
                studentGrades,
              });

              // Check if attendance exists today (2026-10-16)
              const todayRecord = attendanceRecords.find(
                (a) => a.classId === cls.id && a.studentId === studentId && a.date === "2026-10-16"
              );

              // Check if any grade was posted today
              const todayGradesList = gradeItems
                .filter((g) => g.classId === cls.id && g.date === "2026-10-16")
                .map((g) => {
                  const scoreObj = studentGrades.find(
                    (sg) => sg.gradeItemId === g.id && sg.studentId === studentId
                  );
                  return { title: g.title, maxScore: g.maxScore, score: scoreObj?.score };
                });

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassForDetail(cls)}
                  className="stagger-block p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-[#7C1D26]/40 transition space-y-5 cursor-pointer group"
                  style={{ "--i": 3 + idx } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2.5 py-0.5 rounded border border-[#7C1D26]/20">
                          {cls.courseCode} • {cls.section}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {cls.classType}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-950 mt-2 group-hover:text-[#7C1D26] transition">
                        {cls.courseTitle}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span>Room 402</span>
                        <span>•</span>
                        <span>09:00 AM - 10:30 AM</span>
                      </p>
                    </div>

                    <span className="p-2 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-[#7C1D26] group-hover:bg-[#7C1D26]/10 transition">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Today's Live Status Indicators */}
                  <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-600">Today&apos;s Roll-Call Status:</span>
                      {todayRecord ? (
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-xs border ${
                            todayRecord.status === "P"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : todayRecord.status === "L"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : todayRecord.status === "E"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {todayRecord.status === "P"
                            ? "Present (P)"
                            : todayRecord.status === "L"
                            ? "Late (L)"
                            : todayRecord.status === "E"
                            ? "Excused (E)"
                            : "Absent (A)"}
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-mono text-[11px] italic">
                          Roll-call in progress
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-600">Assessments Today:</span>
                      {todayGradesList.length > 0 ? (
                        <div className="text-right">
                          {todayGradesList.map((tg, idx) => (
                            <span key={idx} className="font-mono font-bold text-zinc-900 block">
                              {tg.score !== null && tg.score !== undefined
                                ? `${tg.score}/${tg.maxScore} pts`
                                : "Unrecorded"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">No assessments dated today</span>
                      )}
                    </div>
                  </div>

                  {/* Overall Standing Footer */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-100">
                    <span className="text-zinc-500">
                      Overall Standing: <strong className="text-zinc-900">{summary.grades.finalGrade}%</strong> ({summary.grades.letterGrade})
                    </span>
                    <span className="text-[#7C1D26] font-bold text-[11px] flex items-center gap-1">
                      <span>View My Records</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
            <div>
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                My Enrolled Classes &amp; Academic Performance
              </h2>
              <p className="text-xs text-zinc-500">
                Click any class card to view your complete personal attendance history, excused slips, and grade breakdown.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrolledClasses.map((cls, idx) => {
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
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2.5 py-0.5 rounded border border-[#7C1D26]/20">
                          {cls.courseCode} • {cls.section}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {cls.classType}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-950 mt-1.5 group-hover:text-[#7C1D26] transition">
                        {cls.courseTitle}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {cls.units} Units • {cls.term}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
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
                    <div>
                      <p className="text-[10px] font-bold uppercase text-zinc-400">Attendance</p>
                      <p className="text-sm font-bold font-mono text-zinc-950 mt-0.5">
                        {summary.attendance.attendanceRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-zinc-400">Current Standing</p>
                      <p className="text-sm font-bold font-mono text-zinc-950 mt-0.5">
                        {summary.grades.finalGrade !== null ? `${summary.grades.finalGrade}%` : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-zinc-400">PH University Mark</p>
                      <p className="text-sm font-black font-mono text-[#7C1D26] mt-0.5">
                        {summary.grades.letterGrade}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>{summary.attendance.effectiveAbsences} effective absences recorded</span>
                    <span className="text-[#7C1D26] font-bold text-xs flex items-center gap-1">
                      <span>Full Record</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C1D26]">
                  Personal College Timetable
                </span>
                <span className="text-[10px] font-mono bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-semibold">
                  Unified Schedule
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-950 mt-0.5">
                Weekly Class &amp; Subject Schedule
              </h2>
              <p className="text-xs text-zinc-500">
                Plots all enrolled courses and manual external subjects. Click any enrolled subject block to open your personal class view.
              </p>
            </div>

            <button
              onClick={() => setIsExternalModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-zinc-200 hover:border-[#7C1D26]/40 hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#7C1D26]" />
              <span>Add External Subject</span>
            </button>
          </div>

          {/* Timetable Grid */}
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#7C1D26]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.dayOfWeek}</span>
                  </div>
                  {item.isExternal ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Manual External
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-950">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{item.startTime} - {item.endTime}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{item.room}</span>
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
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 4: JOIN REQUESTS & EXCUSES TRACKER                  */}
      {/* ======================================================= */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div
            className="stagger-block flex items-center justify-between"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div>
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Class Join Applications &amp; Excuse Slip Resolutions
              </h2>
              <p className="text-xs text-zinc-500">
                Track status of sent class requests and view instructor feedback or decline remarks.
              </p>
            </div>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Join Request</span>
            </button>
          </div>

          <div
            className="stagger-block space-y-4"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Submitted Class Join Applications
            </h3>
            <div className="divide-y divide-zinc-100 bg-white rounded-2xl border border-zinc-200">
              {joinRequests.length === 0 ? (
                <p className="p-6 text-xs text-zinc-400 text-center">No pending or historical class requests.</p>
              ) : (
                joinRequests.map((req) => (
                  <div key={req.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-900">
                          Class Application #{req.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
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
                      <span className="text-[11px] font-mono text-zinc-400">{req.submittedAt}</span>
                    </div>

                    {req.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                        <strong className="block mb-0.5">Instructor Remarks:</strong>
                        <span>{req.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Class Personal Record Detail Modal */}
      {selectedClassForDetail && (
        <StudentClassDetailModal
          isOpen={true}
          onClose={() => setSelectedClassForDetail(null)}
          academicClass={selectedClassForDetail}
          studentId={studentId}
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
