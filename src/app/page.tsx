"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { LandingPage } from "@/components/landing-page";
import { GraduationCap } from "lucide-react";
import { getLastActivePath, getRoleDefaultRoute } from "@/lib/routing/routes";

export default function RootHomePage() {
  const { isAuthenticated, isLoading, activeView } = useAuth();
  const router = useRouter();

  // Redirect authenticated returning users to their active portal or last view
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const savedPath = getLastActivePath(activeView);
      const destination = savedPath || getRoleDefaultRoute(activeView);
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, activeView, router]);

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

  if (isAuthenticated) {
    return null;
  }

  // Public university landing page
  return <LandingPage />;
}
