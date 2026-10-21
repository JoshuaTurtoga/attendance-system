"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ClassWorkspace,
  type WorkspaceTab,
} from "@/components/class-workspace";
import { usePortal } from "@/components/portal-shell";

const VALID_WORKSPACE_TABS: WorkspaceTab[] = [
  "roster",
  "attendance",
  "grades",
  "notes",
];

function ClassWorkspaceContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { classes, selectedClass, isLoadingClasses } = usePortal();

  const classId = params.classId as string;
  const rawTab = params.tab as string;
  const tab: WorkspaceTab = VALID_WORKSPACE_TABS.includes(rawTab as WorkspaceTab)
    ? (rawTab as WorkspaceTab)
    : "roster";

  const rollCall = searchParams.get("rollCall") === "true";
  const gradingToday = searchParams.get("gradingToday") === "true";

  const targetClass =
    selectedClass?.id === classId
      ? selectedClass
      : classes.find((c) => c.id === classId);

  if (!targetClass) {
    if (isLoadingClasses) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
            Loading class workspace…
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-base font-bold text-zinc-900">Class Workspace Not Found</h2>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm">
          The requested class does not exist or you do not have permission to access it.
        </p>
      </div>
    );
  }

  return (
    <ClassWorkspace
      academicClass={targetClass}
      activeTab={tab}
      autoLaunchRollCall={rollCall}
      autoLaunchGradingToday={gradingToday}
    />
  );
}

export default function InstructorClassWorkspaceTabPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
            Loading class workspace…
          </div>
        </div>
      }
    >
      <ClassWorkspaceContent />
    </Suspense>
  );
}
