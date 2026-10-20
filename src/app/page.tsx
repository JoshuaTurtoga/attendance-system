"use client";

import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import { AuthPortal } from "@/components/auth-portal";
import { PortalShell } from "@/components/portal-shell";
import { GraduationCap } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Resolve the stored session before choosing a portal so a returning user
  // never briefly sees the public landing page.
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#FAFAFA]">
        <div className="w-12 h-12 rounded-2xl bg-[#7C1D26] text-white flex items-center justify-center shadow-md shadow-[#7C1D26]/20">
          <GraduationCap className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
          Restoring your session…
        </div>
      </div>
    );
  }

  // Public landing page + authentication flow gate every role portal.
  if (!isAuthenticated) {
    return <AuthPortal />;
  }

  return <PortalShell />;
}
