"use client";

import React, { useState } from "react";
import type { AcademicClass, JoinRequest } from "@/types";
import { KeyRound, X, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface StudentJoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableClasses: AcademicClass[];
  studentNumber: string;
  studentName: string;
  program: string;
  academicLevel: string;
  onJoinSubmitted: (request: JoinRequest, courseName: string, instructorName: string) => void;
}

export function StudentJoinClassModal({
  isOpen,
  onClose,
  availableClasses,
  studentNumber,
  studentName,
  program,
  academicLevel,
  onJoinSubmitted,
}: StudentJoinClassModalProps) {
  const [courseCode, setCourseCode] = useState("");
  const [classCode, setClassCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationMsg, setConfirmationMsg] = useState<{
    courseName: string;
    instructorName: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCourse = courseCode.trim().toUpperCase();
    const cleanClassCode = classCode.trim().toUpperCase();

    if (!cleanCourse || !cleanClassCode) {
      setErrorMsg("Please enter both the Course Code and the 6-character Class Code.");
      return;
    }

    // Match against available classes
    const matched = availableClasses.find(
      (c) =>
        c.courseCode.toUpperCase() === cleanCourse &&
        c.joinCode.toUpperCase() === cleanClassCode
    );

    if (!matched) {
      setErrorMsg(
        `No class found matching Course Code "${cleanCourse}" and Join Code "${cleanClassCode}". Please check with your instructor.`
      );
      return;
    }

    const instructorName = "Dr. Joshua Aquino"; // Default faculty profile
    const newRequest: JoinRequest = {
      id: `req_${Date.now()}`,
      classId: matched.id,
      studentNumber,
      studentName,
      program,
      academicLevel,
      photoIdUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      status: "pending",
      submittedAt: new Date().toLocaleString(),
    };

    onJoinSubmitted(newRequest, matched.courseTitle, instructorName);
    setConfirmationMsg({
      courseName: matched.courseTitle,
      instructorName,
    });
  };

  const handleFinish = () => {
    setConfirmationMsg(null);
    setCourseCode("");
    setClassCode("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-6">
        {confirmationMsg ? (
          /* Confirmation Prompt (DOCUMENTATION.md § 4.C.3) */
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-zinc-950 tracking-tight">
              Application Dispatched
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 leading-relaxed text-left">
              Successfully sent a request to join the class{" "}
              <strong className="text-[#7C1D26]">{confirmationMsg.courseName}</strong> to
              Instructor <strong className="text-zinc-950">{confirmationMsg.instructorName}</strong>.
            </div>
            <p className="text-[11px] text-zinc-400">
              The instructor will verify your University ID and approve your enrollment in Tab 1.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Join Request Form */
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Join a Class</h3>
                  <p className="text-[11px] text-zinc-400">Enter official university credentials</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Course Code:
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  placeholder="e.g. STAS"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono font-bold uppercase text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Unique 6-Character Class Code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g. STAS01"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono font-bold uppercase tracking-wider text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Provided by your faculty instructor
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
                >
                  <span>Submit Join Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
