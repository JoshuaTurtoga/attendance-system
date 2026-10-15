"use client";

import React, { useState, useEffect, useRef } from "react";
import type { RosterStudent, AttendanceStatus, AttendanceRecord } from "@/types";
import {
  RollCallSessionState,
  createRollCallSession,
  recordStudentStatus,
  handleRollCallHotkey,
  advanceRollCallIndex,
  jumpToRollCallIndex,
  updateStudentNote,
  computeRollCallSummary,
  finalizeRollCallSession,
} from "@/lib/attendance/roll-call-engine";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  Sparkles,
  ChevronUp,
  ArrowRight,
  X,
  User,
  MessageSquare,
  Save,
  Check,
} from "lucide-react";

interface RapidRollCallOverlayProps {
  students: RosterStudent[];
  classId: string;
  courseCode?: string;
  section?: string;
  date?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: AttendanceRecord[]) => void;
}

const QUICK_NOTE_PRESETS = [
  "Heavy Traffic",
  "Medical Slip",
  "Official University Business",
  "Family Emergency",
  "Weather Disturbance",
];

export function RapidRollCallOverlay({
  students,
  classId,
  courseCode = "CLASS",
  section = "SECTION",
  date,
  isOpen,
  onClose,
  onSave,
}: RapidRollCallOverlayProps) {
  const [session, setSession] = useState<RollCallSessionState>(() =>
    createRollCallSession(students, classId, date)
  );
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isNoteInputFocused, setIsNoteInputFocused] = useState(false);

  const activeCardRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active student into view smoothly
  useEffect(() => {
    if (isOpen && activeCardRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [session.currentIndex, isOpen]);

  // Global Keyboard Shortcuts (Single-Key P, L, E, A, Arrows, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in the note input, allow Enter to submit and Esc to blur, but don't intercept typing
      if (isNoteInputFocused) {
        if (e.key === "Enter") {
          e.preventDefault();
          setIsNoteInputFocused(false);
          setSession((prev) => advanceRollCallIndex(prev, "next"));
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsNoteInputFocused(false);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (showSummaryModal) {
          setShowSummaryModal(false);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setSession((prev) => advanceRollCallIndex(prev, "next"));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSession((prev) => advanceRollCallIndex(prev, "prev"));
        return;
      }

      const keyLower = e.key.toLowerCase();
      if (["p", "l", "e", "a"].includes(keyLower)) {
        e.preventDefault();
        setSession((prev) => handleRollCallHotkey(prev, keyLower));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isNoteInputFocused, showSummaryModal, onClose]);

  if (!isOpen) return null;

  const summary = computeRollCallSummary(session);

  const handleStatusClick = (status: AttendanceStatus) => {
    setSession((prev) => {
      const updated = recordStudentStatus(prev, prev.currentIndex, status);
      const isLast = prev.currentIndex >= prev.items.length - 1;
      const nextIndex = isLast ? prev.currentIndex : prev.currentIndex + 1;
      return {
        ...updated,
        currentIndex: nextIndex,
        isComplete: isLast || updated.isComplete,
      };
    });
  };

  const handleSaveAndCommit = () => {
    const records = finalizeRollCallSession(session);
    onSave(records);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/65 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Glass Bar */}
      <div className="shrink-0 bg-white/90 backdrop-blur-lg border-b border-zinc-200 px-6 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Class Badge & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C1D26] text-white text-xs font-bold tracking-wide uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rapid Roll-Call Spotlight</span>
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-900 font-mono">
              {courseCode} - {section}
            </span>
            <span className="mx-2 text-zinc-300">|</span>
            <span className="text-xs font-medium text-zinc-500 font-mono">
              {session.date}
            </span>
          </div>
        </div>

        {/* Center: Live Breakdown Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present: {summary.presentCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Late: {summary.lateCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Excused: {summary.excusedCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Absent: {summary.absentCount}</span>
          </div>
        </div>

        {/* Right: Progress & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-zinc-800">
              {summary.marked} of {summary.total} Marked ({summary.percentage}%)
            </div>
            <div className="w-32 h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#7C1D26] transition-all duration-300 rounded-full"
                style={{ width: `${summary.percentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowSummaryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Review & Save</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
            title="Exit Roll-Call (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Helper Ribbon */}
      <div className="shrink-0 bg-white/70 backdrop-blur-md border-b border-zinc-200/80 px-6 py-2 flex items-center justify-between text-[11px] text-zinc-600">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-900 uppercase tracking-wider text-[10px]">
            Single-Key Shortcuts:
          </span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-300">
              P
            </kbd>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold border border-amber-300">
              L
            </kbd>
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold border border-blue-300">
              E
            </kbd>
            <span>Excused</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold border border-rose-300">
              A
            </kbd>
            <span>Absent</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Navigation:</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono text-[10px] mr-1">
              Enter
            </kbd>
            or
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono text-[10px] mx-1">
              ↓
            </kbd>
            Next
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono text-[10px] mr-1">
              ↑
            </kbd>
            Prev
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono text-[10px] mr-1">
              Esc
            </kbd>
            Exit
          </span>
        </div>
      </div>

      {/* Main Spotlight Arena */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-4 max-w-4xl w-full mx-auto">
        {session.items.map((item, index) => {
          const isActive = index === session.currentIndex;
          const isMarked = item.status !== null;

          if (!isActive) {
            // Inactive Rows: Subtle frosted glass blur, low opacity, clickable to jump
            return (
              <div
                key={item.student.id}
                onClick={() => setSession((prev) => jumpToRollCallIndex(prev, index))}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-zinc-200/60 shadow-xs opacity-50 hover:opacity-85 transition-all cursor-pointer transform scale-[0.99] hover:scale-[1.0]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 text-center font-mono text-xs font-bold text-zinc-400 group-hover:text-zinc-700">
                    #{index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                    {item.student.avatarUrl ? (
                      <img
                        src={item.student.avatarUrl}
                        alt={item.student.lastName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-zinc-500">
                        {item.student.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-800">
                      {item.student.lastName}, {item.student.firstName}{" "}
                      {item.student.middleInitial || ""}
                    </span>
                    <span className="ml-2 font-mono text-xs text-zinc-400">
                      {item.student.studentNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.note && (
                    <span className="text-[11px] text-zinc-400 italic max-w-xs truncate">
                      &quot;{item.note}&quot;
                    </span>
                  )}
                  {isMarked ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "P"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : item.status === "L"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : item.status === "E"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {item.status === "P" && "Present (P)"}
                      {item.status === "L" && "Late (L)"}
                      {item.status === "E" && "Excused (E)"}
                      {item.status === "A" && "Absent (A)"}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium px-2 py-1 rounded-lg bg-zinc-100">
                      Unrecorded
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // Active Student: Elevated Spotlight Card with High Focus
          return (
            <div
              key={item.student.id}
              ref={activeCardRef}
              className="relative p-6 md:p-8 rounded-3xl bg-white border-2 border-[#7C1D26]/40 shadow-2xl ring-4 ring-[#7C1D26]/10 transform scale-[1.02] transition-all duration-300 space-y-6 z-20"
            >
              {/* Header: Sequence Number, Active Tag, Avatar, and Student Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {item.student.avatarUrl ? (
                      <img
                        src={item.student.avatarUrl}
                        alt={item.student.lastName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#7C1D26] text-white font-mono text-[10px] font-bold">
                        ACTIVE #{index + 1}
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        {item.student.studentNumber}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-zinc-950 mt-1 tracking-tight">
                      {item.student.lastName}, {item.student.firstName}{" "}
                      {item.student.middleInitial || ""}
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      {item.student.program} · {item.student.academicLevel}
                    </p>
                  </div>
                </div>

                {/* Current Status Pill Preview */}
                <div className="self-start sm:self-center">
                  {item.status ? (
                    <div
                      className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xs ${
                        item.status === "P"
                          ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-300"
                          : item.status === "L"
                          ? "bg-amber-50 text-amber-800 border-2 border-amber-300"
                          : item.status === "E"
                          ? "bg-blue-50 text-blue-800 border-2 border-blue-300"
                          : "bg-rose-50 text-rose-800 border-2 border-rose-300"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Status:{" "}
                        {item.status === "P"
                          ? "Present (P)"
                          : item.status === "L"
                          ? "Late (L)"
                          : item.status === "E"
                          ? "Excused (E)"
                          : "Absent (A)"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200">
                      Press P, L, E, or A
                    </span>
                  )}
                </div>
              </div>

              {/* Status Shortcut Pill Buttons (P, L, E, A) */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Mark Attendance (Click or Press Shortcut Key):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Present Button */}
                  <button
                    onClick={() => handleStatusClick("P")}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-xs ${
                      item.status === "P"
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md scale-102"
                        : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 hover:scale-101"
                    }`}
                  >
                    <kbd
                      className={`px-2 py-0.5 rounded font-mono text-xs ${
                        item.status === "P"
                          ? "bg-emerald-800 text-white"
                          : "bg-white text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      P
                    </kbd>
                    <span>Present</span>
                  </button>

                  {/* Late Button */}
                  <button
                    onClick={() => handleStatusClick("L")}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-xs ${
                      item.status === "L"
                        ? "bg-amber-600 text-white ring-4 ring-amber-200 shadow-md scale-102"
                        : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 hover:scale-101"
                    }`}
                  >
                    <kbd
                      className={`px-2 py-0.5 rounded font-mono text-xs ${
                        item.status === "L"
                          ? "bg-amber-800 text-white"
                          : "bg-white text-amber-800 border border-amber-300"
                      }`}
                    >
                      L
                    </kbd>
                    <span>Late</span>
                  </button>

                  {/* Excused Button */}
                  <button
                    onClick={() => handleStatusClick("E")}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-xs ${
                      item.status === "E"
                        ? "bg-blue-600 text-white ring-4 ring-blue-200 shadow-md scale-102"
                        : "bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 hover:scale-101"
                    }`}
                  >
                    <kbd
                      className={`px-2 py-0.5 rounded font-mono text-xs ${
                        item.status === "E"
                          ? "bg-blue-800 text-white"
                          : "bg-white text-blue-800 border border-blue-300"
                      }`}
                    >
                      E
                    </kbd>
                    <span>Excused</span>
                  </button>

                  {/* Absent Button */}
                  <button
                    onClick={() => handleStatusClick("A")}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-xs ${
                      item.status === "A"
                        ? "bg-rose-600 text-white ring-4 ring-rose-200 shadow-md scale-102"
                        : "bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200 hover:scale-101"
                    }`}
                  >
                    <kbd
                      className={`px-2 py-0.5 rounded font-mono text-xs ${
                        item.status === "A"
                          ? "bg-rose-800 text-white"
                          : "bg-white text-rose-800 border border-rose-300"
                      }`}
                    >
                      A
                    </kbd>
                    <span>Absent</span>
                  </button>
                </div>
              </div>

              {/* Inline Quick Notes Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="student-note"
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#7C1D26]" />
                    <span>Optional Remark or Excuse Reason:</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Press Enter inside input to save note and advance
                  </span>
                </div>
                <input
                  id="student-note"
                  type="text"
                  value={item.note}
                  onFocus={() => setIsNoteInputFocused(true)}
                  onBlur={() => setIsNoteInputFocused(false)}
                  onChange={(e) =>
                    setSession((prev) =>
                      updateStudentNote(prev, index, e.target.value)
                    )
                  }
                  placeholder="e.g., Arrived 20 mins late due to rain, doctor certificate pending..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26] text-xs text-zinc-800 bg-zinc-50 focus:bg-white transition"
                />

                {/* Quick note suggestion presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-400 font-medium">Quick tags:</span>
                  {QUICK_NOTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setSession((prev) =>
                          updateStudentNote(
                            prev,
                            index,
                            item.note ? `${item.note}; ${preset}` : preset
                          )
                        )
                      }
                      className="px-2 py-0.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] transition cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() =>
                    setSession((prev) => advanceRollCallIndex(prev, "prev"))
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Previous Student (↑)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSession((prev) => advanceRollCallIndex(prev, "next"))
                    }
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <span>
                      {index === session.items.length - 1 ? "Finish" : "Next Student (Enter / ↓)"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion & Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                Roll-Call Session Ready to Commit
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {courseCode} - {section} · Date: {session.date}
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800">Present</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">
                  {summary.presentCount}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-800">Late</span>
                <p className="text-2xl font-black text-amber-700 mt-0.5">
                  {summary.lateCount}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-800">Excused</span>
                <p className="text-2xl font-black text-blue-700 mt-0.5">
                  {summary.excusedCount}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-xs font-bold text-rose-800">Absent</span>
                <p className="text-2xl font-black text-rose-700 mt-0.5">
                  {summary.absentCount}
                </p>
              </div>
            </div>

            {summary.remaining > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <strong>Notice:</strong> {summary.remaining} student(s) remain unrecorded and will be marked as Absent upon finalizing.
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
              >
                Back to Roll-Call
              </button>
              <button
                type="button"
                onClick={handleSaveAndCommit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Attendance Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
