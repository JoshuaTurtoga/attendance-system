"use client";

import React, { useState } from "react";
import type {
  AcademicClass,
  AttendanceRecord,
  AttendanceStatus,
  RosterStudent,
  ExcuseRequest,
  SessionType,
  GradeItem,
  StudentGrade,
} from "@/types";
import { DEFAULT_ROSTER, DEFAULT_EXCUSE_REQUESTS } from "@/lib/roster/mock-roster";
import {
  generateScheduleDates,
  calculateEffectiveAbsencesWithSessions,
  isSessionExemptFromFDA,
} from "@/lib/attendance/session-engine";
import { detectCrossModuleDiscrepancies } from "@/lib/sync/cross-module-sync";
import { RapidRollCallOverlay } from "./rapid-roll-call-overlay";
import { ExcuseSlipResolutionModal } from "./excuse-slip-resolution-modal";
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
  FileText,
  Plus,
  CalendarDays,
  X,
  Download,
} from "lucide-react";

interface ClassAttendanceSheetProps {
  academicClass: AcademicClass;
  autoLaunchRollCall?: boolean;
  sharedRecords?: AttendanceRecord[];
  onRecordsChange?: (records: AttendanceRecord[]) => void;
  sharedSessionDates?: string[];
  onSessionDatesChange?: (dates: string[]) => void;
  sharedSessionTypes?: Record<string, SessionType>;
  onSessionTypesChange?: (types: Record<string, SessionType>) => void;
  gradeItems?: GradeItem[];
  studentGrades?: StudentGrade[];
  onExportExcel?: () => void;
}

const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Session 1: 2026-10-09
  { id: "att_1", classId: "cls_01", studentId: "stud_01", date: "2026-10-09", status: "P", createdAt: "2026-10-09T09:00:00Z" },
  { id: "att_2", classId: "cls_01", studentId: "stud_02", date: "2026-10-09", status: "P", createdAt: "2026-10-09T09:00:00Z" },
  { id: "att_3", classId: "cls_01", studentId: "stud_03", date: "2026-10-09", status: "L", note: "Traffic along Commonwealth", createdAt: "2026-10-09T09:15:00Z" },
  { id: "att_4", classId: "cls_01", studentId: "stud_04", date: "2026-10-09", status: "P", createdAt: "2026-10-09T09:00:00Z" },
  { id: "att_5", classId: "cls_01", studentId: "stud_05", date: "2026-10-09", status: "A", note: "Hospitalization for acute viral infection", createdAt: "2026-10-09T09:00:00Z" },

  // Session 2: 2026-10-14
  { id: "att_6", classId: "cls_01", studentId: "stud_01", date: "2026-10-14", status: "P", createdAt: "2026-10-14T09:00:00Z" },
  { id: "att_7", classId: "cls_01", studentId: "stud_02", date: "2026-10-14", status: "E", note: "University Debate Championship", createdAt: "2026-10-14T09:00:00Z" },
  { id: "att_8", classId: "cls_01", studentId: "stud_03", date: "2026-10-14", status: "L", note: "Heavy rain commute", createdAt: "2026-10-14T09:20:00Z" },
  { id: "att_9", classId: "cls_01", studentId: "stud_04", date: "2026-10-14", status: "L", note: "Transit breakdown", createdAt: "2026-10-14T09:20:00Z" },
  { id: "att_10", classId: "cls_01", studentId: "stud_05", date: "2026-10-14", status: "A", note: "Absent without permit", createdAt: "2026-10-14T09:00:00Z" },
];

const INITIAL_SESSION_DATES = ["2026-10-09", "2026-10-14", "2026-10-16"];

const INITIAL_SESSION_TYPES: Record<string, SessionType> = {
  "2026-10-09": "regular",
  "2026-10-14": "regular",
  "2026-10-16": "regular",
};

export function ClassAttendanceSheet({
  academicClass,
  autoLaunchRollCall = false,
  sharedRecords,
  onRecordsChange,
  sharedSessionDates,
  onSessionDatesChange,
  sharedSessionTypes,
  onSessionTypesChange,
  gradeItems,
  studentGrades,
  onExportExcel,
}: ClassAttendanceSheetProps) {
  const [students] = useState<RosterStudent[]>(DEFAULT_ROSTER);
  const [internalRecords, setInternalRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [internalSessionDates, setInternalSessionDates] = useState<string[]>(INITIAL_SESSION_DATES);
  const [internalSessionTypes, setInternalSessionTypes] = useState<Record<string, SessionType>>(INITIAL_SESSION_TYPES);

  const records = sharedRecords || internalRecords;
  const setRecords = (updater: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])) => {
    const next = typeof updater === "function" ? updater(records) : updater;
    setInternalRecords(next);
    if (onRecordsChange) onRecordsChange(next);
  };

  const sessionDates = sharedSessionDates || internalSessionDates;
  const setSessionDates = (updater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof updater === "function" ? updater(sessionDates) : updater;
    setInternalSessionDates(next);
    if (onSessionDatesChange) onSessionDatesChange(next);
  };

  const sessionTypes = sharedSessionTypes || internalSessionTypes;
  const setSessionTypes = (updater: Record<string, SessionType> | ((prev: Record<string, SessionType>) => Record<string, SessionType>)) => {
    const next = typeof updater === "function" ? updater(sessionTypes) : updater;
    setInternalSessionTypes(next);
    if (onSessionTypesChange) onSessionTypesChange(next);
  };

  const [selectedDate, setSelectedDate] = useState<string>("2026-10-16");
  const [isRollCallOpen, setIsRollCallOpen] = useState(autoLaunchRollCall);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Cross-module discrepancy checking for selected session date
  const discrepanciesForDate = gradeItems && studentGrades ? detectCrossModuleDiscrepancies({
    date: selectedDate,
    students,
    attendanceRecords: records,
    gradeItems,
    studentGrades,
  }) : [];

  // Excuse Slips Queue State
  const [excuseRequests, setExcuseRequests] = useState<ExcuseRequest[]>(DEFAULT_EXCUSE_REQUESTS);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  // Add Custom Make-up Date Modal State
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [newCustomDate, setNewCustomDate] = useState("");
  const [newCustomType, setNewCustomType] = useState<SessionType>("makeup");

  // Selected slip document preview modal
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

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

  const pendingExcuseCount = excuseRequests.filter((r) => r.status === "pending").length;

  // Active date session type
  const activeSessionType = sessionTypes[selectedDate] || "regular";

  // Handle saving attendance from Rapid Roll-Call
  const handleSaveRollCall = (newRecords: AttendanceRecord[]) => {
    setRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.classId === academicClass.id && r.date === selectedDate)
      );
      return [...filtered, ...newRecords];
    });

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
          documentUrl: existing?.documentUrl,
          note: existing?.note,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  // Switch session type classification for selected date
  const handleSetSessionType = (type: SessionType) => {
    setSessionTypes((prev) => ({
      ...prev,
      [selectedDate]: type,
    }));
  };

  // Add custom date (e.g. make-up class or institutional date)
  const handleAddCustomDate = () => {
    if (!newCustomDate) return;

    if (!sessionDates.includes(newCustomDate)) {
      setSessionDates((prev) => [...prev, newCustomDate].sort());
    }

    setSessionTypes((prev) => ({
      ...prev,
      [newCustomDate]: newCustomType,
    }));

    setSelectedDate(newCustomDate);
    setIsAddDateModalOpen(false);
    setNewCustomDate("");
    setSaveSuccessMsg(`Session date ${newCustomDate} (${newCustomType}) added.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Auto-generate semester dates from class schedule
  const handleGenerateSemesterDates = () => {
    // Generate dates for current semester range: 2026-10-01 to 2026-11-15
    const generated = generateScheduleDates(
      academicClass.schedule,
      "2026-10-01",
      "2026-11-15"
    );

    const combined = Array.from(new Set([...sessionDates, ...generated])).sort();
    setSessionDates(combined);

    setSessionTypes((prev) => {
      const updated = { ...prev };
      for (const d of generated) {
        if (!updated[d]) updated[d] = "regular";
      }
      return updated;
    });

    setSaveSuccessMsg(`Generated ${generated.length} class session dates for semester.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Update record after excuse approval
  const handleUpdateRecordFromExcuse = (updatedRecord: AttendanceRecord) => {
    setRecords((prev) => {
      const remaining = prev.filter(
        (r) =>
          !(
            r.classId === updatedRecord.classId &&
            r.studentId === updatedRecord.studentId &&
            r.date === updatedRecord.date
          )
      );
      return [...remaining, updatedRecord];
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
            <span className="text-[10px] font-mono bg-zinc-200/80 text-zinc-700 px-2 py-0.5 rounded font-semibold">
              3 Late = 1 Absence Policy
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-950 mt-0.5">
            Master Attendance Sheet & Session Engine
          </h2>
          <p className="text-xs text-zinc-500">
            Automated session date generator, excuse resolution queue, and single-key roll-call.
          </p>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Excuse Slips Queue Button */}
          <button
            onClick={() => setIsExcuseModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-zinc-200 hover:border-[#7C1D26]/40 hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#7C1D26]" />
            <span>Excuse Slips</span>
            {pendingExcuseCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-black">
                {pendingExcuseCount}
              </span>
            ) : (
              <span className="text-zinc-400 text-[10px] font-normal">0 pending</span>
            )}
          </button>

          {/* Multi-Sheet Excel Export Button */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-zinc-200 hover:border-[#7C1D26]/40 hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-xs transition cursor-pointer"
              title="Download institutional multi-sheet Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-[#7C1D26]" />
              <span>Export Excel</span>
            </button>
          )}

          {/* Rapid Roll-Call Launcher */}
          <button
            onClick={() => setIsRollCallOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Rapid Roll-Call</span>
          </button>
        </div>
      </div>

      {/* Discrepancy Alert for Selected Session */}
      {discrepanciesForDate.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Cross-Module Conflict on {selectedDate}: {discrepanciesForDate[0].message}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
            Review Status
          </span>
        </div>
      )}

      {/* Session Controls, Date Picker & Classification Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
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
                {d} {d === "2026-10-16" ? "(Today)" : ""} - ({sessionTypes[d] || "regular"})
              </option>
            ))}
          </select>

          {/* Session Classification Toggle (DOCUMENTATION.md § 4.B.TAB 2) */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-[11px] font-medium text-zinc-600">
            <button
              onClick={() => handleSetSessionType("regular")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeSessionType === "regular"
                  ? "bg-white text-zinc-900 font-bold shadow-xs"
                  : "hover:text-zinc-900"
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => handleSetSessionType("makeup")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeSessionType === "makeup"
                  ? "bg-purple-600 text-white font-bold shadow-xs"
                  : "hover:text-zinc-900"
              }`}
            >
              Make-up
            </button>
            <button
              onClick={() => handleSetSessionType("holiday")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeSessionType === "holiday"
                  ? "bg-amber-600 text-white font-bold shadow-xs"
                  : "hover:text-zinc-900"
              }`}
              title="Official university holiday (exempt from absences)"
            >
              Holiday
            </button>
            <button
              onClick={() => handleSetSessionType("suspended")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeSessionType === "suspended"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "hover:text-zinc-900"
              }`}
              title="Weather / Institutional suspension (exempt from absences)"
            >
              Suspended
            </button>
            <button
              onClick={() => handleSetSessionType("instructor_absence")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeSessionType === "instructor_absence"
                  ? "bg-[#7C1D26] text-white font-bold shadow-xs"
                  : "hover:text-zinc-900"
              }`}
              title="Faculty Self-Absence (exempts session and does NOT penalize students)"
            >
              Faculty Self-Absence
            </button>
          </div>

          {/* Add Date / Auto Generate Buttons */}
          <button
            onClick={() => setIsAddDateModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition cursor-pointer"
            title="Add Make-up class date"
          >
            <Plus className="w-3.5 h-3.5 text-[#7C1D26]" />
            <span>Add Date</span>
          </button>

          <button
            onClick={handleGenerateSemesterDates}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition cursor-pointer"
            title="Auto-generate all semester dates matching schedule"
          >
            <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
            <span>Generate Dates</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative w-full lg:w-56">
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
                {sessionDates.map((date) => {
                  const sType = sessionTypes[date] || "regular";

                  return (
                    <th
                      key={date}
                      className={`py-3 px-2 w-28 text-center font-mono ${
                        date === selectedDate ? "bg-[#7C1D26]/5 text-[#7C1D26]" : ""
                      }`}
                    >
                      <div>{date.slice(5)}</div>
                      {sType !== "regular" && (
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-sans font-black uppercase mt-0.5 ${
                            sType === "instructor_absence"
                              ? "bg-[#7C1D26] text-white"
                              : sType === "holiday"
                              ? "bg-amber-100 text-amber-800"
                              : sType === "suspended"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {sType === "instructor_absence"
                            ? "Faculty Abs"
                            : sType === "holiday"
                            ? "Holiday"
                            : sType === "suspended"
                            ? "Suspended"
                            : "Make-up"}
                        </span>
                      )}
                      {date === selectedDate && sType === "regular" && (
                        <span className="text-[9px] font-sans font-bold text-[#7C1D26] block">
                          Active
                        </span>
                      )}
                    </th>
                  );
                })}
                <th className="py-3.5 px-3 w-28 text-center">Lates / Abs</th>
                <th className="py-3.5 px-4 w-32 text-center">FDA Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.map((student, idx) => {
                // Collect attendance records with session types for accurate FDA calculation
                const studentRecords = sessionDates.map((date) => {
                  const rec = records.find(
                    (r) =>
                      r.studentId === student.id &&
                      r.date === date &&
                      r.classId === academicClass.id
                  );
                  return {
                    status: rec?.status || ("A" as AttendanceStatus),
                    sessionType: sessionTypes[date] || "regular",
                    recorded: Boolean(rec),
                    documentUrl: rec?.documentUrl,
                    note: rec?.note,
                  };
                });

                // Compute FDA using only recorded sessions
                const validRecordsForFDA = studentRecords
                  .filter((s) => s.recorded)
                  .map((s) => ({ status: s.status, sessionType: s.sessionType }));

                const metrics = calculateEffectiveAbsencesWithSessions(validRecordsForFDA, 4);

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
                        (r) =>
                          r.studentId === student.id &&
                          r.date === date &&
                          r.classId === academicClass.id
                      );
                      const sType = sessionTypes[date] || "regular";
                      const isExempt = isSessionExemptFromFDA(sType);

                      return (
                        <td
                          key={date}
                          className={`py-3 px-2 text-center ${
                            date === selectedDate ? "bg-[#7C1D26]/5" : ""
                          }`}
                        >
                          <div className="inline-flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => handleCellToggle(student.id, date)}
                              title={
                                rec?.note
                                  ? `Note: ${rec.note} (Click to toggle)`
                                  : "Click to toggle (P -> L -> E -> A)"
                              }
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold font-mono text-xs transition shadow-xs cursor-pointer ${
                                rec?.status === "P"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                  : rec?.status === "L"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                                  : rec?.status === "E"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
                                  : rec?.status === "A"
                                  ? isExempt
                                    ? "bg-zinc-200 text-zinc-600 border border-zinc-300 line-through"
                                    : "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                                  : "bg-zinc-100 text-zinc-400 border border-zinc-200 hover:bg-zinc-200"
                              }`}
                            >
                              {rec?.status || "--"}
                            </button>

                            {/* Indicators: Note or Attached Medical Document */}
                            <div className="flex items-center gap-1 mt-0.5">
                              {rec?.documentUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDocUrl(rec.documentUrl || null)}
                                  className="text-blue-600 hover:text-blue-800 transition"
                                  title="View approved medical certificate"
                                >
                                  <FileText className="w-3 h-3" />
                                </button>
                              )}
                              {rec?.note && !rec.documentUrl && (
                                <div
                                  className="w-1.5 h-1.5 rounded-full bg-[#7C1D26]"
                                  title={rec.note}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Lates & Effective Absences */}
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-700">
                      <span>{metrics.late}L</span>
                      <span className="mx-1 text-zinc-300">/</span>
                      <span className="font-bold text-[#7C1D26]">
                        {metrics.effectiveAbsences}A
                      </span>
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

      {/* Excuse Slip Resolution Modal */}
      <ExcuseSlipResolutionModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        requests={excuseRequests}
        attendanceRecords={records}
        onUpdateRecord={handleUpdateRecordFromExcuse}
        onUpdateRequests={setExcuseRequests}
      />

      {/* Add Custom Make-up / Session Date Modal */}
      {isAddDateModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-950">Add Session Date</h3>
              <button
                onClick={() => setIsAddDateModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Select Date (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={newCustomDate}
                  onChange={(e) => setNewCustomDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Session Type:
                </label>
                <select
                  value={newCustomType}
                  onChange={(e) => setNewCustomType(e.target.value as SessionType)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                >
                  <option value="makeup">Make-up Class</option>
                  <option value="regular">Regular Class</option>
                  <option value="holiday">Holiday</option>
                  <option value="suspended">Suspended (Weather/Institutional)</option>
                  <option value="instructor_absence">Faculty Self-Absence</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsAddDateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomDate}
                disabled={!newCustomDate}
                className="px-4 py-2 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition cursor-pointer"
              >
                Add Session Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7C1D26]" />
                <span>Verified Excuse Document</span>
              </h3>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 max-h-[60vh] flex items-center justify-center">
              <img
                src={previewDocUrl}
                alt="Document preview"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
