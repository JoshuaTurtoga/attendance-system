"use client";

import React from "react";
import {
  ShieldAlert,
  Users,
  Settings,
  GraduationCap,
  Lock,
  UserPlus,
  BookOpen,
} from "lucide-react";

export function AdminHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Strict Privacy Banner */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950">
        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-900 text-sm">
            Institutional Governance & Strict Academic Privacy Active
          </p>
          <p className="text-amber-800 leading-relaxed">
            As System Administrator, you manage accounts, departments, and institutional policies.
            Per university policy (DOCUMENTATION.md § 3.5),{" "}
            <strong>
              academic records (grades, roll-calls, student scores) are strictly locked and cannot be edited by administrators.
            </strong>{" "}
            Only the assigned class faculty can modify academic records.
          </p>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty Members</span>
            <Users className="w-4 h-4 text-[#7C1D26]" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 mt-2">128</p>
          <p className="text-xs text-zinc-500 mt-1">Across 8 university departments</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 mt-2">3,420</p>
          <p className="text-xs text-zinc-500 mt-1">Official university credentials</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Classes</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 mt-2">214</p>
          <p className="text-xs text-zinc-500 mt-1">1st Semester 2026-2027</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance Rule</span>
            <Lock className="w-4 h-4 text-zinc-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 mt-2">3 L = 1 A</p>
          <p className="text-xs text-zinc-500 mt-1">Max 4 Absences before FDA</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#7C1D26]" />
            <h3 className="font-bold text-zinc-900 text-base">Provision Faculty Account</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Faculty accounts cannot self-register. Provision instructors with temporary credentials and assigned academic departments.
          </p>
          <button className="px-4 py-2 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold transition cursor-pointer">
            Provision New Instructor
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#7C1D26]" />
            <h3 className="font-bold text-zinc-900 text-base">Institutional Term & Policy Config</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Configure active semester calendar dates, departmental structures, and failure due to absences (FDA) thresholds.
          </p>
          <button className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition cursor-pointer">
            Configure Term Settings
          </button>
        </div>
      </div>
    </div>
  );
}
