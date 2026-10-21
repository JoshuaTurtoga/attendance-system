"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  BarChart3,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Rapid Roll-Call",
    body: "Single-key attendance capture with P / L / E / A statuses and an automated session engine.",
  },
  {
    icon: TrendingUp,
    title: "Categorized Gradebook",
    body: "Quizzes, performance tasks, and exams with strict blank-vs-zero score handling.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Standing",
    body: "Live attendance rate, effective absences, and institutional marks for every student.",
  },
  {
    icon: ShieldCheck,
    title: "Academic Privacy Lock",
    body: "Administrators manage accounts and policies but can never mutate grades or attendance.",
  },
  {
    icon: Clock,
    title: "Configurable FDA Rules",
    body: "Per-class tardy-to-absent ratios and failure-due-to-absence thresholds.",
  },
  {
    icon: Users,
    title: "Smart Roster Sync",
    body: "Join requests matched to the master roster, with cross-module conflict detection.",
  },
];

const ROLES = [
  {
    name: "For Instructors",
    points: [
      "Own the roll-call and gradebook for assigned classes",
      "Launch rapid roll-call and grading in seconds",
    ],
  },
  {
    name: "For Students",
    points: [
      "Track attendance standing and assessment results",
      "Join classes with a code and file excuse slips",
    ],
  },
  {
    name: "For Administrators",
    points: [
      "Provision faculty accounts and manage departments",
      "Oversee classes with read-only academic visibility",
    ],
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col">
      {/* Public Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-zinc-200/80">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#7C1D26] text-white flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-zinc-950 tracking-tight text-base truncate block leading-none">
                AcademiaTrack
              </span>
              <span className="hidden sm:block text-[11px] text-zinc-500 truncate">
                Digital Class Record & Attendance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition whitespace-nowrap cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-2 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C1D26]/5 border border-[#7C1D26]/15 text-[11px] font-bold uppercase tracking-wider text-[#7C1D26] whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              Multi-Role Academic Platform
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tight mt-5 leading-[1.1]">
              Digitize your class records and daily attendance.
            </h1>
            <p className="text-sm md:text-base text-zinc-600 mt-5 leading-relaxed max-w-xl">
              AcademiaTrack unifies roll-call, categorized grading, and
              real-time academic standing for instructors, students, and
              administrators — with strict academic data isolation built in.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition whitespace-nowrap cursor-pointer"
              >
                Enter the Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-zinc-200 hover:border-[#7C1D26]/40 hover:bg-zinc-50 text-zinc-800 text-sm font-bold shadow-xs transition whitespace-nowrap cursor-pointer"
              >
                Student Registration
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-[#7C1D26]" />
                Role-based access
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7C1D26]" />
                Academic data isolation
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-[#7C1D26]" />
                Real-time sync
              </span>
            </div>
          </div>

          {/* Preview Card */}
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-[#7C1D26]/10" />
            <div className="relative rounded-3xl bg-white border border-zinc-200/80 shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Attendance Session
                  </p>
                  <p className="text-sm font-bold text-zinc-950 truncate">
                    STAS 101 • E106-R
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-[#7C1D26]/5 text-[#7C1D26] border border-[#7C1D26]/20 whitespace-nowrap">
                  2026-10-16
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Present", value: "31", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                  { label: "Late", value: "2", tone: "text-amber-700 bg-amber-50 border-amber-200" },
                  { label: "Excused", value: "1", tone: "text-blue-700 bg-blue-50 border-blue-200" },
                  { label: "Absent", value: "1", tone: "text-rose-700 bg-rose-50 border-rose-200" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl border px-2 py-2.5 ${s.tone}`}
                  >
                    <p className="text-lg font-black font-mono leading-none">
                      {s.value}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider mt-1.5 whitespace-nowrap">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
                {[
                  { name: "Sofia Aquino", status: "P", tone: "text-emerald-700 bg-emerald-50" },
                  { name: "Miguel Torres", status: "L", tone: "text-amber-700 bg-amber-50" },
                  { name: "Bianca Rivera", status: "A", tone: "text-rose-700 bg-rose-50" },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="text-xs font-semibold text-zinc-700 truncate">
                      {r.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${r.tone}`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full bg-white border-y border-zinc-200/80">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C1D26]">
              Platform Capabilities
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-950 tracking-tight mt-2">
              Everything an academic record needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 hover:border-[#7C1D26]/30 hover:bg-white transition space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950">{f.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((r) => (
            <div
              key={r.name}
              className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4"
            >
              <h3 className="text-sm font-bold text-zinc-950">{r.name}</h3>
              <ul className="space-y-2">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C1D26] shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-zinc-900 text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Ready to start your academic term?
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Sign in with your university account or register as a student to
              join your first class.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-5 py-3 rounded-2xl bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-100 transition whitespace-nowrap cursor-pointer text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-3 rounded-2xl bg-[#7C1D26] text-white text-sm font-bold hover:bg-[#5E141B] transition whitespace-nowrap cursor-pointer text-center"
            >
              Student Registration
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-zinc-200/80 py-6 px-4 md:px-8 text-center text-xs text-zinc-400">
        AcademiaTrack • Digital Class Record & Attendance System • University
        Academic Suite
      </footer>
    </div>
  );
}

export default LandingPage;
