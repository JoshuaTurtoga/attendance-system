"use client";

import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import { LandingPage } from "./landing-page";
import { AuthLoginScreen } from "./auth-login-screen";
import { AuthRegisterScreen } from "./auth-register-screen";
import { AuthOtpResetScreen } from "./auth-otp-reset-screen";
import { DatabaseZap } from "lucide-react";

/**
 * Shown when the Supabase environment variables are absent so the operator
 * knows the deployment is not yet connected to a live backend.
 */
function SupabaseSetupNotice() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200/80 shadow-xl p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
          <DatabaseZap className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-bold text-zinc-950 mt-5">
          Backend not connected
        </h1>
        <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
          This deployment has no Supabase credentials configured. Set
          <span className="font-mono text-[#7C1D26]"> NEXT_PUBLIC_SUPABASE_URL </span>
          and
          <span className="font-mono text-[#7C1D26]"> NEXT_PUBLIC_SUPABASE_ANON_KEY </span>
          in your environment, then redeploy.
        </p>
      </div>
    </div>
  );
}

/**
 * Public authentication entry point. Renders the landing page and the
 * login / student registration / OTP password reset screens before the
 * authenticated role portals become reachable.
 */
export function AuthPortal() {
  const { authScreen, isConfigured } = useAuth();

  if (!isConfigured) {
    return <SupabaseSetupNotice />;
  }

  switch (authScreen) {
    case "login":
      return <AuthLoginScreen />;
    case "register":
      return <AuthRegisterScreen />;
    case "forgot":
      return <AuthOtpResetScreen />;
    case "landing":
    default:
      return <LandingPage />;
  }
}

export default AuthPortal;
