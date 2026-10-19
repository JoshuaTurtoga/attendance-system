"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { AuthShell, AuthField, AuthErrorBanner } from "./auth-shell";
import { maskEmail, OTP_LENGTH } from "@/lib/auth/auth-engine";
import {
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

type Step = "email" | "otp" | "password";

export function AuthOtpResetScreen() {
  const {
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    goToScreen,
  } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [issuedOtp, setIssuedOtp] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = requestPasswordResetOtp(email);
    if (!result.ok) {
      setError(result.error ?? "Unable to send a verification code.");
      return;
    }
    setError(null);
    setIssuedOtp(result.otp ?? null);
    setNotice(`A ${OTP_LENGTH}-digit verification code was sent to ${maskEmail(email)}.`);
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifyPasswordResetOtp(email, otp);
    if (!result.ok) {
      setError(result.error ?? "Unable to verify the code.");
      return;
    }
    setError(null);
    setNotice(null);
    setStep("password");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = resetPassword(email, otp, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to reset your password.");
    }
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset your password"
      subtitle="Verify your identity with a one-time code, then set a new password."
      footer={
        <button
          type="button"
          onClick={() => goToScreen("login")}
          className="font-bold text-[#7C1D26] hover:underline cursor-pointer whitespace-nowrap"
        >
          Return to sign in
        </button>
      }
    >
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["email", "otp", "password"] as Step[]).map((s, idx) => {
          const order = ["email", "otp", "password"];
          const isDone = order.indexOf(step) > idx;
          const isActive = step === s;
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border transition ${
                  isActive
                    ? "bg-[#7C1D26] text-white border-[#7C1D26]"
                    : isDone
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-zinc-400 border-zinc-200"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </span>
              {idx < 2 && (
                <span
                  className={`h-0.5 flex-1 rounded-full ${
                    isDone ? "bg-emerald-200" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <AuthErrorBanner message={error} />

      {notice && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
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
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap"
          >
            Send Verification Code
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {issuedOtp && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <span className="font-medium">
                Demonstration code (no email is sent):
              </span>
              <span className="font-mono font-black tracking-widest text-sm whitespace-nowrap">
                {issuedOtp}
              </span>
            </div>
          )}
          <AuthField
            label="Verification Code"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            placeholder={"0".repeat(OTP_LENGTH)}
            icon={<KeyRound className="w-4 h-4" />}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap"
          >
            Verify Code
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setIssuedOtp(null);
              setNotice(null);
              setError(null);
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Use a different email
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <AuthField
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <AuthField
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter new password"
            icon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap"
          >
            Set New Password
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default AuthOtpResetScreen;
