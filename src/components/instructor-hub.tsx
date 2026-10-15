"use client";

import React, { useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/auth-context";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const emptySubscribe = () => () => {};

export function InstructorHub() {
  const { currentUser } = useAuth();

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const todayFormatted = isMounted
    ? new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Today's Schedule";

  // Demo classes for the instructor's "Today" Hub
  const todayClasses = [
    {
      id: "cls_01",
      code: "STAS 101",
      title: "Science, Technology and Society",
      section: "E106-R",
      type: "Lecture",
      time: "09:00 AM - 10:30 AM",
      room: "Room 402, Science Bldg",
      enrolled: 42,
      pendingRequests: 3,
      status: "Upcoming",
    },
    {
      id: "cls_02",
      code: "CS 312",
      title: "Algorithms & Complex Data Structures",
      section: "CS3A",
      type: "Laboratory",
      time: "01:00 PM - 03:00 PM",
      room: "Lab 3, IT Center",
      enrolled: 38,
      pendingRequests: 0,
      status: "Scheduled",
    },
    {
      id: "cls_03",
      code: "IT 221",
      title: "Database Management Systems",
      section: "IT2B",
      type: "Lecture",
      time: "03:30 PM - 05:00 PM",
      room: "Room 205, Main Hall",
      enrolled: 45,
      pendingRequests: 5,
      status: "Scheduled",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border-l-4 border-l-[#7C1D26]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7C1D26]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-950 mt-1 tracking-tight">
            Good day, Dr. {currentUser.lastName}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Department of {currentUser.department} • 3 classes scheduled today
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 hover:bg-[#5E141B] transition cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {/* "Today" Dashboard: Daily Quick-Access Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7C1D26]" />
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
              Today&apos;s Schedule & Quick Actions
            </h2>
          </div>
          <span className="text-xs text-zinc-500">
            {todayFormatted}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {todayClasses.map((cls) => (
            <div
              key={cls.id}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-l-4 border-l-[#7C1D26]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20">
                    {cls.code} • {cls.section}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                    {cls.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mt-2.5 tracking-tight group-hover:text-[#7C1D26] transition">
                  {cls.title}
                </h3>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cls.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cls.enrolled} Students Enrolled</span>
                    {cls.pendingRequests > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.2 rounded border border-rose-200">
                        {cls.pendingRequests} join requests
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions (DOCUMENTATION.md § 4.B.2) */}
              <div className="pt-5 mt-5 border-t border-zinc-100 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Record Attendance Today</span>
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-medium transition cursor-pointer">
                  <TrendingUp className="w-3.5 h-3.5 text-[#7C1D26]" />
                  <span>Record Grades Today</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Pills Preview */}
      <div className="p-5 rounded-2xl glass-card border border-zinc-200/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Configured Attendance Status Design Tokens
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill-status-p text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Present (P)
          </span>
          <span className="pill-status-l text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Late (L) • 3 Lates = 1 Absent
          </span>
          <span className="pill-status-e text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Excused (E) • Non-Penalized
          </span>
          <span className="pill-status-a text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Absent (A) • Triggers FDA Warning at 3
          </span>
        </div>
      </div>
    </div>
  );
}
