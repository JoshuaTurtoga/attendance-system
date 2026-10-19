"use client";

import React, { useState } from "react";
import { useAuth, DEMO_USERS } from "@/features/auth/auth-context";
import { AuthShell, AuthField, AuthErrorBanner } from "./auth-shell";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  instructor: "Instructor",
  admin: "Admin",
  student: "Student",
};

export function AuthLoginScreen() {
  const { signIn, goToScreen, demoPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
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

        <AuthField
          label="University Email"
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
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
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap"
        >
          Sign In
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

      {/* Demo Accounts */}
      <div className="mt-8 pt-6 border-t border-zinc-200/80">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Demonstration Accounts
        </p>
        <div className="space-y-2">
          {Object.entries(DEMO_USERS).map(([key, user]) => (
            <button
              key={key}
              type="button"
              onClick={() => fillDemoAccount(user.email)}
              className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition text-left cursor-pointer group"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono truncate">
                  {user.email}
                </p>
              </div>
              <span className="flex items-center gap-1 shrink-0">
                {user.roles.map((r) => (
                  <span
                    key={r}
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600 whitespace-nowrap"
                  >
                    {ROLE_LABEL[r] ?? r}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400 mt-3">
          Select an account to auto-fill its credentials, then press Sign In.
        </p>
      </div>
    </AuthShell>
  );
}

export default AuthLoginScreen;
