"use client";

import React, { useState } from "react";
import type { AcademicClass } from "@/types";
import { formatTime12Hour } from "@/lib/schedule/timetable-engine";
import { ClassRosterTable } from "./class-roster-table";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

interface ClassWorkspaceProps {
  academicClass: AcademicClass;
  onBack: () => void;
}

type WorkspaceTab = "roster" | "attendance" | "grades" | "notes";

export function ClassWorkspace({ academicClass, onBack }: ClassWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("roster");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(academicClass.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Workspace Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-zinc-200/80">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#7C1D26] transition mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Instructor Schedule</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2.5 py-1 rounded-lg border border-[#7C1D26]/20">
              {academicClass.courseCode} • {academicClass.section}
            </span>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80">
              {academicClass.classType}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {academicClass.units} Units • {academicClass.term}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-zinc-950 mt-1.5 tracking-tight">
            {academicClass.courseTitle}
          </h1>

          {/* Schedule Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-600">
            {academicClass.schedule.map((block, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 border border-zinc-200/60 font-medium"
              >
                <Calendar className="w-3 h-3 text-[#7C1D26]" />
                <span>{block.dayOfWeek}</span>
                <Clock className="w-3 h-3 text-zinc-400 ml-1" />
                <span>
                  {formatTime12Hour(block.startTime)} - {formatTime12Hour(block.endTime)}
                </span>
                <MapPin className="w-3 h-3 text-zinc-400 ml-1" />
                <span className="text-zinc-800 font-semibold">{block.room}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Join Code Display */}
        <div className="flex flex-col items-start md:items-end justify-center shrink-0">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Class Join Code
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-lg font-bold text-[#7C1D26] bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs tracking-wider">
              {academicClass.joinCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition shadow-xs cursor-pointer"
              title="Copy join code"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            Share code with students to request enrollment
          </span>
        </div>
      </div>

      {/* 4 Workspace Tabs (DOCUMENTATION.md § 4.B.5) */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-1">
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "roster"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tab 1: Class List & Roster</span>
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "attendance"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Tab 2: Attendance System</span>
        </button>

        <button
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "grades"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tab 3: Categorized Grades</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "notes"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tab 4: Notes</span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm min-h-[400px]">
        {activeTab === "roster" && (
          <ClassRosterTable classId={academicClass.id} />
        )}

        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                  Attendance Sheet & Sessions
                </h3>
                <p className="text-xs text-zinc-500">
                  Master Grid View and Inline Glass Row-Focus Roll-Call
                </p>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#7C1D26] mx-auto opacity-70" />
              <p className="text-sm font-bold text-zinc-800">
                Attendance Matrix & Rapid Roll-Call Ready for Milestone 6/7
              </p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Will bind with single-key shortcuts (P, L, E, A) and sequential row glide.
              </p>
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                  Categorized Grade Matrix
                </h3>
                <p className="text-xs text-zinc-500">
                  Quiz, Exam, and Performance Task components with cross-module sync
                </p>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 text-center space-y-2">
              <TrendingUp className="w-8 h-8 text-[#7C1D26] mx-auto opacity-70" />
              <p className="text-sm font-bold text-zinc-800">
                Gradebook Matrix Ready for Milestone 8/9
              </p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Will calculate weighted totals, handle unrecorded/blank vs 0, and export to Excel (.xlsx).
              </p>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">
              Class Notes & Syllabus
            </h3>
            <p className="text-xs text-zinc-500">
              Instructor notes, lesson outlines, and institutional notices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
