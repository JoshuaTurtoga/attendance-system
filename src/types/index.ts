export type Role = "admin" | "instructor" | "student";

export type AttendanceStatus = "P" | "L" | "E" | "A";

export type ClassType = "Lecture" | "Laboratory";

export type GradeCategory = "quiz" | "exam" | "performance_task";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  roles: Role[];
  activeView: Role;
  department?: string;
  studentNumber?: string;
  avatarUrl?: string;
  isSuspended?: boolean;
  createdAt: string;
}

export interface ScheduleBlock {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  room: string;      // e.g. "Room 402" or "TBA"
}

export interface AcademicClass {
  id: string;
  courseCode: string; // e.g. "STAS"
  courseTitle: string; // e.g. "Science, Technology and Society"
  section: string;     // e.g. "E106-R"
  classType: ClassType;
  units: number;
  term: string;        // e.g. "1st Semester 2026-2027"
  miniTerm?: string;
  instructorId: string;
  joinCode: string;    // 6-character code
  schedule: ScheduleBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface RosterStudent {
  id: string;
  classId: string;
  studentNumber: string;
  lastName: string;
  firstName: string;
  middleInitial?: string;
  program: string;     // e.g. "BSCS"
  academicLevel: string; // e.g. "3rd Year"
  userId?: string;     // linked when student join request is approved
  avatarUrl?: string;
}

export type SessionType =
  | "regular"
  | "makeup"
  | "holiday"
  | "suspended"
  | "instructor_absence";

export interface ClassSession {
  id: string;
  classId: string;
  date: string; // ISO date "YYYY-MM-DD"
  type: SessionType;
  title?: string;
  notes?: string;
  exemptFromFDA?: boolean;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string; // ISO date "YYYY-MM-DD"
  status: AttendanceStatus;
  note?: string;
  documentUrl?: string; // Attached medical cert / excuse document link
  createdAt: string;
}

export interface ExcuseRequest {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  date: string; // ISO date "YYYY-MM-DD"
  reason: string;
  documentUrl?: string;
  status: "pending" | "approved" | "declined";
  rejectionReason?: string;
  submittedAt: string;
  resolvedAt?: string;
}

export interface GradeItem {
  id: string;
  classId: string;
  category: GradeCategory;
  title: string;
  maxScore: number;
  weightPercentage: number;
  date: string;
}

export interface StudentGrade {
  id: string;
  gradeItemId: string;
  studentId: string;
  score: number | null; // null represents unrecorded/blank vs 0
  feedback?: string;
}

export interface JoinRequest {
  id: string;
  classId: string;
  requesterId?: string;
  studentNumber: string;
  studentName: string;
  program: string;
  academicLevel: string;
  photoIdUrl: string;
  status: "pending" | "approved" | "declined";
  rejectionReason?: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  classId?: string;
  kind: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}
