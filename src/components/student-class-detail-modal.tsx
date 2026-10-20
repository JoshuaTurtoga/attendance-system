"use client";

import React, { useState } from "react";
import type {
  AcademicClass,
  AttendanceRecord,
  ExcuseRequest,
  GradeItem,
  StudentGrade,
} from "@/types";
import {
  computeStudentPersonalSummary,
  validateExcuseSubmission,
} from "@/lib/student/student-portal-engine";
import { EmptyState } from "./empty-state";
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Check,
} from "lucide-react";

interface StudentClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicClass: AcademicClass;
  studentId: string;
  studentName: string;
  studentNumber: string;
  attendanceRecords: AttendanceRecord[];
  gradeItems: GradeItem[];
  studentGrades: StudentGrade[];
  excuseRequests: ExcuseRequest[];
  onFileExcuseRequest: (request: ExcuseRequest) => void;
}

export function StudentClassDetailModal({
  isOpen,
  onClose,
  academicClass,
  studentId,
  studentName,
  studentNumber,
  attendanceRecords,
  gradeItems,
  studentGrades,
  excuseRequests,
  onFileExcuseRequest,
}: StudentClassDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"attendance" | "grades">("attendance");
  const [isFilingExcuse, setIsFilingExcuse] = useState(false);
  const [excuseDate, setExcuseDate] = useState("");
  const [excuseReason, setExcuseReason] = useState("");
  const [excuseDocUrl, setExcuseDocUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const summary = computeStudentPersonalSummary({
    studentId,
    classId: academicClass.id,
    attendanceRecords,
    gradeItems,
    studentGrades,
  });

  const classAttendance = attendanceRecords
    .filter((a) => a.classId === academicClass.id && a.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const classGradeItems = gradeItems.filter((g) => g.classId === academicClass.id);
  const quizzes = classGradeItems.filter((g) => g.category === "quiz");
  const pts = classGradeItems.filter((g) => g.category === "performance_task");
  const exams = classGradeItems.filter((g) => g.category === "exam");

  const studentClassExcuses = excuseRequests.filter(
    (e) => e.classId === academicClass.id && e.studentId === studentId
  );

  const handleOpenExcuseForm = (date?: string) => {
    setExcuseDate(date || classAttendance.find((a) => a.status === "A" || a.status === "L")?.date || "");
    setExcuseReason("");
    setExcuseDocUrl("");
    setFormError(null);
    setIsFilingExcuse(true);
  };

  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseDate) {
      setFormError("Please select an attendance date to excuse.");
      return;
    }

    const targetRecord = classAttendance.find((a) => a.date === excuseDate);
    const result = validateExcuseSubmission({
      studentId,
      studentName,
      studentNumber,
      classId: academicClass.id,
      date: excuseDate,
      reason: excuseReason,
      documentUrl: excuseDocUrl,
      attendanceStatus: targetRecord?.status,
    });

    if (!result.valid || !result.request) {
      setFormError(result.error || "Failed to validate excuse slip.");
      return;
    }

    onFileExcuseRequest(result.request);
    setIsFilingExcuse(false);
    setSuccessToast(`Excuse slip filed for ${excuseDate}. Waiting for instructor approval.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 border-b border-zinc-200/80 bg-zinc-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2.5 py-0.5 rounded-lg border border-[#7C1D26]/20">
                {academicClass.courseCode} • {academicClass.section}
              </span>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                {academicClass.classType} • {academicClass.units} Units
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-950 mt-1 tracking-tight">
              {academicClass.courseTitle}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Term: {academicClass.term}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenExcuseForm()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-zinc-200 hover:border-[#7C1D26]/40 hover:bg-zinc-50 text-zinc-800 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#7C1D26]" />
              <span>File Excuse Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="m-4 mb-0 flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Standing Overview Cards */}
        <div className="p-6 pb-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Attendance Standing
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  summary.attendance.fdaStanding === "SAFE"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : summary.attendance.fdaStanding === "WARNING"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {summary.attendance.fdaStanding === "SAFE"
                  ? "Safe / Good"
                  : summary.attendance.fdaStanding === "WARNING"
                  ? "Near Cut Limit"
                  : "FDA Risk / Exceeded"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {summary.attendance.effectiveAbsences} effective absences
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Attendance Rate
            </p>
            <p className="text-xl font-bold font-mono text-zinc-950 mt-0.5">
              {summary.attendance.attendanceRate}%
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {summary.attendance.present} P · {summary.attendance.late} L · {summary.attendance.absent} A
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Weighted Standing
            </p>
            <p className="text-xl font-bold font-mono text-zinc-950 mt-0.5">
              {summary.grades.finalGrade !== null ? `${summary.grades.finalGrade}%` : "--"}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {summary.grades.isPassing ? "Passing (>= 75%)" : "Needs Improvement"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Philippine Grade Mark
            </p>
            <p className="text-xl font-black font-mono text-[#7C1D26] mt-0.5">
              {summary.grades.letterGrade}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Scale 1.00 (High) to 5.00
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 border-b border-zinc-200/80 pt-2">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "attendance"
                ? "border-[#7C1D26] text-[#7C1D26] font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance History ({classAttendance.length} logs)</span>
          </button>

          <button
            onClick={() => setActiveTab("grades")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "grades"
                ? "border-[#7C1D26] text-[#7C1D26] font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Categorized Assessment Scores</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "attendance" && (
            <div className="space-y-4">
              {/* Excuse Slips Status Sub-Section */}
              {studentClassExcuses.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>My Submitted Excuse Slips ({studentClassExcuses.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {studentClassExcuses.map((exc) => (
                      <div
                        key={exc.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-100 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-zinc-900 mr-2">{exc.date}</span>
                          <span className="text-zinc-600">{exc.reason}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              exc.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : exc.status === "declined"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {exc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance Table */}
              {classAttendance.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-6 h-6" />}
                  title="No attendance records"
                  description="Once your instructor records roll-call for this class, your attendance history will appear here."
                />
              ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-600">
                    <tr>
                      <th className="px-4 py-3">Session Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Remarks / Notes</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {classAttendance.map((rec) => {
                        const isAbsentOrLate = rec.status === "A" || rec.status === "L";
                        const hasPendingExcuse = studentClassExcuses.some(
                          (e) => e.date === rec.date && e.status === "pending"
                        );

                        return (
                          <tr key={rec.id} className="hover:bg-zinc-50/80 transition">
                            <td className="px-4 py-3 font-mono font-semibold text-zinc-800">
                              {rec.date}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  rec.status === "P"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : rec.status === "L"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : rec.status === "E"
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                {rec.status === "P" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {rec.status === "L" && <Clock className="w-3.5 h-3.5" />}
                                {rec.status === "E" && <ShieldCheck className="w-3.5 h-3.5" />}
                                {rec.status === "A" && <XCircle className="w-3.5 h-3.5" />}
                                <span>
                                  {rec.status === "P"
                                    ? "Present"
                                    : rec.status === "L"
                                    ? "Late"
                                    : rec.status === "E"
                                    ? "Excused"
                                    : "Absent"}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-600">
                              {rec.note || "--"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isAbsentOrLate && !hasPendingExcuse && (
                                <button
                                  onClick={() => handleOpenExcuseForm(rec.date)}
                                  className="text-[11px] font-bold text-[#7C1D26] hover:underline cursor-pointer"
                                >
                                  File Excuse
                                </button>
                              )}
                              {hasPendingExcuse && (
                                <span className="text-[11px] text-amber-600 font-medium">
                                  Excuse Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {activeTab === "grades" && (
            <div className="space-y-6">
              {classGradeItems.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="No grades recorded"
                  description="Your instructor has not published any assessments for this class yet. Your scores will appear here once graded."
                />
              ) : (
              <>
              {/* Category 1: Quizzes */}
              <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Quizzes (Weight: 25%)</h4>
                    <p className="text-[11px] text-zinc-500">Short assessments and reading checks</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                    Subtotal: {summary.grades.quizScore.percentage !== null ? `${summary.grades.quizScore.percentage}%` : "--"}
                  </span>
                </div>
                <div className="divide-y divide-zinc-200/60 bg-white rounded-xl border border-zinc-200">
                  {quizzes.length === 0 ? (
                    <p className="p-4 text-xs text-zinc-400 text-center">No quizzes created yet.</p>
                  ) : (
                    quizzes.map((q) => {
                      const grade = studentGrades.find(
                        (g) => g.gradeItemId === q.id && g.studentId === studentId
                      );
                      const hasScore = grade && grade.score !== null && grade.score !== undefined;
                      return (
                        <div key={q.id} className="flex items-center justify-between p-3 text-xs">
                          <div>
                            <span className="font-bold text-zinc-900">{q.title}</span>
                            <span className="text-zinc-400 font-mono text-[11px] ml-2">Date: {q.date}</span>
                          </div>
                          <div className="font-mono">
                            <span className={`font-bold ${hasScore ? "text-zinc-900" : "text-zinc-400 italic"}`}>
                              {hasScore ? `${grade.score} / ${q.maxScore}` : "Unrecorded (--)"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Category 2: Performance Tasks */}
              <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Performance Tasks (Weight: 45%)</h4>
                    <p className="text-[11px] text-zinc-500">Essays, laboratory experiments, and group outputs</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                    Subtotal: {summary.grades.ptScore.percentage !== null ? `${summary.grades.ptScore.percentage}%` : "--"}
                  </span>
                </div>
                <div className="divide-y divide-zinc-200/60 bg-white rounded-xl border border-zinc-200">
                  {pts.length === 0 ? (
                    <p className="p-4 text-xs text-zinc-400 text-center">No performance tasks created yet.</p>
                  ) : (
                    pts.map((pt) => {
                      const grade = studentGrades.find(
                        (g) => g.gradeItemId === pt.id && g.studentId === studentId
                      );
                      const hasScore = grade && grade.score !== null && grade.score !== undefined;
                      return (
                        <div key={pt.id} className="flex items-center justify-between p-3 text-xs">
                          <div>
                            <span className="font-bold text-zinc-900">{pt.title}</span>
                            <span className="text-zinc-400 font-mono text-[11px] ml-2">Date: {pt.date}</span>
                          </div>
                          <div className="font-mono">
                            <span className={`font-bold ${hasScore ? "text-zinc-900" : "text-zinc-400 italic"}`}>
                              {hasScore ? `${grade.score} / ${pt.maxScore}` : "Unrecorded (--)"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Category 3: Major Exams */}
              <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Major Examinations (Weight: 30%)</h4>
                    <p className="text-[11px] text-zinc-500">Midterm and Final Term summative examinations</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    Subtotal: {summary.grades.examScore.percentage !== null ? `${summary.grades.examScore.percentage}%` : "--"}
                  </span>
                </div>
                <div className="divide-y divide-zinc-200/60 bg-white rounded-xl border border-zinc-200">
                  {exams.length === 0 ? (
                    <p className="p-4 text-xs text-zinc-400 text-center">No major exams recorded yet.</p>
                  ) : (
                    exams.map((ex) => {
                      const grade = studentGrades.find(
                        (g) => g.gradeItemId === ex.id && g.studentId === studentId
                      );
                      const hasScore = grade && grade.score !== null && grade.score !== undefined;
                      return (
                        <div key={ex.id} className="flex items-center justify-between p-3 text-xs">
                          <div>
                            <span className="font-bold text-zinc-900">{ex.title}</span>
                            <span className="text-zinc-400 font-mono text-[11px] ml-2">Date: {ex.date}</span>
                          </div>
                          <div className="font-mono">
                            <span className={`font-bold ${hasScore ? "text-zinc-900" : "text-zinc-400 italic"}`}>
                              {hasScore ? `${grade.score} / ${ex.maxScore}` : "Unrecorded (--)"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              </>
              )}
            </div>
          )}
        </div>

        {/* Excuse Slip Submitter Modal Sub-Overlay */}
        {isFilingExcuse && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#7C1D26]" />
                  <h3 className="text-base font-bold text-zinc-950">File Excuse Slip</h3>
                </div>
                <button
                  onClick={() => setIsFilingExcuse(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitExcuse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Absence Session Date:
                  </label>
                  <select
                    value={excuseDate}
                    onChange={(e) => setExcuseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-semibold text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                  >
                    <option value="">Select an absence date...</option>
                    {classAttendance
                      .filter((a) => a.status === "A" || a.status === "L")
                      .map((a) => (
                        <option key={a.date} value={a.date}>
                          {a.date} ({a.status === "A" ? "Absent" : "Late"})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Reason for Absence / Tardiness:
                  </label>
                  <textarea
                    rows={3}
                    value={excuseReason}
                    onChange={(e) => setExcuseReason(e.target.value)}
                    placeholder="Provide a detailed explanation (e.g. Medical emergency, collegiate representation)..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Supporting Document URL (Medical Cert / Excuse Letter):
                  </label>
                  <input
                    type="url"
                    value={excuseDocUrl}
                    onChange={(e) => setExcuseDocUrl(e.target.value)}
                    placeholder="https://hospital.example.com/certificate.pdf"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Provide a valid web link or university repository upload link.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsFilingExcuse(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Submit to Instructor</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
