"use client";

import React, { useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/auth-context";
import type { AcademicClass } from "@/types";
import type { CreateClassInput } from "@/lib/data/classes";
import { ClassScheduleCalendar } from "./class-schedule-calendar";
import { CreateClassModal } from "./create-class-modal";
import { EmptyState } from "./empty-state";
import type { WorkspaceTab } from "./class-workspace";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Users,
  Sparkles,
  TrendingUp,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { formatTime12Hour } from "@/lib/schedule/timetable-engine";
import { DepartmentLabel } from "./department-label";

const emptySubscribe = () => () => {};

export interface OpenClassOptions {
  tab?: WorkspaceTab;
  rollCall?: boolean;
  gradingToday?: boolean;
}

export type InstructorViewTab = "today" | "calendar" | "classes";

export interface InstructorHubProps {
  activeTab?: InstructorViewTab;
  classes: AcademicClass[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onCreateClass: (input: CreateClassInput) => Promise<void>;
  onOpenClass: (cls: AcademicClass, options?: OpenClassOptions) => void;
}

export function InstructorHub({
  activeTab = "today",
  classes,
  isLoading = false,
  errorMessage = null,
  onCreateClass,
  onOpenClass,
}: InstructorHubProps) {
  const { currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

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

  const currentTime = new Date();
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTimeStr = `${currentHours.toString().padStart(2, "0")}:${currentMinutes
    .toString()
    .padStart(2, "0")}`;

  const sortedTodayClasses = [...classes].sort((a, b) => {
    const timeA = a.schedule[0]?.startTime || "23:59";
    const timeB = b.schedule[0]?.startTime || "23:59";
    return timeA.localeCompare(timeB);
  });

  const handleClassCreated = async (input: CreateClassInput) => {
    await onCreateClass(input);
  };

  const instructorLastName = currentUser?.lastName ?? "";
  const instructorDepartment = currentUser?.department ?? "Faculty";

  const emptyState = (
    <EmptyState
      icon={<BookOpen className="w-6 h-6" />}
      title="No classes created yet"
      description="Create your first class workspace to start recording attendance and grades. Every class gets its own roster, schedule, and join code."
      action={
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 hover:bg-[#5E141B] transition cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Create New Class</span>
        </button>
      }
    />
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="stagger-block flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl glass-card border-l-4 border-l-[#7C1D26]"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7C1D26]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Faculty Workspace</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-zinc-950 mt-1 tracking-tight truncate">
            Good day{instructorLastName ? `, ${instructorLastName}` : ""}
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1 truncate">
            <DepartmentLabel department={instructorDepartment} fallback="Faculty" /> • {classes.length} active{" "}
            {classes.length === 1 ? "class" : "classes"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C1D26] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 hover:bg-[#5E141B] transition cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create New Class</span>
          </button>
        </div>
      </div>

      {/* View: Today's Dashboard */}
      {activeTab === "today" && (
        <div className="space-y-5">
          <div
            className="stagger-block flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            <h2 className="text-base md:text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7C1D26] shrink-0" />
              <span>Today&apos;s Classes &amp; Quick Actions</span>
            </h2>
            <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
              {todayFormatted}
            </span>
          </div>

          {errorMessage ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-xs font-semibold text-zinc-500">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
              Loading your classes…
            </div>
          ) : classes.length === 0 ? (
            emptyState
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {sortedTodayClasses.map((cls, idx) => {
              const primaryBlock = cls.schedule[0];
              const isCompleted = primaryBlock && primaryBlock.endTime < currentTimeStr;

              return (
                <div
                  key={cls.id}
                  className={`stagger-block group flex flex-col justify-between p-5 rounded-2xl bg-white border shadow-sm transition-all duration-200 border-l-4 ${
                    isCompleted
                      ? "border-zinc-200 border-l-zinc-300 opacity-60 hover:opacity-100"
                      : "border-zinc-200/90 hover:shadow-md hover:-translate-y-0.5 border-l-[#7C1D26]"
                  }`}
                  style={{ "--i": 2 + idx } as React.CSSProperties}
                >
                  {/* Single click target: opens the class workspace (roster) */}
                  <button
                    type="button"
                    onClick={() => onOpenClass(cls)}
                    className="text-left w-full cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                            isCompleted
                              ? "text-zinc-500 bg-zinc-100 border-zinc-200"
                              : "text-[#7C1D26] bg-[#7C1D26]/5 border-[#7C1D26]/20"
                          }`}
                        >
                          {cls.courseCode} • {cls.section}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-600 whitespace-nowrap">
                            Completed
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80 whitespace-nowrap shrink-0">
                        {cls.classType}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold tracking-tight transition mt-2.5 ${
                        isCompleted
                          ? "text-zinc-600 group-hover:text-zinc-900"
                          : "text-zinc-950 group-hover:text-[#7C1D26]"
                      }`}
                    >
                      {cls.courseTitle}
                    </h3>

                    <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
                      {primaryBlock && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="whitespace-nowrap">
                              {formatTime12Hour(primaryBlock.startTime)} -{" "}
                              {formatTime12Hour(primaryBlock.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{primaryBlock.room}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="whitespace-nowrap">
                          Join Code:{" "}
                          <strong className="font-mono text-[#7C1D26]">
                            {cls.joinCode}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Distinct quick actions (DOCUMENTATION.md § 4.B.2) */}
                  <div className="pt-5 mt-5 border-t border-zinc-100 space-y-2">
                    <button
                      onClick={() =>
                        onOpenClass(cls, { tab: "attendance", rollCall: true })
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Record Attendance Today</span>
                    </button>
                    <button
                      onClick={() =>
                        onOpenClass(cls, { tab: "grades", gradingToday: true })
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-medium transition cursor-pointer whitespace-nowrap"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#7C1D26] shrink-0" />
                      <span>Record Grades Today</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* View: Weekly Schedule Timetable Grid (DOCUMENTATION.md § 4.B.3) */}
      {activeTab === "calendar" && (
        <div className="stagger-block" style={{ "--i": 1 } as React.CSSProperties}>
          {classes.length === 0 && !isLoading ? (
            emptyState
          ) : (
            <ClassScheduleCalendar
              classes={classes}
              onSelectClass={(cls) => onOpenClass(cls)}
            />
          )}
        </div>
      )}

      {/* View: All Classes Grid */}
      {activeTab === "classes" && (
        classes.length === 0 && !isLoading ? (
          emptyState
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls, idx) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => onOpenClass(cls)}
              className="stagger-block text-left p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-[#7C1D26]/40 transition space-y-4 cursor-pointer group"
              style={{ "--i": 1 + idx } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block text-xs font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20 whitespace-nowrap">
                    {cls.courseCode} • {cls.section}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 mt-2 group-hover:text-[#7C1D26] transition">
                    {cls.courseTitle}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 truncate">
                    {cls.units} Units • {cls.term}
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 whitespace-nowrap shrink-0">
                  {cls.classType}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-zinc-600 truncate">
                  Join Code: {cls.joinCode}
                </span>
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#7C1D26] whitespace-nowrap shrink-0">
                  Open
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
        )
      )}

      {/* Class Creation Modal */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClassCreated={handleClassCreated}
      />
    </div>
  );
}

export default InstructorHub;
