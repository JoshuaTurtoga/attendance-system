"use client";

import React, { useState, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/auth-context";
import type { AcademicClass } from "@/types";
import { ClassScheduleCalendar } from "./class-schedule-calendar";
import { CreateClassModal } from "./create-class-modal";
import { ClassWorkspace } from "./class-workspace";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Users,
  Sparkles,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import { formatTime12Hour } from "@/lib/schedule/timetable-engine";

const emptySubscribe = () => () => {};

// Initial default classes for the instructor
const INITIAL_CLASSES: AcademicClass[] = [
  {
    id: "cls_01",
    courseCode: "STAS 101",
    courseTitle: "Science, Technology and Society",
    section: "E106-R",
    classType: "Lecture",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "usr_dual_01",
    joinCode: "STA823",
    schedule: [
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Room 402, Science Bldg" },
      { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:30", room: "Room 402, Science Bldg" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cls_02",
    courseCode: "CS 312",
    courseTitle: "Algorithms & Complex Data Structures",
    section: "CS3A",
    classType: "Laboratory",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "usr_dual_01",
    joinCode: "ALG491",
    schedule: [
      { dayOfWeek: "Monday", startTime: "13:00", endTime: "15:00", room: "Lab 3, IT Center" },
      { dayOfWeek: "Thursday", startTime: "13:00", endTime: "15:00", room: "Lab 3, IT Center" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cls_03",
    courseCode: "IT 221",
    courseTitle: "Database Management Systems",
    section: "IT2B",
    classType: "Lecture",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "usr_dual_01",
    joinCode: "DBM902",
    schedule: [
      { dayOfWeek: "Tuesday", startTime: "10:30", endTime: "12:00", room: "Room 205, Main Hall" },
      { dayOfWeek: "Friday", startTime: "10:30", endTime: "12:00", room: "Room 205, Main Hall" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type InstructorViewTab = "today" | "calendar" | "classes";

export function InstructorHub() {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<AcademicClass[]>(INITIAL_CLASSES);
  const [selectedClass, setSelectedClass] = useState<AcademicClass | null>(null);
  const [viewTab, setViewTab] = useState<InstructorViewTab>("today");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleClassCreated = (newClass: AcademicClass) => {
    setClasses((prev) => [newClass, ...prev]);
    setSelectedClass(newClass);
  };

  // If a class is currently selected, render the isolated Class Workspace (DOCUMENTATION.md § 4.B.5)
  if (selectedClass) {
    return (
      <ClassWorkspace
        academicClass={selectedClass}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

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
            Department of {currentUser.department} • {classes.length} active classes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 hover:bg-[#5E141B] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Today vs Weekly Timetable vs All Classes */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-1">
        <button
          onClick={() => setViewTab("today")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            viewTab === "today"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today&apos;s Hub</span>
        </button>

        <button
          onClick={() => setViewTab("calendar")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            viewTab === "calendar"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Weekly Schedule (Timetable)</span>
        </button>

        <button
          onClick={() => setViewTab("classes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            viewTab === "classes"
              ? "bg-[#7C1D26] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Classes ({classes.length})</span>
        </button>
      </div>

      {/* View: Today's Dashboard */}
      {viewTab === "today" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7C1D26]" />
              <span>Today&apos;s Classes & Quick Actions</span>
            </h2>
            <span className="text-xs text-zinc-500 font-medium">{todayFormatted}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const primaryBlock = cls.schedule[0];
              return (
                <div
                  key={cls.id}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-l-4 border-l-[#7C1D26]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20">
                        {cls.courseCode} • {cls.section}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                        {cls.classType}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="text-left w-full mt-2.5 cursor-pointer"
                    >
                      <h3 className="text-base font-bold text-zinc-950 tracking-tight group-hover:text-[#7C1D26] transition">
                        {cls.courseTitle}
                      </h3>
                    </button>

                    <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                      {primaryBlock && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                              {formatTime12Hour(primaryBlock.startTime)} -{" "}
                              {formatTime12Hour(primaryBlock.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{primaryBlock.room}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Join Code: <strong className="font-mono text-[#7C1D26]">{cls.joinCode}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions (DOCUMENTATION.md § 4.B.2) */}
                  <div className="pt-5 mt-5 border-t border-zinc-100 space-y-2">
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Attendance Today</span>
                    </button>
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-medium transition cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#7C1D26]" />
                      <span>Record Grades Today</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Weekly Schedule Timetable Grid (DOCUMENTATION.md § 4.B.3) */}
      {viewTab === "calendar" && (
        <ClassScheduleCalendar
          classes={classes}
          onSelectClass={(cls) => setSelectedClass(cls)}
        />
      )}

      {/* View: All Classes Grid */}
      {viewTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20">
                    {cls.courseCode} • {cls.section}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 mt-2">
                    {cls.courseTitle}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {cls.units} Units • {cls.term}
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {cls.classType}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-600">
                  Join Code: {cls.joinCode}
                </span>
                <button
                  onClick={() => setSelectedClass(cls)}
                  className="px-3 py-1.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Open Class
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Creation Modal */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClassCreated={handleClassCreated}
        instructorId={currentUser.id}
      />
    </div>
  );
}
