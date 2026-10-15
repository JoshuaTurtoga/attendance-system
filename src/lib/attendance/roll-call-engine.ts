import type { AttendanceRecord, AttendanceStatus, RosterStudent } from "../../types/index.ts";

export interface RollCallItem {
  student: RosterStudent;
  status: AttendanceStatus | null;
  note: string;
  markedAt?: string;
}

export interface RollCallSessionState {
  classId: string;
  date: string;
  items: RollCallItem[];
  currentIndex: number;
  isComplete: boolean;
}

export interface RollCallSummary {
  total: number;
  marked: number;
  remaining: number;
  percentage: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
}

/**
 * Initializes a new Roll-Call session from a class's student roster.
 * Students are sorted alphabetically by Last Name, then First Name,
 * ensuring strict correspondence with the master university roster table.
 */
export function createRollCallSession(
  students: RosterStudent[],
  classId: string,
  date?: string
): RollCallSessionState {
  const sessionDate = date || new Date().toISOString().split("T")[0];

  const sortedStudents = [...students].sort((a, b) => {
    const lastNameDiff = a.lastName.localeCompare(b.lastName);
    if (lastNameDiff !== 0) return lastNameDiff;
    return a.firstName.localeCompare(b.firstName);
  });

  const items: RollCallItem[] = sortedStudents.map((student) => ({
    student,
    status: null,
    note: "",
  }));

  return {
    classId,
    date: sessionDate,
    items,
    currentIndex: 0,
    isComplete: false,
  };
}

/**
 * Records attendance status and optional note for a specific student index.
 * Returns an immutable copy of the session state.
 */
export function recordStudentStatus(
  state: RollCallSessionState,
  index: number,
  status: AttendanceStatus,
  note?: string
): RollCallSessionState {
  if (index < 0 || index >= state.items.length) {
    return state;
  }

  const updatedItems = state.items.map((item, idx) => {
    if (idx !== index) return item;
    return {
      ...item,
      status,
      note: note !== undefined ? note : item.note,
      markedAt: new Date().toISOString(),
    };
  });

  const allMarked = updatedItems.every((it) => it.status !== null);

  return {
    ...state,
    items: updatedItems,
    isComplete: allMarked,
  };
}

/**
 * Single-Key Keyboard Shortcut Dispatcher:
 * Pressing P, L, E, or A marks the active student and automatically
 * glides to the next student row in alphabetical order.
 */
export function handleRollCallHotkey(
  state: RollCallSessionState,
  key: string
): RollCallSessionState {
  const normalizedKey = key.toUpperCase();
  const validStatuses: AttendanceStatus[] = ["P", "L", "E", "A"];

  if (!validStatuses.includes(normalizedKey as AttendanceStatus)) {
    return state;
  }

  const status = normalizedKey as AttendanceStatus;
  const stateWithMarked = recordStudentStatus(state, state.currentIndex, status);

  const isLast = state.currentIndex >= state.items.length - 1;
  const nextIndex = isLast ? state.currentIndex : state.currentIndex + 1;

  return {
    ...stateWithMarked,
    currentIndex: nextIndex,
    isComplete: isLast || stateWithMarked.isComplete,
  };
}

/**
 * Navigation controls: Next (Enter / ArrowDown) or Previous (ArrowUp).
 */
export function advanceRollCallIndex(
  state: RollCallSessionState,
  direction: "next" | "prev"
): RollCallSessionState {
  if (direction === "next") {
    if (state.currentIndex < state.items.length - 1) {
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
    }
    // If already at end and all are marked
    if (state.items.every((it) => it.status !== null)) {
      return {
        ...state,
        isComplete: true,
      };
    }
    return state;
  }

  // Previous
  if (state.currentIndex > 0) {
    return {
      ...state,
      currentIndex: state.currentIndex - 1,
    };
  }

  return state;
}

/**
 * Direct jump to a specific student index (e.g. clicking on a row or dropdown).
 */
export function jumpToRollCallIndex(
  state: RollCallSessionState,
  targetIndex: number
): RollCallSessionState {
  if (state.items.length === 0) return state;
  const clampedIndex = Math.max(0, Math.min(targetIndex, state.items.length - 1));
  return {
    ...state,
    currentIndex: clampedIndex,
  };
}

/**
 * Updates optional reason or note for the student at index.
 */
export function updateStudentNote(
  state: RollCallSessionState,
  index: number,
  note: string
): RollCallSessionState {
  if (index < 0 || index >= state.items.length) {
    return state;
  }

  const updatedItems = state.items.map((item, idx) => {
    if (idx !== index) return item;
    return {
      ...item,
      note,
    };
  });

  return {
    ...state,
    items: updatedItems,
  };
}

/**
 * Computes roll-call completion metrics, breakdowns, and percentages.
 */
export function computeRollCallSummary(state: RollCallSessionState): RollCallSummary {
  const total = state.items.length;
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let absentCount = 0;
  let marked = 0;

  for (const item of state.items) {
    if (item.status !== null) {
      marked++;
      if (item.status === "P") presentCount++;
      else if (item.status === "L") lateCount++;
      else if (item.status === "E") excusedCount++;
      else if (item.status === "A") absentCount++;
    }
  }

  const remaining = total - marked;
  const percentage = total > 0 ? Math.round((marked / total) * 100) : 0;

  return {
    total,
    marked,
    remaining,
    percentage,
    presentCount,
    lateCount,
    excusedCount,
    absentCount,
  };
}

/**
 * Converts roll-call state into an array of persisted AttendanceRecords.
 */
export function finalizeRollCallSession(state: RollCallSessionState): AttendanceRecord[] {
  return state.items.map((item) => ({
    id: `att_${state.classId}_${item.student.id}_${state.date}`,
    classId: state.classId,
    studentId: item.student.id,
    date: state.date,
    status: item.status ?? "A", // Default to Absent if unrecorded upon finalization
    note: item.note.trim() ? item.note.trim() : undefined,
    createdAt: item.markedAt || new Date().toISOString(),
  }));
}
