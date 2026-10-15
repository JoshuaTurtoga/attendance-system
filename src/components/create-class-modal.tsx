"use client";

import React, { useState } from "react";
import type { AcademicClass, ClassType, ScheduleBlock } from "@/types";
import { generateClassCode } from "@/lib/attendance/attendance-engine";
import { WEEKDAYS, DayOfWeek } from "@/lib/schedule/timetable-engine";
import {
  X,
  Sparkles,
  RefreshCw,
  Plus,
  Calendar,
  Sliders,
} from "lucide-react";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClass: AcademicClass) => void;
  instructorId: string;
}

export function CreateClassModal({
  isOpen,
  onClose,
  onClassCreated,
  instructorId,
}: CreateClassModalProps) {
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [section, setSection] = useState("");
  const [classType, setClassType] = useState<ClassType>("Lecture");
  const [units, setUnits] = useState(3);
  const [term, setTerm] = useState("1st Semester 2026-2027");

  // Client-safe initial join code without calling Math.random during SSR prerender
  const [generatedCode, setGeneratedCode] = useState(() =>
    typeof window !== "undefined" ? generateClassCode() : "ABC234"
  );

  // Dynamic Scheduling Mode Toggle (DOCUMENTATION.md § 4.B.4)
  const [isDynamicSchedule, setIsDynamicSchedule] = useState(false);

  // Standard mode schedule state
  const [standardDays, setStandardDays] = useState<DayOfWeek[]>(["Monday", "Wednesday"]);
  const [standardStartTime, setStandardStartTime] = useState("09:00");
  const [standardEndTime, setStandardEndTime] = useState("10:30");
  const [standardRoom, setStandardRoom] = useState("Room 402");

  // Dynamic schedule state (custom block per day)
  const [dynamicBlocks, setDynamicBlocks] = useState<ScheduleBlock[]>([
    { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Room 402" },
    { dayOfWeek: "Wednesday", startTime: "13:00", endTime: "15:00", room: "Lab 3" },
  ]);

  if (!isOpen) return null;

  const handleRegenerateCode = () => {
    setGeneratedCode(generateClassCode());
  };

  const toggleStandardDay = (day: DayOfWeek) => {
    if (standardDays.includes(day)) {
      if (standardDays.length > 1) {
        setStandardDays(standardDays.filter((d) => d !== day));
      }
    } else {
      setStandardDays([...standardDays, day]);
    }
  };

  const handleDynamicBlockChange = (
    index: number,
    field: keyof ScheduleBlock,
    value: string
  ) => {
    const updated = [...dynamicBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicBlocks(updated);
  };

  const addDynamicBlock = () => {
    const unusedDay = WEEKDAYS.find((d) => !dynamicBlocks.some((b) => b.dayOfWeek === d)) || "Friday";
    setDynamicBlocks([
      ...dynamicBlocks,
      { dayOfWeek: unusedDay, startTime: "09:00", endTime: "10:30", room: "TBA" },
    ]);
  };

  const removeDynamicBlock = (index: number) => {
    if (dynamicBlocks.length > 1) {
      setDynamicBlocks(dynamicBlocks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !section.trim()) return;

    let finalSchedule: ScheduleBlock[] = [];
    if (isDynamicSchedule) {
      finalSchedule = dynamicBlocks;
    } else {
      finalSchedule = standardDays.map((day) => ({
        dayOfWeek: day,
        startTime: standardStartTime,
        endTime: standardEndTime,
        room: standardRoom.trim() || "TBA",
      }));
    }

    const newClass: AcademicClass = {
      id: `cls_${Date.now()}`,
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim() || courseCode.trim().toUpperCase(),
      section: section.trim().toUpperCase(),
      classType,
      units,
      term,
      instructorId,
      joinCode: generatedCode,
      schedule: finalSchedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onClassCreated(newClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Create Class Workspace
              </h2>
              <p className="text-xs text-zinc-500">
                Configure course metadata, schedule, and join credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Course Code, Title & Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. STAS 101"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-mono font-medium"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Course Title
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Science, Technology and Society"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-medium"
              />
            </div>
          </div>

          {/* Row 2: Section, Class Type, Units, Term */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Section *
              </label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. E106-R"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Class Type
              </label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as ClassType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-medium bg-white"
              >
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Units
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Academic Term
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-medium"
              />
            </div>
          </div>

          {/* Join Code Display with Regenerate Button */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Generated Class Join Code
              </p>
              <p className="text-base font-mono font-bold text-[#7C1D26] tracking-widest mt-0.5">
                {generatedCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRegenerateCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Regenerate</span>
            </button>
          </div>

          {/* Schedule Configuration */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#7C1D26]" />
                <span>Schedule & Room Assignment</span>
              </label>

              {/* Dynamic Scheduling Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDynamicSchedule}
                  onChange={(e) => setIsDynamicSchedule(e.target.checked)}
                  className="rounded border-zinc-300 text-[#7C1D26] focus:ring-[#7C1D26]/40 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-zinc-400" />
                  Different Rooms & Schedules per Day
                </span>
              </label>
            </div>

            {/* Standard Mode */}
            {!isDynamicSchedule ? (
              <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 space-y-4">
                <div>
                  <span className="block text-[11px] font-semibold text-zinc-500 mb-2">
                    Select Days of the Week:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const isSelected = standardDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleStandardDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            isSelected
                              ? "bg-[#7C1D26] text-white border-[#7C1D26]"
                              : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={standardStartTime}
                      onChange={(e) => setStandardStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={standardEndTime}
                      onChange={(e) => setStandardEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                      Room (defaults to TBA)
                    </label>
                    <input
                      type="text"
                      value={standardRoom}
                      onChange={(e) => setStandardRoom(e.target.value)}
                      placeholder="e.g. Room 402"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-medium"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Dynamic Mode: Independent Blocks */
              <div className="space-y-3">
                {dynamicBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center"
                  >
                    <div>
                      <select
                        value={block.dayOfWeek}
                        onChange={(e) =>
                          handleDynamicBlockChange(idx, "dayOfWeek", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-semibold"
                      >
                        {WEEKDAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={block.startTime}
                        onChange={(e) =>
                          handleDynamicBlockChange(idx, "startTime", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={block.endTime}
                        onChange={(e) =>
                          handleDynamicBlockChange(idx, "endTime", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={block.room}
                        onChange={(e) =>
                          handleDynamicBlockChange(idx, "room", e.target.value)
                        }
                        placeholder="Room"
                        className="flex-1 px-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white font-medium"
                      />
                      {dynamicBlocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDynamicBlock(idx)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDynamicBlock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-zinc-300 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:border-zinc-400 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Day Block</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
            >
              Save Class Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
