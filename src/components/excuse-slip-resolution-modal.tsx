"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import type { ExcuseRequest, AttendanceRecord } from "@/types";
import { approveExcuse, declineExcuse } from "@/lib/data/attendance";
import {
  ShieldCheck,
  XCircle,
  FileText,
  ExternalLink,
  CheckCircle2,
  Calendar,
  X,
} from "lucide-react";

interface ExcuseSlipResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  requests: ExcuseRequest[];
  attendanceRecords: AttendanceRecord[];
  onRefresh: () => Promise<void>;
}

const COMMON_DECLINE_REASONS = [
  "Incomplete or unverified medical slip",
  "Submitted beyond institutional 48-hour window",
  "Non-academic / non-medical reason per university policy",
  "Missing physician license / hospital stamp",
];

export function ExcuseSlipResolutionModal({
  isOpen,
  onClose,
  classId: _classId,
  requests,
  attendanceRecords: _attendanceRecords,
  onRefresh,
}: ExcuseSlipResolutionModalProps) {
  const { supabase } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  const handleApprove = async (req: ExcuseRequest) => {
    if (!supabase || isProcessing) return;
    setIsProcessing(true);
    try {
      await approveExcuse(supabase, req);
      await onRefresh();
      setFeedbackMsg(`Approved excuse slip for ${req.studentName}. Status changed to Excused (E).`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve excuse");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineConfirm = async (req: ExcuseRequest) => {
    if (!supabase || isProcessing) return;
    const reason = declineReason.trim() || "Did not meet institutional excuse policy criteria.";
    
    setIsProcessing(true);
    try {
      await declineExcuse(supabase, req.id, reason);
      await onRefresh();
      setDecliningRequestId(null);
      setDeclineReason("");
      setFeedbackMsg(`Declined excuse request for ${req.studentName}.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline excuse");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7C1D26] text-white text-[10px] font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Attendance Clearance</span>
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                {pendingRequests.length} Pending Slip(s)
              </span>
            </div>
            <h2 className="text-lg font-black text-zinc-950 mt-1">
              Excuse Slip Resolution Queue
            </h2>
            <p className="text-xs text-zinc-500">
              Review student excuse submissions, inspect medical documents, and convert absences to Excused (E).
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Queue Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-200/80 bg-white">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "pending"
                ? "border-[#7C1D26] text-[#7C1D26]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === "resolved"
                ? "border-[#7C1D26] text-[#7C1D26]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Resolved History ({resolvedRequests.length})
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "pending" && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-800">No Pending Excuse Requests</p>
                  <p className="text-xs text-zinc-500">
                    All student-submitted excuse slips for this class have been processed.
                  </p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-4 hover:border-zinc-300 transition"
                  >
                    {/* Top Row: Student info & date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-700">
                          {req.studentName[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-950">
                            {req.studentName}
                          </h4>
                          <span className="font-mono text-xs text-zinc-500">
                            {req.studentNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-mono font-semibold self-start sm:self-center">
                        <Calendar className="w-3.5 h-3.5 text-[#7C1D26]" />
                        <span>Absence Date: {req.date}</span>
                      </div>
                    </div>

                    {/* Excuse Reason */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Reason for Absence:
                      </span>
                      <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                        &quot;{req.reason}&quot;
                      </p>
                    </div>

                    {/* Attached Document Link / Preview Button */}
                    {req.documentUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200/80">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-xs font-semibold text-blue-900 truncate max-w-xs sm:max-w-md">
                            Attached Medical Certificate / Excuse Slip
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewDocUrl(req.documentUrl || null)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Slip</span>
                        </button>
                      </div>
                    )}

                    {/* Decline Reason Expandable Area */}
                    {decliningRequestId === req.id ? (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                        <span className="text-xs font-bold text-rose-900">
                          State Reason for Declining:
                        </span>
                        <input
                          type="text"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="e.g. Incomplete hospital stamp..."
                          className="w-full px-3 py-2 rounded-lg border border-rose-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <div className="flex flex-wrap gap-1">
                          {COMMON_DECLINE_REASONS.map((comm) => (
                            <button
                              key={comm}
                              type="button"
                              onClick={() => setDeclineReason(comm)}
                              className="px-2 py-0.5 rounded bg-white border border-rose-200 text-[10px] text-rose-800 hover:bg-rose-100 transition cursor-pointer"
                            >
                              +{comm}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDecliningRequestId(null);
                              setDeclineReason("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs text-zinc-600 hover:bg-zinc-200 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineConfirm(req)}
                            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Confirm Decline
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Action Controls */
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setDecliningRequestId(req.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approve & Mark as Excused (E)</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "resolved" && (
            <div className="space-y-3">
              {resolvedRequests.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-8">
                  No resolved excuse requests in record.
                </p>
              ) : (
                resolvedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">
                          {req.studentName}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {req.date}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-md">
                        {req.reason}
                      </p>
                      {req.rejectionReason && (
                        <p className="text-[11px] text-rose-700 font-semibold mt-1">
                          Reason: {req.rejectionReason}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {req.status === "approved" ? "Approved" : "Declined"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#7C1D26]" />
                <span>Submitted Verification Slip Preview</span>
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
                alt="Excuse Slip"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
              >
                Back to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
