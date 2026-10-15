"use client";

import React, { useState } from "react";
import type { AcademicClass, AttendanceRecord, AttendanceStatus, RosterStudent } from "@/types";
import { DEFAULT_ROSTER } from "@/lib/roster/mock-roster";
import { calculateAttendanceMetrics } from "@/lib/attendance/attendance-engine";
import { RapidRollCallOverlay } from "./rapid-roll-call-overlay";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  Sparkles,
  Calendar,
  Search,
  AlertTriangle,
  Check,
} from "lucide-react";

interface ClassAttendanceSheetProps {
  academicClass: AcademicClass;
  autoLaunchRollCall?: boolean;
}

const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Session 1: 2026-10-09
  { id: "att_1", classId: "cls_01", studentId: "stud_01", date: "2026-10-09", status: "P", createdAt: "2026-10-09T09:00:00Z" },
  { id: "att_2", classId: "cls_01", studentId: "stud_02", date: "2026-10-09", status: "P", createdAt: "2026-10-09T09:00:00Z" },
  { id: "att_3", classId: "cls_01", studentId: "stud_03", date: "2026-10-09", status: "L", note: "Traffic along Commonwealth", createdAt: "2026-10-09T09:15:00Z" },
  { id: "att_4", classId: "cls_01", studentId: "stud_04", date: "2026-10-09", status: "P", createdAt: "2026-10-09T09:00:00Z" },
  { id: "att_5", classId: "cls_01", studentId: "stud_05", date: "2026-10-09", status: "A", note: "No notice provided", createdAt: "2026-10-09T09:00:00Z" },

  // Session 2: 2026-10-14
  { id: "att_6", classId: "cls_01", studentId: "stud_01", date: "2026-10-14", status: "P", createdAt: "2026-10-14T09:00:00Z" },
  { id: "att_7", classId: "cls_01", studentId: "stud_02", date: "2026-10-14", status: "E", note: "University Debate Championship", createdAt: "2026-10-14T09:00:00Z" },
  { id: "att_8", classId: "cls_01", studentId: "stud_03", date: "2026-10-14", status: "P", createdAt: "2026-10-14T09:00:00Z" },
  { id: "att_9", classId: "cls_01", studentId: "stud_04", date: "2026-10-14", status: "L", note: "Bus breakdown", createdAt: "2026-10-14T09:20:00Z" },
  { id: "att_10", classId: "cls_01", studentId: "stud_05", date: "2026-10-14", status: "A", note: "Absent without permit", createdAt: "2026-10-14T09:00:00Z" },
];

const SESSION_DATES = ["2026-10-09", "2026-10-14", "2026-10-16"];

export function ClassAttendanceSheet({
  academicClass,
  autoLaunchRollCall = false,
}: ClassAttendanceSheetProps) {
  const [students] = useState<RosterStudent[]>(DEFAULT_ROSTER);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [sessionDates, setSessionDates] = useState<string[]>(SESSION_DATES);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-16");
  const [isRollCallOpen, setIsRollCallOpen] = useState(autoLaunchRollCall);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionType, setSessionType] = useState<
    "regular" | "makeup" | "holiday" | "suspended" | "instructor_absence"
  >("regular");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Alphabetically sorted students
  const sortedStudents = [...students].sort((a, b) => {
    const lastNameDiff = a.lastName.localeCompare(b.lastName);
    if (lastNameDiff !== 0) return lastNameDiff;
    return a.firstName.localeCompare(b.firstName);
  });

  const filteredStudents = sortedStudents.filter((s) => {
    const full = `${s.lastName} ${s.firstName} ${s.studentNumber} ${s.program}`.toLowerCase();
    return full.includes(searchQuery.toLowerCase());
  });

  // Handle saving attendance from Rapid Roll-Call
  const handleSaveRollCall = (newRecords: AttendanceRecord[]) => {
    setRecords((prev) => {
      // Remove any existing records for this class and date, then append new ones
      const filtered = prev.filter(
        (r) => !(r.classId === academicClass.id && r.date === selectedDate)
      );
      return [...filtered, ...newRecords];
    });

    // Ensure selectedDate is in sessionDates
    if (!sessionDates.includes(selectedDate)) {
      setSessionDates((prev) => [...prev, selectedDate].sort());
    }

    setSaveSuccessMsg(`Roll-call committed successfully for ${selectedDate} (${newRecords.length} records).`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Toggle single student status on cell click
  const handleCellToggle = (studentId: string, date: string) => {
    const existing = records.find(
      (r) => r.studentId === studentId && r.date === date && r.classId === academicClass.id
    );

    const nextStatus: Record<string, AttendanceStatus> = {
      P: "L",
      L: "E",
      E: "A",
      A: "P",
    };

    const newStatus: AttendanceStatus = existing ? nextStatus[existing.status] || "P" : "P";

    setRecords((prev) => {
      const remaining = prev.filter(
        (r) => !(r.studentId === studentId && r.date === date && r.classId === academicClass.id)
      );
      return [
        ...remaining,
        {
          id: `att_${academicClass.id}_${studentId}_${date}`,
          classId: academicClass.id,
          studentId,
          date,
          status: newStatus,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  // Compute stats for selected date
  const recordsForDate = records.filter(
    (r) => r.classId === academicClass.id && r.date === selectedDate
  );
  const presentCount = recordsForDate.filter((r) => r.status === "P").length;
  const lateCount = recordsForDate.filter((r) => r.status === "L").length;
  const excusedCount = recordsForDate.filter((r) => r.status === "E").length;
  const absentCount = recordsForDate.filter((r) => r.status === "A").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Primary Toolbar & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-50 border border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C1D26]">
              Attendance Management
            </span>
            <span className="text-[10px] font-mono bg-zinc-200/80 text-zinc-700 px-2 py-0.5 rounded">
              3 Late = 1 Absence Policy
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-950 mt-0.5">
            Master Attendance Sheet & Roll-Call Engine
          </h2>
          <p className="text-xs text-zinc-500">
            View full historical attendance matrix or launch rapid single-key roll-call spotlight.
          </p>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRollCallOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Rapid Roll-Call</span>
          </button>
        </div>
      </div>

      {/* Session Controls & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 mr-1">
            <Calendar className="w-4 h-4 text-[#7C1D26]" />
            <span>Active Session Date:</span>
          </div>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-800 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#7C1D26] cursor-pointer"
          >
            {sessionDates.map((d) => (
              <option key={d} value={d}>
                {d} {d === "2026-10-16" ? "(Today)" : ""}
              </option>
            ))}
          </select>

          {/* Session Classification Toggle (DOCUMENTATION.md § 4.B.TAB 2) */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-[11px] font-medium text-zinc-600">
            <button
              onClick={() => setSessionType("regular")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                sessionType === "regular" ? "bg-white text-zinc-900 font-bold shadow-xs" : "hover:text-zinc-900"
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => setSessionType("makeup")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                sessionType === "makeup" ? "bg-white text-zinc-900 font-bold shadow-xs" : "hover:text-zinc-900"
              }`}
            >
              Make-up
            </button>
            <button
              onClick={() => setSessionType("holiday")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                sessionType === "holiday" ? "bg-white text-zinc-900 font-bold shadow-xs" : "hover:text-zinc-900"
              }`}
            >
              Holiday
            </button>
            <button
              onClick={() => setSessionType("suspended")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                sessionType === "suspended" ? "bg-white text-zinc-900 font-bold shadow-xs" : "hover:text-zinc-900"
              }`}
            >
              Suspended
            </button>
            <button
              onClick={() => setSessionType("instructor_absence")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                sessionType === "instructor_absence"
                  ? "bg-[#7C1D26] text-white font-bold shadow-xs"
                  : "hover:text-zinc-900"
              }`}
              title="Official instructor self-absence (does not penalize students)"
            >
              Faculty Self-Absence
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition"
          />
        </div>
      </div>

      {/* Date Metrics Pill Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Class Enrolled</span>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{students.length} Students</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Present (P)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-900 mt-0.5">{presentCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800">Late (L)</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-900 mt-0.5">{lateCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-800">Excused (E)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-900 mt-0.5">{excusedCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-800">Absent (A)</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-900 mt-0.5">{absentCount}</p>
        </div>
      </div>

      {/* Master Grid Table View (DOCUMENTATION.md § 4.B.TAB 2) */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 w-32 font-mono">Student ID</th>
                <th className="py-3.5 px-4 min-w-[200px]">Student Name</th>
                <th className="py-3.5 px-3 w-28">Program</th>
                {sessionDates.map((date) => (
                  <th
                    key={date}
                    className={`py-3.5 px-3 w-24 text-center font-mono ${
                      date === selectedDate ? "bg-[#7C1D26]/5 text-[#7C1D26]" : ""
                    }`}
                  >
                    <div>{date.slice(5)}</div>
                    {date === selectedDate && (
                      <span className="text-[9px] font-sans font-bold text-[#7C1D26]">Active</span>
                    )}
                  </th>
                ))}
                <th className="py-3.5 px-3 w-28 text-center">Lates / Abs</th>
                <th className="py-3.5 px-4 w-32 text-center">FDA Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.map((student, idx) => {
                // Collect attendance statuses for this student across all sessions
                const studentRecords = sessionDates.map((date) => {
                  return records.find(
                    (r) => r.studentId === student.id && r.date === date && r.classId === academicClass.id
                  );
                });

                const rawStatuses = studentRecords
                  .map((r) => r?.status)
                  .filter((s): s is AttendanceStatus => Boolean(s));

                const metrics = calculateAttendanceMetrics(rawStatuses, 4);

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-zinc-50/70 transition-colors group"
                  >
                    {/* Sequence */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-400">
                      {idx + 1}
                    </td>

                    {/* Student Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-700">
                      {student.studentNumber}
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.lastName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-500">
                              {student.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-900">
                            {student.lastName}, {student.firstName}{" "}
                            {student.middleInitial || ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Program */}
                    <td className="py-3.5 px-3 text-zinc-600 font-medium">
                      {student.program} · {student.academicLevel.split(" ")[0]}
                    </td>

                    {/* Dynamic Date Session Cells */}
                    {sessionDates.map((date) => {
                      const rec = records.find(
                        (r) => r.studentId === student.id && r.date === date && r.classId === academicClass.id
                      );

                      return (
                        <td
                          key={date}
                          className={`py-3.5 px-3 text-center ${
                            date === selectedDate ? "bg-[#7C1D26]/5" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleCellToggle(student.id, date)}
                            title={rec?.note ? `Note: ${rec.note} (Click to toggle)` : "Click to toggle (P -> L -> E -> A)"}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold font-mono text-xs transition shadow-xs cursor-pointer ${
                              rec?.status === "P"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                : rec?.status === "L"
                                ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                                : rec?.status === "E"
                                ? "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
                                : rec?.status === "A"
                                ? "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                                : "bg-zinc-100 text-zinc-400 border border-zinc-200 hover:bg-zinc-200"
                            }`}
                          >
                            {rec?.status || "--"}
                          </button>
                          {rec?.note && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C1D26] mx-auto mt-0.5" title={rec.note} />
                          )}
                        </td>
                      );
                    })}

                    {/* Total Lates & Effective Absences */}
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-700">
                      <span>{metrics.late}L</span>
                      <span className="mx-1 text-zinc-300">/</span>
                      <span className="font-bold text-[#7C1D26]">{metrics.effectiveAbsences}A</span>
                    </td>

                    {/* FDA Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {metrics.isFDA ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>FDA RISK</span>
                        </span>
                      ) : metrics.isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>NEAR LIMIT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>SAFE</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rapid Roll-Call Inline Glass Spotlight Overlay Modal */}
      {isRollCallOpen && (
        <RapidRollCallOverlay
          key={`${academicClass.id}-${selectedDate}`}
          isOpen={isRollCallOpen}
          onClose={() => setIsRollCallOpen(false)}
          onSave={handleSaveRollCall}
          students={students}
          classId={academicClass.id}
          courseCode={academicClass.courseCode}
          section={academicClass.section}
          date={selectedDate}
        />
      )}
    </div>
  );
}
