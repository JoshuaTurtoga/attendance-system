"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, AlertCircle } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared responsive frame for every public authentication screen.
 * Renders an institutional brand rail on large screens and stacks to a
 * single column on mobile.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAFA]">
      {/* Institutional Brand Rail (lg+) */}
      <aside className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-[#7C1D26] text-white p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-10 -left-16 w-64 h-64 rounded-full bg-black/10" />

        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#7C1D26] flex items-center justify-center shadow-sm shrink-0">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="font-bold tracking-tight text-lg block leading-none">
              AcademiaTrack
            </span>
            <span className="text-[11px] text-white/70">
              Digital Class Record & Attendance
            </span>
          </div>
        </Link>

        <div className="relative space-y-5 max-w-md">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
            University Academic Suite
          </span>
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            One record of truth for every class session.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Rapid roll-call, categorized gradebooks, and real-time academic
            standing — with strict separation between administrative oversight
            and instructor-owned academic records.
          </p>

          <ul className="grid gap-2.5 pt-2 text-sm text-white/85">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              Attendance statuses P / L / E / A with configurable FDA rules
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              Cross-module sync between roll-call and the gradebook
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
              Admins cannot mutate grades or attendance
            </li>
          </ul>
        </div>

        <p className="relative text-[11px] text-white/50">
          © {new Date().getFullYear()} AcademiaTrack • University Academic Suite
        </p>
      </aside>

      {/* Form Column */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 lg:py-12">
        <div className="w-full max-w-md">
          {/* Compact brand for mobile */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-3 mb-8 w-fit"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C1D26] text-white flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-zinc-950 tracking-tight text-base block leading-none">
                AcademiaTrack
              </span>
              <span className="text-[11px] text-zinc-500">
                Digital Class Record & Attendance
              </span>
            </div>
          </Link>

          <div className="mb-7">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C1D26]">
              {eyebrow}
            </span>
            <h1 className="text-2xl font-bold text-zinc-950 tracking-tight mt-1.5">
              {title}
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5">{subtitle}</p>
          </div>

          {children}

          {footer && (
            <div className="mt-6 text-center text-xs text-zinc-500">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}

export function AuthField({
  label,
  icon,
  hint,
  id,
  className = "",
  ...props
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-zinc-700 mb-1.5 whitespace-nowrap">
        {label}
      </span>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#7C1D26] focus:border-transparent transition ${className}`}
          {...props}
        />
      </div>
      {hint && <span className="block text-[11px] text-zinc-400 mt-1.5">{hint}</span>}
    </label>
  );
}

export function AuthErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
