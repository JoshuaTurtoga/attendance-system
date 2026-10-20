"use client";

import React, { useState } from "react";
import type { UserProfile } from "@/types";
import {
  provisionInstructorAccount,
  type ProvisionInstructorParams,
} from "@/lib/admin/admin-portal-engine";
import {
  UserPlus,
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Building,
} from "lucide-react";

interface AdminProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUsers: UserProfile[];
  departments: string[];
  onInstructorProvisioned: (newUser: UserProfile) => void;
}

export function AdminProvisionModal({
  isOpen,
  onClose,
  existingUsers,
  departments,
  onInstructorProvisioned,
}: AdminProvisionModalProps) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(
    departments[0] || "College of Business and Accountancy: CBA"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [provisionedData, setProvisionedData] = useState<{
    user: UserProfile;
    temporaryPassword: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const params: ProvisionInstructorParams = {
      firstName,
      middleName,
      lastName,
      email,
      department,
    };

    // Validate locally (required fields + duplicate email) before provisioning.
    const validation = provisionInstructorAccount(params, existingUsers);
    if (!validation.success || !validation.temporaryPassword) {
      setErrorMsg(validation.error || "Failed to provision instructor account.");
      return;
    }

    const temporaryPassword = validation.temporaryPassword;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/provision-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, password: temporaryPassword }),
      });
      const payload = (await response.json()) as {
        user?: UserProfile;
        error?: string;
      };
      if (!response.ok || !payload.user) {
        setErrorMsg(payload.error || "Failed to provision instructor account.");
        return;
      }

      onInstructorProvisioned(payload.user);
      setProvisionedData({ user: payload.user, temporaryPassword });
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!provisionedData) return;
    const creds = `University Faculty Account Credentials\nName: Dr. ${provisionedData.user.firstName} ${provisionedData.user.lastName}\nEmail: ${provisionedData.user.email}\nDepartment: ${provisionedData.user.department}\nTemporary Password: ${provisionedData.temporaryPassword}\n\nPlease sign in at the university portal and reset your password upon first login.`;
    navigator.clipboard.writeText(creds);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleFinish = () => {
    setProvisionedData(null);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-6">
        {provisionedData ? (
          /* Credentials Distribution Card (DOCUMENTATION.md § 4.A) */
          <div className="text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                Faculty Account Provisioned
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Distribute these temporary credentials to the instructor.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-left space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-sans">
                  Assigned Faculty
                </span>
                <span className="font-bold text-zinc-950 text-sm">
                  Dr. {provisionedData.user.firstName} {provisionedData.user.middleName || ""}{" "}
                  {provisionedData.user.lastName}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-sans">
                  Official Email
                </span>
                <span className="text-zinc-800">{provisionedData.user.email}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block font-sans">
                  Academic Department
                </span>
                <span className="text-zinc-800">{provisionedData.user.department}</span>
              </div>

              <div className="pt-2 border-t border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-[#7C1D26] block font-sans">
                  Temporary Password
                </span>
                <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-white border border-zinc-200 shadow-xs">
                  <span className="font-bold text-sm text-[#7C1D26]">
                    {provisionedData.temporaryPassword}
                  </span>
                  <button
                    onClick={handleCopyCredentials}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedPass ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-sans">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] text-left flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                The instructor cannot self-register. Upon first login, they will be prompted to set a permanent password and complete onboarding.
              </span>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
            >
              Done & Return to Directory
            </button>
          </div>
        ) : (
          /* Instructor Provisioning Form */
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Provision Faculty Account</h3>
                  <p className="text-[11px] text-zinc-400">Admin-exclusive account creation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    First Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Arthur"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Middle Name:
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. C."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Last Name:
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Pendelton"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Official University Email:
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arthur.pendelton@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Academic Department:</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Provisioning..." : "Provision Account"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
