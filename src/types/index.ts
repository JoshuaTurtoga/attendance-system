export type UserRole = 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  studentIdNumber?: string;
  department?: string;
  program?: string;
  yearLevel?: number;
  mobileNumber?: string;
  altEmail?: string;
  photoUrl?: string;
  roles: UserRole[];
  activeRole: UserRole;
  isOnboarded: boolean;
}

export interface ClassScheduleSlot {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room: string;      // "Room 201" or "Lab 3"
}

export interface ClassItem {
  id: string;
  instructorId: string;
  instructorName: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  classType: 'Lecture' | 'Laboratory' | 'Hybrid';
  units: number;
  academicTerm: string;
  miniTerm: string;
  joinCode: string;
  schedules: ClassScheduleSlot[];
  lateConversionThreshold: number; // default: 3
  fdaAbsenceThresholdHours: number; // e.g. 6 absences or 20%
  colorAccent?: string;
  createdAt: string;
}

export interface RosterEntry {
  id: string;
  classId: string;
  sequenceNumber: number;
  studentNumber: string;
  studentName: string; // Last Name, First Name, M.I.
  program: string;
  yearLevel: number;
  linkedUserId?: string;
  photoUrl?: string;
  enrollmentStatus: 'enrolled' | 'pending' | 'dropped';
}

export interface JoinRequest {
  id: string;
  classId: string;
  courseCode: string;
  courseTitle: string;
  studentUserId: string;
  studentNumber: string;
  studentName: string;
  photoUrl: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'declined';
  declineReason?: string;
  matchedRosterId?: string;
}

export type AttendanceStatus = 'P' | 'L' | 'E' | 'A';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  rosterEntryId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  sessionDate: string; // YYYY-MM-DD
  sessionType: 'regular' | 'make-up' | 'holiday' | 'suspended' | 'instructor-absence';
  notes?: string;
}

export type GradeCategory = 'Quizzes' | 'Exams' | 'Performance Tasks';

export interface GradeActivity {
  id: string;
  classId: string;
  category: GradeCategory;
  name: string;
  description?: string;
  maxScore: number;
  activityDate: string; // YYYY-MM-DD
}

export interface GradeScore {
  id: string;
  activityId: string;
  rosterEntryId: string;
  score: number | null; // null represents missing / ungraded
  isMissing: boolean;
  notes?: string;
}

export interface ExcuseRequest {
  id: string;
  attendanceRecordId: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string;
  reason: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'declined';
  instructorRemarks?: string;
  submittedAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'attendance' | 'grade' | 'join_request' | 'warning' | 'info';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface StudentExternalClass {
  id: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
}

export interface ClassNote {
  id: string;
  classId: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface ClassTodo {
  id: string;
  classId: string;
  task: string;
  isDone: boolean;
  dueDate?: string;
}
