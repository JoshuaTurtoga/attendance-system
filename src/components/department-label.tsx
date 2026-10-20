"use client";

import React from "react";
import { parseDepartment } from "@/lib/auth/auth-engine";

export interface DepartmentLabelProps {
  department?: string | null;
  fallback?: string;
  className?: string;
  showCodeOnDesktop?: boolean;
}

/**
 * Responsive Department Label
 *
 * Renders the complete official department name on larger screens (desktop/tablet)
 * and only the abbreviation on smaller devices (mobile).
 */
export function DepartmentLabel({
  department,
  fallback = "",
  className = "",
  showCodeOnDesktop = false,
}: DepartmentLabelProps) {
  const raw = department || fallback;
  if (!raw) return null;

  const { name, code } = parseDepartment(raw);

  // If no parsing could be done or string is custom fallback
  if (!name && !code) {
    return <span className={className}>{fallback}</span>;
  }

  const desktopText = showCodeOnDesktop && code ? `${name} (${code})` : name || code;
  const mobileText = code || name;

  return (
    <span className={className} title={code ? `${name} (${code})` : name}>
      <span className="hidden sm:inline">{desktopText}</span>
      <span className="sm:hidden">{mobileText}</span>
    </span>
  );
}

/**
 * Responsive Department Badge
 *
 * Visual pill badge displaying full name + code pill on desktop,
 * and code badge only on mobile screens.
 */
export function DepartmentBadge({
  department,
  className = "",
}: {
  department?: string | null;
  className?: string;
}) {
  if (!department) return null;
  const { name, code } = parseDepartment(department);

  return (
    <span
      className={`px-3 py-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-800 shadow-xs inline-flex items-center gap-1.5 ${className}`}
      title={code ? `${name} (${code})` : name}
    >
      <span className="hidden sm:inline">{name}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200/80 text-zinc-700 font-mono font-bold">
        {code}
      </span>
    </span>
  );
}
