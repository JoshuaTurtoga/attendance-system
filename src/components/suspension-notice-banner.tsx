"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertOctagon, X, Phone, Mail } from "lucide-react";

interface SuspensionNoticeBannerProps {
  userRole?: string;
  userName?: string;
}

export function SuspensionNoticeBanner({ userRole, userName }: SuspensionNoticeBannerProps) {
  // Show the prominent pop-up modal notice upon logging in once per session
  const [showModal, setShowModal] = useState(true);

  return (
    <>
      {/* Persistent top institutional warning bar */}
      <div className="w-full bg-rose-50 border-b border-rose-200 px-4 md:px-8 py-3 flex items-center justify-between gap-3 text-rose-950 animate-in fade-in duration-200 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
              Account Suspended
            </span>
            <span className="text-rose-900 font-semibold">
              This account is currently under administrative suspension. Academic record modifications, grading, and attendance recording are restricted.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-[11px] font-bold text-rose-700 hover:text-rose-950 underline decoration-rose-300 hover:decoration-rose-950 underline-offset-2 shrink-0 cursor-pointer hidden sm:inline-block"
        >
          View Notice Details
        </button>
      </div>

      {/* Prominent Modal Notice shown right after logging in */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shadow-xs">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">
                Administrative Notice
              </span>
              <h3 className="text-xl font-black text-zinc-950 tracking-tight mt-0.5">
                Account Administratively Suspended
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-600 leading-relaxed">
              <p>
                Hello {userName ? <strong className="text-zinc-900">{userName}</strong> : "user"}, you have logged in to an account that is currently marked as <strong className="text-rose-700">Suspended</strong> by the university administrator.
              </p>
              <p className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-700 text-[11px]">
                {userRole === "instructor"
                  ? "Your access to class records is restricted to read-only mode. You cannot take daily roll-call, edit grades, or modify course configurations until this suspension is resolved."
                  : "Your account is in read-only status. Academic submissions and enrolment changes are currently locked."}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
              <div className="text-[11px] text-zinc-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>registrar@universityofbohol.edu.ph</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Office of the University Registrar &bull; Admin Bldg</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-3 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                I Understand &bull; Continue in Read-Only
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
