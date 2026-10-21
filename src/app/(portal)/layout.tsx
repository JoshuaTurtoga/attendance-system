"use client";

import React, { Suspense } from "react";
import { PortalShell } from "@/components/portal-shell";
import { GraduationCap } from "lucide-react";

function PortalSkeletonShell() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#EAEAEF]">
      <aside className="w-full md:w-64 bg-[#EAEAEF] p-4 flex flex-col justify-between shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-[#7C1D26] text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-zinc-950 text-sm block leading-none">AcademiaTrack</span>
            <span className="text-[10px] text-zinc-500">University Suite</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-white">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8" />
        <footer className="w-full border-t border-zinc-100 py-6 px-4 md:px-8 text-center text-xs text-zinc-400">
          <p className="truncate">AcademiaTrack • Digital Class Record &amp; Attendance System • University Academic Suite</p>
        </footer>
      </div>
    </div>
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PortalSkeletonShell />}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
