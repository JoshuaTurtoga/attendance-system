"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound, Check, LogOut } from "lucide-react";

interface FirstTimePasswordModalProps {
  isOpen: boolean;
}

export function FirstTimePasswordModal({ isOpen }: FirstTimePasswordModalProps) {
  const { currentUser, completePasswordReset, signOut } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await completePasswordReset(password);
    if (!result.ok) {
      setError(result.error || "Failed to update password. Please try again.");
      setIsSubmitting(false);
    }
    // On success, currentUser.mustResetPassword is updated in AuthContext, closing the modal.
  };

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center mx-auto border border-[#7C1D26]/20 shadow-xs">
            <KeyRound className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-zinc-950 tracking-tight">
            Set Your Permanent Password
          </h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Welcome, <span className="font-semibold text-zinc-800">{currentUser.firstName}</span>! You signed in with a temporary password. Establish your secure password to access your workspace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">
              New Permanent Password:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">
              Confirm New Password:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5 text-[11px] text-zinc-600 font-medium">
            <div className="flex items-center gap-2">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasMinLength
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className={hasMinLength ? "text-emerald-700 font-semibold" : ""}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasLetter && hasNumber
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className={hasLetter && hasNumber ? "text-emerald-700 font-semibold" : ""}>
                Contains both letters and numbers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  passwordsMatch
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-200 text-zinc-400"
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </div>
              <span className={passwordsMatch ? "text-emerald-700 font-semibold" : ""}>
                Passwords match
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch}
            className="w-full py-3 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Saving Permanent Password…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Password &amp; Enter Workspace</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Need to sign out instead?</span>
          </button>
        </div>
      </div>
    </div>
  );
}
