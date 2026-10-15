"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import {
  GraduationCap,
  KeyRound,
  BookOpen,
} from "lucide-react";

export function StudentHub() {
  const { currentUser } = useAuth();
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const enrolledClasses = [
    {
      id: "cls_01",
      code: "STAS 101",
      title: "Science, Technology and Society",
      instructor: "Dr. Arthur Pendelton",
      schedule: "Mon/Wed 09:00 AM - 10:30 AM",
      room: "Room 402",
      attendance: {
        present: 12,
        late: 1,
        excused: 0,
        absent: 0,
        effectiveAbsences: 0,
        status: "Good Standing",
      },
    },
    {
      id: "cls_02",
      code: "CS 312",
      title: "Algorithms & Complex Data Structures",
      instructor: "Prof. Elena Vance",
      schedule: "Tue/Thu 01:00 PM - 03:00 PM",
      room: "Lab 3",
      attendance: {
        present: 10,
        late: 3,
        excused: 1,
        absent: 1,
        effectiveAbsences: 2, // 1 + floor(3/3)
        status: "Notice: 2 Effective Absences",
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border-l-4 border-l-emerald-600">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <GraduationCap className="w-4 h-4" />
            <span>Student Academic Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-950 mt-1 tracking-tight">
            Welcome, {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-mono">
            Student ID: {currentUser.studentNumber} • {currentUser.department}
          </p>
        </div>

        {/* Join Class Quick Input */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200/90 shadow-sm">
          <KeyRound className="w-4 h-4 text-zinc-400 ml-2" />
          <input
            type="text"
            maxLength={6}
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="6-CHAR CLASS CODE"
            className="w-36 px-2 py-1.5 text-xs font-mono uppercase font-semibold text-zinc-900 focus:outline-none"
          />
          <button className="px-3 py-1.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold transition cursor-pointer">
            Join Class
          </button>
        </div>
      </div>

      {/* Enrolled Classes Grid */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#7C1D26]" />
          <span>My Enrolled Classes & Academic Standing</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrolledClasses.map((cls) => {
            const hasNotice = cls.attendance.effectiveAbsences >= 2;
            return (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20">
                      {cls.code}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 mt-2">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {cls.instructor} • {cls.room}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      hasNotice
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {cls.attendance.status}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-100 grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-700">
                      {cls.attendance.present}
                    </p>
                    <p className="text-[10px] text-zinc-500">Present (P)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                    <p className="text-xs font-bold text-amber-700">
                      {cls.attendance.late}
                    </p>
                    <p className="text-[10px] text-zinc-500">Late (L)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                    <p className="text-xs font-bold text-blue-700">
                      {cls.attendance.excused}
                    </p>
                    <p className="text-[10px] text-zinc-500">Excused (E)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                    <p className="text-xs font-bold text-rose-700">
                      {cls.attendance.absent}
                    </p>
                    <p className="text-[10px] text-zinc-500">Absent (A)</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
