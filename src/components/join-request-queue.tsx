"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import type { JoinRequest, RosterStudent } from "@/types";
import {
  matchJoinRequestToRoster,
} from "@/lib/roster/smart-matching-engine";
import {
  approveJoinRequest,
  declineJoinRequest,
  listJoinRequests,
  listRoster,
} from "@/lib/data/roster";
import {
  Sparkles,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

interface JoinRequestQueueProps {
  classId: string;
  requests: JoinRequest[];
  roster: RosterStudent[];
  onRosterUpdated: (newRoster: RosterStudent[]) => void;
  onRequestStatusUpdated: (updatedRequests: JoinRequest[]) => void;
  isRestricted?: boolean;
}

export function JoinRequestQueue({
  classId,
  requests,
  roster,
  onRosterUpdated,
  onRequestStatusUpdated,
  isRestricted = false,
}: JoinRequestQueueProps) {
  const { supabase, currentUser } = useAuth();
  const isSuspended = isRestricted || Boolean(currentUser?.isSuspended);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [declineModalReq, setDeclineModalReq] = useState<JoinRequest | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const refreshData = async () => {
    if (!supabase) return;
    try {
      const [newRoster, newRequests] = await Promise.all([
        listRoster(supabase, classId),
        listJoinRequests(supabase, classId),
      ]);
      onRosterUpdated(newRoster);
      onRequestStatusUpdated(newRequests);
    } catch (err) {
      console.error("Failed to refresh join queue data", err);
    }
  };

  const handleApprove = async (req: JoinRequest) => {
    if (!supabase || isProcessing || isSuspended) return;
    setIsProcessing(true);
    try {
      await approveJoinRequest(supabase, req);
      await refreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineModalReq || !supabase || isProcessing || isSuspended) return;
    setIsProcessing(true);
    try {
      await declineJoinRequest(
        supabase,
        declineModalReq.id,
        declineReason.trim() || "Applicant declined by instructor."
      );
      await refreshData();
      setDeclineModalReq(null);
      setDeclineReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline request");
    } finally {
      setIsProcessing(false);
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200">
        <UserCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
        <h4 className="font-bold text-zinc-900 text-sm">Join Request Queue Clear</h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          All student join requests have been processed. Students entering your Course Code + Class Join Code will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C1D26]" />
            <span>Smart Matching Join Queue</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Smart Matching automatically identifies which pre-populated roster slot matches each applicant.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          {pendingRequests.length} Pending
        </span>
      </div>

      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingRequests.map((req) => {
          const matchResult = matchJoinRequestToRoster(req, roster);

          return (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start gap-3.5">
                {/* Photo ID Avatar (Click to Enlarge) */}
                <button
                  type="button"
                  onClick={() => setSelectedPhotoModal(req.photoIdUrl)}
                  className="relative group shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer shadow-xs"
                  title="Click to view full ID photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={req.photoIdUrl}
                    alt={req.studentName}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Student Credential Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-zinc-950 truncate">
                      {req.studentName}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(req.submittedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-[#7C1D26] mt-0.5">
                    {req.studentNumber}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
                    <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-medium">
                      {req.program}
                    </span>
                    <span>•</span>
                    <span>{req.academicLevel}</span>
                  </div>
                </div>
              </div>

              {/* Smart Matching Result Banner */}
              <div className="p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border">
                {matchResult.matchType === "EXACT_ID" && (
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/60 p-1 rounded-lg w-full">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">
                      Exact ID Match:{" "}
                      <strong>
                        {matchResult.matchedStudent?.lastName},{" "}
                        {matchResult.matchedStudent?.firstName}
                      </strong>
                    </span>
                  </div>
                )}

                {matchResult.matchType === "NAME_MATCH" && (
                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50/60 p-1 rounded-lg w-full">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold truncate">
                      Name Match:{" "}
                      <strong>
                        {matchResult.matchedStudent?.lastName},{" "}
                        {matchResult.matchedStudent?.firstName}
                      </strong>
                    </span>
                  </div>
                )}

                {matchResult.matchType === "NONE" && (
                  <div className="flex items-center gap-2 text-zinc-600 bg-zinc-50 p-1 rounded-lg w-full">
                    <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Not in pre-populated roster list</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSuspended) setDeclineModalReq(req);
                  }}
                  disabled={isSuspended}
                  title={isSuspended ? "Join request resolution disabled while suspended." : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 transition whitespace-nowrap ${
                    isSuspended ? "opacity-40 cursor-not-allowed" : "hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isSuspended) handleApprove(req);
                  }}
                  disabled={isSuspended}
                  title={isSuspended ? "Join request resolution disabled while suspended." : undefined}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C1D26] text-white text-xs font-semibold shadow-xs transition whitespace-nowrap ${
                    isSuspended ? "opacity-40 cursor-not-allowed" : "hover:bg-[#5E141B] cursor-pointer"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Link Slot</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Photo ID Enlarge Modal */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-md w-full shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-800">
                Official University Student ID Photo
              </span>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhotoModal}
              alt="University ID"
              className="w-full rounded-2xl object-cover max-h-80 shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-zinc-900">
              Decline Join Request for {declineModalReq.studentName}
            </h4>
            <p className="text-xs text-zinc-500">
              Provide an optional reason for the student (e.g. invalid photo ID, wrong section).
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Please re-upload a clearer photo of your university ID card."
              className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeclineModalReq(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineConfirm}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
