"use client";

import React, { useState } from "react";
import type { RosterStudent } from "@/types";
import {
  sortRosterAlphabetically,
  parseClipboardRosterData,
  parseStudentName,
  SequencedStudent,
} from "@/lib/roster/roster-engine";
import {
  Users,
  Plus,
  ClipboardPaste,
  Save,
  Trash2,
  Check,
  Search,
  FileSpreadsheet,
  AlertCircle,
  X,
} from "lucide-react";

interface ClassRosterTableProps {
  classId: string;
  initialStudents?: RosterStudent[];
}

// Initial demo roster for immediate rich demonstration
const DEFAULT_ROSTER: RosterStudent[] = [
  {
    id: "stud_01",
    classId: "cls_01",
    studentNumber: "2024-10821",
    lastName: "Aquino",
    firstName: "Sofia",
    middleInitial: "R.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stud_02",
    classId: "cls_01",
    studentNumber: "2024-10001",
    lastName: "Bautista",
    firstName: "Clara",
    middleInitial: "T.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stud_03",
    classId: "cls_01",
    studentNumber: "2024-10492",
    lastName: "Chen",
    firstName: "Marcus",
    middleInitial: "L.",
    program: "BSCS",
    academicLevel: "3rd Year",
  },
  {
    id: "stud_04",
    classId: "cls_01",
    studentNumber: "2024-10555",
    lastName: "Dela Cruz",
    firstName: "Juan",
    middleInitial: "M.",
    program: "BSIT",
    academicLevel: "3rd Year",
  },
  {
    id: "stud_05",
    classId: "cls_01",
    studentNumber: "2024-10319",
    lastName: "Zubiri",
    firstName: "Gabriel",
    middleInitial: "K.",
    program: "BSIT",
    academicLevel: "3rd Year",
  },
];

export function ClassRosterTable({
  classId,
  initialStudents = DEFAULT_ROSTER,
}: ClassRosterTableProps) {
  const [students, setStudents] = useState<RosterStudent[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Bulk paste modal state
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState("");
  const [pastePreview, setPastePreview] = useState<RosterStudent[]>([]);
  const [pasteError, setPasteError] = useState("");

  // New inline row draft
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [draftStudentNumber, setDraftStudentNumber] = useState("");
  const [draftFullName, setDraftFullName] = useState("");
  const [draftProgram, setDraftProgram] = useState("BSCS");
  const [draftLevel, setDraftLevel] = useState("3rd Year");

  // Alphabetically sorted roster
  const sequencedRoster: SequencedStudent[] = sortRosterAlphabetically(students);

  // Search filtered view
  const filteredRoster = sequencedRoster.filter(
    (s) =>
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveAll = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftStudentNumber.trim() || !draftFullName.trim()) return;

    const { lastName, firstName, middleInitial } = parseStudentName(draftFullName);
    const newStudent: RosterStudent = {
      id: `stud_${classId}_${Date.now()}`,
      classId,
      studentNumber: draftStudentNumber.trim(),
      lastName,
      firstName,
      middleInitial,
      program: draftProgram.trim(),
      academicLevel: draftLevel.trim(),
    };

    setStudents((prev) => [...prev, newStudent]);
    setDraftStudentNumber("");
    setDraftFullName("");
    setIsAddingInline(false);
  };

  const handlePreviewPaste = (text: string) => {
    setPasteRawText(text);
    setPasteError("");
    const parsed = parseClipboardRosterData(text, classId);
    if (parsed.length === 0) {
      setPasteError("No valid rows detected. Ensure columns are separated by tabs.");
      setPastePreview([]);
    } else {
      setPastePreview(parsed);
    }
  };

  const handleConfirmPaste = () => {
    if (pastePreview.length > 0) {
      setStudents((prev) => [...prev, ...pastePreview]);
      setIsPasteModalOpen(false);
      setPasteRawText("");
      setPastePreview([]);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Roster Controls & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roster by name, ID..."
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200/90 bg-white w-64 focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 font-medium"
            />
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            Total: <strong>{students.length} students</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Clipboard Bulk Paste Button */}
          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#7C1D26]" />
            <span>Paste from Excel / Sheets</span>
          </button>

          {/* Add Student Inline Button */}
          <button
            onClick={() => setIsAddingInline(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-zinc-600" />
            <span>Add Row</span>
          </button>

          {/* Save All Button */}
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Roster Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5-Column Master Roster Table (DOCUMENTATION.md § 4.B.5.TAB 1) */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/90 border-b border-zinc-200/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-40">Student Number</th>
              <th className="py-3 px-4">Student Name (Last, First M.I.)</th>
              <th className="py-3 px-4 w-36">Program / Strand</th>
              <th className="py-3 px-4 w-32">Academic Level</th>
              <th className="py-3 px-4 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700 font-medium">
            {/* Inline Add Row Form */}
            {isAddingInline && (
              <tr className="bg-[#7C1D26]/5 animate-in fade-in duration-150">
                <td className="py-2.5 px-4 text-center font-bold text-[#7C1D26]">+</td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="2024-XXXXX"
                    value={draftStudentNumber}
                    onChange={(e) => setDraftStudentNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#7C1D26]"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    required
                    placeholder="Last Name, First Name M.I."
                    value={draftFullName}
                    onChange={(e) => setDraftFullName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#7C1D26]"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    placeholder="e.g. BSCS"
                    value={draftProgram}
                    onChange={(e) => setDraftProgram(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    placeholder="e.g. 3rd Year"
                    value={draftLevel}
                    onChange={(e) => setDraftLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                  />
                </td>
                <td className="py-2.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={handleAddInlineSubmit}
                      className="p-1 rounded bg-[#7C1D26] text-white hover:bg-[#5E141B] cursor-pointer"
                      title="Commit Row (Enter)"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsAddingInline(false)}
                      className="p-1 rounded bg-zinc-200 text-zinc-600 hover:bg-zinc-300 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {filteredRoster.length === 0 && !isAddingInline ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-zinc-600">No students on roster</p>
                  <p className="text-[11px] mt-0.5">
                    Click &ldquo;Add Row&rdquo; or &ldquo;Paste from Excel / Sheets&rdquo; to populate the class list.
                  </p>
                </td>
              </tr>
            ) : (
              filteredRoster.map((student) => {
                const fullNameDisplay = `${student.lastName}, ${student.firstName}${
                  student.middleInitial ? ` ${student.middleInitial}` : ""
                }`;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-zinc-50/80 transition-colors group"
                  >
                    {/* Col 1: Sequence # */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                      {student.sequenceNumber}
                    </td>

                    {/* Col 2: Student Number */}
                    <td className="py-3 px-4 font-mono font-bold text-[#7C1D26]">
                      {student.studentNumber}
                    </td>

                    {/* Col 3: Student Name */}
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      {fullNameDisplay}
                    </td>

                    {/* Col 4: Program */}
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[11px]">
                        {student.program}
                      </span>
                    </td>

                    {/* Col 5: Academic Level */}
                    <td className="py-3 px-4 text-zinc-600 text-[11px]">
                      {student.academicLevel}
                    </td>

                    {/* Col 6: Delete action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Clipboard Bulk Import Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-[#7C1D26]" />
                <h3 className="font-bold text-zinc-900 text-base">
                  Paste Class Roster from Excel or Google Sheets
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Copy a 4 or 5-column table from Excel or Google Sheets (`#`, `Student Number`, `Student Name`, `Program`, `Year Level`) and paste it below. Columns are automatically parsed.
            </p>

            <textarea
              rows={6}
              value={pasteRawText}
              onChange={(e) => handlePreviewPaste(e.target.value)}
              placeholder={`Paste copied spreadsheet rows here...\nExample:\n1\t2024-10492\tChen, Marcus L.\tBSCS\t3rd Year\n2\t2024-10821\tAquino, Sofia R.\tBSCS\t3rd Year`}
              className="w-full p-3 rounded-2xl border border-zinc-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7C1D26]/30 bg-zinc-50/50"
            />

            {pasteError && (
              <div className="flex items-center gap-2 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pasteError}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {pastePreview.length > 0 && (
              <div className="space-y-2 flex-1 overflow-y-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Detected {pastePreview.length} Valid Student Records:
                </span>
                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 text-[10px] font-bold text-zinc-500 uppercase">
                      <tr>
                        <th className="py-2 px-3">Student Number</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Program</th>
                        <th className="py-2 px-3">Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {pastePreview.map((s, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50">
                          <td className="py-1.5 px-3 font-mono font-bold text-[#7C1D26]">
                            {s.studentNumber}
                          </td>
                          <td className="py-1.5 px-3">
                            {s.lastName}, {s.firstName} {s.middleInitial || ""}
                          </td>
                          <td className="py-1.5 px-3">{s.program}</td>
                          <td className="py-1.5 px-3 text-zinc-500">{s.academicLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pastePreview.length === 0}
                onClick={handleConfirmPaste}
                className="px-5 py-2.5 rounded-xl bg-[#7C1D26] hover:bg-[#5E141B] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-[#7C1D26]/20 transition cursor-pointer"
              >
                Import {pastePreview.length} Students to Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
