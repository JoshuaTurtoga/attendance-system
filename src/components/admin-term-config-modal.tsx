"use client";

import React, { useState } from "react";
import {
  type SystemPolicyConfig,
  validateSystemPolicyConfig,
} from "@/lib/admin/admin-portal-engine";
import {
  Settings,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";
import { parseDepartment } from "@/lib/auth/auth-engine";

interface AdminTermConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: SystemPolicyConfig;
  onSaveConfig: (updatedConfig: SystemPolicyConfig) => void;
}

export function AdminTermConfigModal({
  isOpen,
  onClose,
  initialConfig,
  onSaveConfig,
}: AdminTermConfigModalProps) {
  const [activeTerm, setActiveTerm] = useState(initialConfig.activeTerm);
  const [miniTerm, setMiniTerm] = useState(initialConfig.miniTerm || "");
  const [lateToAbsentRatio, setLateToAbsentRatio] = useState(
    initialConfig.lateToAbsentRatio
  );
  const [maxAbsenceThreshold, setMaxAbsenceThreshold] = useState(
    initialConfig.maxAbsenceThreshold
  );
  const [departments, setDepartments] = useState<string[]>([
    ...initialConfig.departments,
  ]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newDeptName.trim();
    if (!trimmedName) return;

    let trimmedCode = newDeptCode.trim().toUpperCase();
    if (!trimmedCode) {
      // Derive uppercase abbreviation if empty
      const words = trimmedName.split(/\s+/).filter(Boolean);
      trimmedCode =
        words.length > 1
          ? words.map((w) => w[0].toUpperCase()).join("")
          : trimmedName.slice(0, 4).toUpperCase();
    }

    const formatted = `${trimmedName}: ${trimmedCode}`;
    if (
      departments.some((d) => {
        const parsed = parseDepartment(d);
        return (
          parsed.name.toLowerCase() === trimmedName.toLowerCase() ||
          parsed.code.toLowerCase() === trimmedCode.toLowerCase()
        );
      })
    ) {
      setErrorMsg(`Department "${trimmedName}" (${trimmedCode}) already exists.`);
      return;
    }

    setDepartments([...departments, formatted]);
    setNewDeptName("");
    setNewDeptCode("");
    setErrorMsg(null);
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    if (departments.length <= 1) {
      setErrorMsg("The institution must have at least one department.");
      return;
    }
    setDepartments(departments.filter((d) => d !== deptToRemove));
    setErrorMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const proposedConfig: SystemPolicyConfig = {
      activeTerm: activeTerm.trim(),
      miniTerm: miniTerm.trim() || undefined,
      lateToAbsentRatio,
      maxAbsenceThreshold,
      departments,
    };

    const validation = validateSystemPolicyConfig(proposedConfig);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid configuration.");
      return;
    }

    onSaveConfig(proposedConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                Institutional Policy & Term Settings
              </h3>
              <p className="text-[11px] text-zinc-400">
                Global attendance policies & academic calendar
              </p>
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

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Institutional policies updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Academic Term Configuration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7C1D26]" />
              Academic Term & Cycle
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Active Term Title:
                </label>
                <input
                  type="text"
                  required
                  value={activeTerm}
                  onChange={(e) => setActiveTerm(e.target.value)}
                  placeholder="e.g. 1st Semester 2026-2027"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Term Sub-Cycles:
                </label>
                <input
                  type="text"
                  value={miniTerm}
                  onChange={(e) => setMiniTerm(e.target.value)}
                  placeholder="e.g. Prelim - Midterm - Finals"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                />
              </div>
            </div>
          </div>

          {/* Attendance Rules (DOCUMENTATION.md § 4.A) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7C1D26]" />
              University Attendance Rules & FDA
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Late-to-Absent Ratio (L : A)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={lateToAbsentRatio}
                    onChange={(e) =>
                      setLateToAbsentRatio(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-20 px-3 py-1.5 rounded-xl border border-zinc-200 text-center text-sm font-bold text-[#7C1D26] bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
                  />
                  <span className="text-xs text-zinc-500">
                    Lates = 1 Absent
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Default: 3 Lates count as 1 Absent toward FDA cut-limits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Maximum Absence Cut-Limit (FDA)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={maxAbsenceThreshold}
                    onChange={(e) =>
                      setMaxAbsenceThreshold(parseInt(e.target.value, 10) || 2)
                    }
                    className="w-20 px-3 py-1.5 rounded-xl border border-zinc-200 text-center text-sm font-bold text-rose-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs text-zinc-500">
                    Absences = FDA
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Students crossing this limit trigger Failure Due to Absences.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#7C1D26]" />
              Academic Departments ({departments.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="Department Name (e.g. College of Pharmacy)"
                className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26]"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                  placeholder="Code (e.g. COP)"
                  className="w-24 px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddDepartment}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              {departments.map((dept) => {
                const { name, code } = parseDepartment(dept);
                return (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-800 shadow-xs"
                    title={code ? `${name} (${code})` : name}
                  >
                    <span className="hidden sm:inline">{name}</span>
                    <span className="sm:hidden">{code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-mono font-bold">
                      {code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDepartment(dept)}
                      className="text-zinc-400 hover:text-rose-600 transition cursor-pointer ml-0.5"
                      title="Remove Department"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Updates to the FDA cut-limit or late-to-absent ratios take effect across all faculty attendance matrices instantly upon saving.
            </p>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
            >
              Save Institutional Policies
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
