"use client";

import React from "react";

export interface EmptyStateProps {
  /** Lucide icon element rendered inside the garnet badge. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional call-to-action (button / link). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Shared production empty state. Used everywhere a list can legitimately be
 * empty (no classes, no roster, no grades, no notifications) so the system is
 * ready for real institutional onboarding without any mock scaffolding.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 ${
        className ?? ""
      }`}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7C1D26]/5 border border-[#7C1D26]/15 text-[#7C1D26] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
