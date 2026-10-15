"use client";

import React, { useState } from "react";
import { useAuth, DEMO_USERS } from "@/features/auth/auth-context";
import {
  GraduationCap,
  ShieldCheck,
  User,
  ChevronDown,
  ArrowLeftRight,
  BookOpen,
} from "lucide-react";
import type { Role } from "@/types";

export function Navbar() {
  const {
    currentUser,
    activeView,
    availableViews,
    isDualRole,
    switchView,
    selectPersona,
    activePersonaKey,
  } = useAuth();

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "admin":
        return "Admin POV";
      case "instructor":
        return "Instructor POV";
      case "student":
        return "Student POV";
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case "admin":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "instructor":
        return "bg-rose-50 text-[#7C1D26] border-[#7C1D26]/20";
      case "student":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav px-4 md:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C1D26] text-white flex items-center justify-center shadow-sm shadow-[#7C1D26]/20">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-950 tracking-tight text-base md:text-lg">
                AcademiaTrack
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Digital Class Record & Attendance System
            </p>
          </div>
        </div>

        {/* Center: Frosted Glass POV Toggle Pill (for dual-role users) */}
        {isDualRole ? (
          <div className="flex items-center p-1 rounded-full bg-zinc-100/90 border border-zinc-200/80 shadow-inner">
            {availableViews.map((view) => {
              const isActive = activeView === view;
              return (
                <button
                  key={view}
                  onClick={() => switchView(view)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-[#7C1D26] shadow-sm font-semibold border border-zinc-200/60"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {view === "admin" ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7C1D26]" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-[#7C1D26]" />
                  )}
                  {getRoleLabel(view)}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span
              className={`px-2.5 py-1 rounded-full border text-xs font-medium ${getRoleBadgeStyle(
                activeView
              )}`}
            >
              {getRoleLabel(activeView)}
            </span>
          </div>
        )}

        {/* Right: Active Persona Switcher & User Profile */}
        <div className="relative flex items-center gap-2">
          {/* Persona Switcher Pill */}
          <button
            onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white/80 hover:bg-white text-xs font-medium text-zinc-700 transition shadow-sm cursor-pointer"
            title="Switch demo persona"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Role Persona:</span>
            <span className="font-semibold text-zinc-900">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Persona Dropdown */}
          {personaMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setPersonaMenuOpen(false)}
              />
              <div className="absolute right-0 top-12 z-40 w-72 rounded-2xl bg-white border border-zinc-200/80 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Switch Test Persona
                  </p>
                  <p className="text-xs text-zinc-500">
                    Test different multi-role privileges
                  </p>
                </div>
                <div className="space-y-1 mt-1">
                  {Object.entries(DEMO_USERS).map(([key, persona]) => {
                    const isSelected = activePersonaKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          selectPersona(key as keyof typeof DEMO_USERS);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-[#7C1D26]/5 border border-[#7C1D26]/20"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 overflow-hidden text-zinc-600 font-semibold text-xs">
                          {persona.firstName[0]}
                          {persona.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {persona.firstName} {persona.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {persona.roles.map((r) => (
                              <span
                                key={r}
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getRoleBadgeStyle(
                                  r
                                )}`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-500 truncate mt-1">
                            {persona.department || persona.studentNumber}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#7C1D26]/10 border border-[#7C1D26]/20 flex items-center justify-center text-[#7C1D26] font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
