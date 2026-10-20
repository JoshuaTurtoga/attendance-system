"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { AuthShell, AuthField, AuthErrorBanner } from "./auth-shell";
import {
  DEPARTMENTS,
  isUniversityEmail,
  universityEmailErrorMessage,
  validateStudentNumber,
  UNIVERSITY_EMAIL_DOMAIN,
} from "@/lib/auth/auth-engine";
import {
  Mail,
  Lock,
  User,
  Hash,
  Building2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export function AuthRegisterScreen() {
  const { registerStudent, goToScreen } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStudentNumber(studentNumber)) {
      setError("Student number must follow the YYYY-NNNNN format (e.g. 2024-10492).");
      return;
    }
    if (!isUniversityEmail(email)) {
      setError(universityEmailErrorMessage());
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const result = await registerStudent({
      firstName,
      middleName,
      lastName,
      studentNumber,
      email,
      password,
      department,
    });
    if (!result.ok) {
      setError(result.error ?? "Unable to create your account.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Student Registration"
      title="Create your student account"
      subtitle="Register with your university details. Faculty accounts are provisioned by the administration."
      footer={
        <span>
          Already registered?{" "}
          <button
            type="button"
            onClick={() => goToScreen("login")}
            className="font-bold text-[#7C1D26] hover:underline cursor-pointer whitespace-nowrap"
          >
            Sign in
          </button>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthErrorBanner message={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField
            label="First Name"
            placeholder="Sofia"
            icon={<User className="w-4 h-4" />}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <AuthField
            label="Last Name"
            placeholder="Aquino"
            icon={<User className="w-4 h-4" />}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <AuthField
          label="Middle Name (optional)"
          placeholder="B."
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />

        <AuthField
          label="Student Number"
          placeholder="2024-10492"
          hint="Format: YYYY-NNNNN"
          icon={<Hash className="w-4 h-4" />}
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
          required
        />

        <AuthField
          label="University Email"
          type="email"
          autoComplete="email"
          placeholder={`you@${UNIVERSITY_EMAIL_DOMAIN}`}
          hint={`Must end with @${UNIVERSITY_EMAIL_DOMAIN}`}
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block">
          <span className="block text-xs font-semibold text-zinc-700 mb-1.5 whitespace-nowrap">
            Academic Department
          </span>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
              <Building2 className="w-4 h-4" />
            </span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#7C1D26] focus:border-transparent transition cursor-pointer"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <AuthField
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            icon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-sm font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
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

export default AuthRegisterScreen;
