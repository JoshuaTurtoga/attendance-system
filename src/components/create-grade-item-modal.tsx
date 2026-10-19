"use client";

import React, { useState } from "react";
import type { GradeCategory, GradeItem } from "@/types";
import {
  TrendingUp,
  X,
  Calendar,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";

interface CreateGradeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: GradeItem, startGradingNow: boolean) => void;
  classId: string;
}

export function CreateGradeItemModal({
  isOpen,
  onClose,
  onSave,
  classId,
}: CreateGradeItemModalProps) {
  const [category, setCategory] = useState<GradeCategory>("quiz");
  const [title, setTitle] = useState("");
  const [maxScore, setMaxScore] = useState<number>(20);
  const [weightPercentage, setWeightPercentage] = useState<number>(25);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: GradeCategory) => {
    setCategory(cat);
    if (cat === "quiz") {
      setMaxScore(20);
      setWeightPercentage(25);
    } else if (cat === "exam") {
      setMaxScore(100);
      setWeightPercentage(30);
    } else if (cat === "performance_task") {
      setMaxScore(50);
      setWeightPercentage(45);
    }
  };

  const handleSetToday = () => {
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = (startGradingNow: boolean) => {
    if (!title.trim()) {
      setError("Please provide an assessment activity title.");
      return;
    }

    if (maxScore <= 0 || isNaN(maxScore)) {
      setError("Max score must be a positive number.");
      return;
    }

    const newItem: GradeItem = {
      id: `gi_${Date.now()}`,
      classId,
      category,
      title: title.trim(),
      maxScore: Number(maxScore),
      weightPercentage: Number(weightPercentage) || 25,
      date,
    };

    onSave(newItem, startGradingNow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C1D26]/10 text-[#7C1D26] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-950 tracking-tight">
                Add a Grade to Record
              </h2>
              <p className="text-xs text-zinc-500">
                Create a quiz, exam, or performance task for grading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Assessment Category:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleCategoryChange("quiz")}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                category === "quiz"
                  ? "border-[#7C1D26] bg-[#7C1D26]/5 text-[#7C1D26] font-bold shadow-xs"
                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-medium"
              }`}
            >
              <Award className="w-4 h-4 mx-auto mb-1 opacity-70" />
              <span className="text-xs block">Quizzes (25%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("performance_task")}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                category === "performance_task"
                  ? "border-[#7C1D26] bg-[#7C1D26]/5 text-[#7C1D26] font-bold shadow-xs"
                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-medium"
              }`}
            >
              <Layers className="w-4 h-4 mx-auto mb-1 opacity-70" />
              <span className="text-xs block">PTs (45%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("exam")}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                category === "exam"
                  ? "border-[#7C1D26] bg-[#7C1D26]/5 text-[#7C1D26] font-bold shadow-xs"
                  : "border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-medium"
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 opacity-70" />
              <span className="text-xs block">Major Exam (30%)</span>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">
            Assessment Title / Name:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Quiz 3: Normalization & Functional Dependency"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition"
          />
        </div>

        {/* Max Score & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">
              Maximum Score (Points):
            </label>
            <input
              type="number"
              min="1"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700">Date:</label>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[10px] font-bold text-[#7C1D26] hover:underline cursor-pointer"
              >
                Today
              </button>
            </div>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition"
              />
            </div>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">
            Optional Notes:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions or remarks for this activity..."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C1D26] transition min-h-[80px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition cursor-pointer"
          >
            Save Activity Only
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-bold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save & Record Grades Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
