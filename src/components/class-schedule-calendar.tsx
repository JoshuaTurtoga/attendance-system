"use client";

import React from "react";
import type { AcademicClass } from "@/types";
import {
  WEEKDAYS,
  filterClassesForDay,
  formatTime12Hour,
} from "@/lib/schedule/timetable-engine";
import { Clock, MapPin, ArrowRight } from "lucide-react";

interface ClassScheduleCalendarProps {
  classes: AcademicClass[];
  onSelectClass: (cls: AcademicClass) => void;
}

export function ClassScheduleCalendar({
  classes,
  onSelectClass,
}: ClassScheduleCalendarProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 tracking-tight">
            Weekly Interactive Schedule Grid
          </h3>
          <p className="text-xs text-zinc-500">
            Click on any scheduled subject block to navigate directly into its Class Workspace
          </p>
        </div>
      </div>

      {/* Responsive Weekly Timetable Grid */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 min-w-[760px]">
          {WEEKDAYS.map((day) => {
            const scheduledItems = filterClassesForDay(classes, day);

            return (
              <div
                key={day}
                className="flex flex-col rounded-2xl bg-zinc-50/70 border border-zinc-200/70 p-3 min-h-[360px]"
              >
                {/* Day Header */}
                <div className="pb-2.5 mb-2.5 border-b border-zinc-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 tracking-tight">
                    {day}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-zinc-200/60 text-zinc-600">
                    {scheduledItems.length}
                  </span>
                </div>

                {/* Day's Subject Blocks */}
                <div className="flex-1 space-y-2.5">
                  {scheduledItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-[11px] text-zinc-400 font-medium">
                        No classes scheduled
                      </p>
                    </div>
                  ) : (
                    scheduledItems.map(({ class: cls, block }) => (
                      <button
                        key={`${cls.id}-${day}-${block.startTime}`}
                        onClick={() => onSelectClass(cls)}
                        className="group w-full text-left p-3 rounded-xl bg-white border border-zinc-200/80 hover:border-[#7C1D26]/40 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-l-4 border-l-[#7C1D26] cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-mono font-bold text-[#7C1D26]">
                            {cls.courseCode}
                          </span>
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                            {cls.section}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-zinc-900 mt-1 line-clamp-1 group-hover:text-[#7C1D26] transition">
                          {cls.courseTitle}
                        </p>

                        <div className="mt-2.5 space-y-1 text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">
                              {formatTime12Hour(block.startTime)} - {formatTime12Hour(block.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate font-medium text-zinc-700">
                              {block.room}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-[#7C1D26] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
