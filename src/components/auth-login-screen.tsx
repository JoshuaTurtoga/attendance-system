"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { AuthShell, AuthField, AuthErrorBanner } from "./auth-shell";
import { UNIVERSITY_EMAIL_DOMAIN } from "@/lib/auth/auth-engine";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { resolvePostLoginRedirect } from "@/lib/routing/routes";

export function AuthLoginScreen() {
  const { signIn, goToScreen, authNotice, clearNotice, activeView } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    clearNotice();
    const result = await signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      setIsSubmitting(false);
    } else {
      const redirectTo = searchParams ? searchParams.get("redirectTo") : null;
      const destination = resolvePostLoginRedirect(redirectTo, activeView);
      window.location.href = destination;
    }
  };

  return (
    <AuthShell
      eyebrow="Secure Access"
      title="Sign in to your portal"
      subtitle="Use your university email to reach the instructor, student, or administrator workspace."
      footer={
        <span>
          New student?{" "}
          <button
            type="button"
            onClick={() => goToScreen("register")}
            className="font-bold text-[#7C1D26] hover:underline cursor-pointer whitespace-nowrap"
          >
            Create an account
          </button>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthErrorBanner message={error} />

        {authNotice && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authNotice}</span>
          </div>
        )}

        <AuthField
          label="University Email"
          type="email"
          autoComplete="email"
          placeholder={`you@${UNIVERSITY_EMAIL_DOMAIN}`}
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <AuthField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => goToScreen("forgot")}
            className="text-xs font-semibold text-[#7C1D26] hover:underline cursor-pointer whitespace-nowrap"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => goToScreen("landing")}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </button>
      </form>
    </AuthShell>
  );
}

export default AuthLoginScreen;
