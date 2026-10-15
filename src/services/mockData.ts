import { 
  User, 
  ClassItem, 
  RosterEntry, 
  JoinRequest, 
  AttendanceSession, 
  AttendanceRecord, 
  GradeActivity, 
  GradeScore, 
  ExcuseRequest, 
  SystemNotification,
  StudentExternalClass,
  ClassNote,
  ClassTodo
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-inst-admin',
    email: 'm.villanueva@university.edu.ph',
    firstName: 'Maria',
    middleName: 'Santos',
    lastName: 'Villanueva',
    department: 'College of Computer Studies',
    roles: ['instructor', 'admin'],
    activeRole: 'instructor',
    isOnboarded: true,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-admin',
    email: 'admin.office@university.edu.ph',
    firstName: 'Ricardo',
    middleName: 'Cruz',
    lastName: 'Del Rosario',
    department: 'University Registrar & Administration',
    roles: ['admin'],
    activeRole: 'admin',
    isOnboarded: true,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-student-1',
    email: 'j.turtoga@students.university.edu.ph',
    firstName: 'Joshua',
    middleName: 'Alcantara',
    lastName: 'Turtoga',
    studentIdNumber: '2023-10492',
    department: 'College of Computer Studies',
    program: 'BSCS',
    yearLevel: 3,
    mobileNumber: '+63 917 123 4567',
    altEmail: 'joshua.dev@gmail.com',
    roles: ['student'],
    activeRole: 'student',
    isOnboarded: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-student-2',
    email: 'k.reyes@students.university.edu.ph',
    firstName: 'Kathleen',
    middleName: 'Bautista',
    lastName: 'Reyes',
    studentIdNumber: '2023-10493',
    department: 'College of Computer Studies',
    program: 'BSCS',
    yearLevel: 3,
    roles: ['student'],
    activeRole: 'student',
    isOnboarded: true,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'class-stas',
    instructorId: 'user-inst-admin',
    instructorName: 'Prof. Maria Villanueva',
    courseCode: 'STAS',
    courseTitle: 'Science, Technology and Society',
    section: 'E106-R',
    classType: 'Lecture',
    units: 3,
    academicTerm: '1st Semester AY 2026-2027',
    miniTerm: 'Midterm Term',
    joinCode: 'STAS-9482',
    schedules: [
      { id: 'sch-1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Room 201' },
      { id: 'sch-2', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'Room 201' },
      { id: 'sch-3', dayOfWeek: 'Friday', startTime: '13:00', endTime: '16:00', room: 'Lab 3 (Computer Center)' }
    ],
    lateConversionThreshold: 3,
    fdaAbsenceThresholdHours: 6, // 6 absences threshold
    colorAccent: '#6366F1',
    createdAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'class-cs301',
    instructorId: 'user-inst-admin',
    instructorName: 'Prof. Maria Villanueva',
    courseCode: 'CS301',
    courseTitle: 'Operating Systems Architecture',
    section: 'CS3A',
    classType: 'Laboratory',
    units: 3,
    academicTerm: '1st Semester AY 2026-2027',
    miniTerm: 'Midterm Term',
    joinCode: 'OS-5120',
    schedules: [
      { id: 'sch-4', dayOfWeek: 'Tuesday', startTime: '10:30', endTime: '12:00', room: 'Room 404' },
      { id: 'sch-5', dayOfWeek: 'Thursday', startTime: '10:30', endTime: '12:00', room: 'Room 404' }
    ],
    lateConversionThreshold: 3,
    fdaAbsenceThresholdHours: 5,
    colorAccent: '#10B981',
    createdAt: '2026-08-16T08:00:00Z',
  }
];

export const INITIAL_ROSTER: RosterEntry[] = [
  {
    id: 'rst-1',
    classId: 'class-stas',
    sequenceNumber: 1,
    studentNumber: '2023-10492',
    studentName: 'Turtoga, Joshua A.',
    program: 'BSCS',
    yearLevel: 3,
    linkedUserId: 'user-student-1',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'rst-2',
    classId: 'class-stas',
    sequenceNumber: 2,
    studentNumber: '2023-10493',
    studentName: 'Reyes, Kathleen B.',
    program: 'BSCS',
    yearLevel: 3,
    linkedUserId: 'user-student-2',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'rst-3',
    classId: 'class-stas',
    sequenceNumber: 3,
    studentNumber: '2023-10494',
    studentName: 'Mendoza, Ethan Carl M.',
    program: 'BSIT',
    yearLevel: 3,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'rst-4',
    classId: 'class-stas',
    sequenceNumber: 4,
    studentNumber: '2023-10495',
    studentName: 'Santos, Bea Alyssa T.',
    program: 'BSCS',
    yearLevel: 2,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'rst-5',
    classId: 'class-stas',
    sequenceNumber: 5,
    studentNumber: '2023-10496',
    studentName: 'Garcia, Daniel Luis P.',
    program: 'BSCS',
    yearLevel: 3,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'enrolled'
  },
  {
    id: 'rst-6',
    classId: 'class-stas',
    sequenceNumber: 6,
    studentNumber: '2023-10497',
    studentName: 'Aquino, Samantha Chloe S.',
    program: 'BSIS',
    yearLevel: 3,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    enrollmentStatus: 'enrolled'
  }
];

export const INITIAL_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 'req-1',
    classId: 'class-stas',
    courseCode: 'STAS',
    courseTitle: 'Science, Technology and Society',
    studentUserId: 'user-student-applicant',
    studentNumber: '2023-10498',
    studentName: 'Lim, Matthew Gerald R.',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    requestedAt: '2026-10-14T14:22:00Z',
    status: 'pending'
  }
];

export const INITIAL_SESSIONS: AttendanceSession[] = [
  { id: 'ses-1', classId: 'class-stas', sessionDate: '2026-10-05', sessionType: 'regular' },
  { id: 'ses-2', classId: 'class-stas', sessionDate: '2026-10-07', sessionType: 'regular' },
  { id: 'ses-3', classId: 'class-stas', sessionDate: '2026-10-09', sessionType: 'regular' },
  { id: 'ses-4', classId: 'class-stas', sessionDate: '2026-10-12', sessionType: 'regular' },
  { id: 'ses-5', classId: 'class-stas', sessionDate: '2026-10-14', sessionType: 'regular' },
  { id: 'ses-6', classId: 'class-stas', sessionDate: '2026-10-15', sessionType: 'regular', notes: "Today's Session" }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Session 1
  { id: 'att-1-1', sessionId: 'ses-1', rosterEntryId: 'rst-1', status: 'P' },
  { id: 'att-1-2', sessionId: 'ses-1', rosterEntryId: 'rst-2', status: 'P' },
  { id: 'att-1-3', sessionId: 'ses-1', rosterEntryId: 'rst-3', status: 'L', notes: 'Arrived 15 mins late' },
  { id: 'att-1-4', sessionId: 'ses-1', rosterEntryId: 'rst-4', status: 'P' },
  { id: 'att-1-5', sessionId: 'ses-1', rosterEntryId: 'rst-5', status: 'P' },
  { id: 'att-1-6', sessionId: 'ses-1', rosterEntryId: 'rst-6', status: 'P' },

  // Session 2
  { id: 'att-2-1', sessionId: 'ses-2', rosterEntryId: 'rst-1', status: 'P' },
  { id: 'att-2-2', sessionId: 'ses-2', rosterEntryId: 'rst-2', status: 'P' },
  { id: 'att-2-3', sessionId: 'ses-2', rosterEntryId: 'rst-3', status: 'L' },
  { id: 'att-2-4', sessionId: 'ses-2', rosterEntryId: 'rst-4', status: 'A', notes: 'Unexcused absence' },
  { id: 'att-2-5', sessionId: 'ses-2', rosterEntryId: 'rst-5', status: 'P' },
  { id: 'att-2-6', sessionId: 'ses-2', rosterEntryId: 'rst-6', status: 'P' },

  // Session 3
  { id: 'att-3-1', sessionId: 'ses-3', rosterEntryId: 'rst-1', status: 'P' },
  { id: 'att-3-2', sessionId: 'ses-3', rosterEntryId: 'rst-2', status: 'E', notes: 'Medical certificate submitted' },
  { id: 'att-3-3', sessionId: 'ses-3', rosterEntryId: 'rst-3', status: 'L' }, // 3 lates -> 1 equivalent absence
  { id: 'att-3-4', sessionId: 'ses-3', rosterEntryId: 'rst-4', status: 'A' },
  { id: 'att-3-5', sessionId: 'ses-3', rosterEntryId: 'rst-5', status: 'P' },
  { id: 'att-3-6', sessionId: 'ses-3', rosterEntryId: 'rst-6', status: 'P' },

  // Session 4
  { id: 'att-4-1', sessionId: 'ses-4', rosterEntryId: 'rst-1', status: 'P' },
  { id: 'att-4-2', sessionId: 'ses-4', rosterEntryId: 'rst-2', status: 'P' },
  { id: 'att-4-3', sessionId: 'ses-4', rosterEntryId: 'rst-3', status: 'P' },
  { id: 'att-4-4', sessionId: 'ses-4', rosterEntryId: 'rst-4', status: 'A' }, // 3 unexcused absences
  { id: 'att-4-5', sessionId: 'ses-4', rosterEntryId: 'rst-5', status: 'P' },
  { id: 'att-4-6', sessionId: 'ses-4', rosterEntryId: 'rst-6', status: 'P' },

  // Session 5
  { id: 'att-5-1', sessionId: 'ses-5', rosterEntryId: 'rst-1', status: 'P' },
  { id: 'att-5-2', sessionId: 'ses-5', rosterEntryId: 'rst-2', status: 'P' },
  { id: 'att-5-3', sessionId: 'ses-5', rosterEntryId: 'rst-3', status: 'P' },
  { id: 'att-5-4', sessionId: 'ses-5', rosterEntryId: 'rst-4', status: 'A' }, // 4 absences -> Warning near limit!
  { id: 'att-5-5', sessionId: 'ses-5', rosterEntryId: 'rst-5', status: 'P' },
  { id: 'att-5-6', sessionId: 'ses-5', rosterEntryId: 'rst-6', status: 'P' }
];

export const INITIAL_GRADE_ACTIVITIES: GradeActivity[] = [
  {
    id: 'act-1',
    classId: 'class-stas',
    category: 'Quizzes',
    name: 'Quiz 1: Scientific Revolution',
    description: 'Covers historical figures in STS',
    maxScore: 20,
    activityDate: '2026-10-07'
  },
  {
    id: 'act-2',
    classId: 'class-stas',
    category: 'Quizzes',
    name: 'Quiz 2: Technology & Modern Society',
    description: 'Emerging tech paradigms',
    maxScore: 25,
    activityDate: '2026-10-12'
  },
  {
    id: 'act-3',
    classId: 'class-stas',
    category: 'Performance Tasks',
    name: 'Case Study: AI Ethics in Education',
    description: 'Group presentation paper',
    maxScore: 50,
    activityDate: '2026-10-14'
  },
  {
    id: 'act-4',
    classId: 'class-stas',
    category: 'Exams',
    name: 'Preliminary Major Examination',
    description: 'Comprehensive departmental exam',
    maxScore: 100,
    activityDate: '2026-10-20'
  }
];

export const INITIAL_GRADE_SCORES: GradeScore[] = [
  // Quiz 1 (max 20)
  { id: 'sc-1-1', activityId: 'act-1', rosterEntryId: 'rst-1', score: 19, isMissing: false },
  { id: 'sc-1-2', activityId: 'act-1', rosterEntryId: 'rst-2', score: 18, isMissing: false },
  { id: 'sc-1-3', activityId: 'act-1', rosterEntryId: 'rst-3', score: 14, isMissing: false },
  { id: 'sc-1-4', activityId: 'act-1', rosterEntryId: 'rst-4', score: 0, isMissing: false }, // Legitimate zero
  { id: 'sc-1-5', activityId: 'act-1', rosterEntryId: 'rst-5', score: 20, isMissing: false },
  { id: 'sc-1-6', activityId: 'act-1', rosterEntryId: 'rst-6', score: 17, isMissing: false },

  // Quiz 2 (max 25)
  { id: 'sc-2-1', activityId: 'act-2', rosterEntryId: 'rst-1', score: 24, isMissing: false },
  { id: 'sc-2-2', activityId: 'act-2', rosterEntryId: 'rst-2', score: 22, isMissing: false },
  { id: 'sc-2-3', activityId: 'act-2', rosterEntryId: 'rst-3', score: 19, isMissing: false },
  { id: 'sc-2-4', activityId: 'act-2', rosterEntryId: 'rst-4', score: null, isMissing: true }, // NULL / Missing (was absent)
  { id: 'sc-2-5', activityId: 'act-2', rosterEntryId: 'rst-5', score: 23, isMissing: false },
  { id: 'sc-2-6', activityId: 'act-2', rosterEntryId: 'rst-6', score: 21, isMissing: false },

  // Case Study (max 50)
  { id: 'sc-3-1', activityId: 'act-3', rosterEntryId: 'rst-1', score: 48, isMissing: false },
  { id: 'sc-3-2', activityId: 'act-3', rosterEntryId: 'rst-2', score: 47, isMissing: false },
  { id: 'sc-3-3', activityId: 'act-3', rosterEntryId: 'rst-3', score: 42, isMissing: false },
  { id: 'sc-3-4', activityId: 'act-3', rosterEntryId: 'rst-4', score: null, isMissing: true },
  { id: 'sc-3-5', activityId: 'act-3', rosterEntryId: 'rst-5', score: 46, isMissing: false },
  { id: 'sc-3-6', activityId: 'act-3', rosterEntryId: 'rst-6', score: 45, isMissing: false },
];

export const INITIAL_EXCUSE_REQUESTS: ExcuseRequest[] = [
  {
    id: 'exc-1',
    attendanceRecordId: 'att-3-2',
    classId: 'class-stas',
    studentId: 'user-student-2',
    studentName: 'Kathleen B. Reyes',
    date: '2026-10-09',
    reason: 'Severe acute gastroenteritis with doctor recommendation of 2 days bed rest.',
    documentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
    status: 'approved',
    instructorRemarks: 'Excused. Please take the special quiz makeup next Monday.',
    submittedAt: '2026-10-09T18:30:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    title: 'New Score Recorded',
    message: 'Prof. Maria Villanueva posted Quiz 2 score: 24 / 25.',
    type: 'grade',
    timestamp: '2026-10-12T11:45:00Z',
    isRead: false
  },
  {
    id: 'notif-2',
    userId: 'user-inst-admin',
    title: 'Pending Join Application',
    message: 'Matthew Gerald Lim submitted a join request for STAS [E106-R].',
    type: 'join_request',
    timestamp: '2026-10-14T14:22:00Z',
    isRead: false
  }
];

export const INITIAL_STUDENT_EXTERNAL_CLASSES: StudentExternalClass[] = [
  {
    id: 'ext-1',
    studentId: 'user-student-1',
    courseCode: 'MATH201',
    courseTitle: 'Differential Equations & Linear Algebra',
    room: 'Engineering Hall 302',
    dayOfWeek: 'Tuesday',
    startTime: '13:00',
    endTime: '15:00'
  }
];

export const INITIAL_CLASS_NOTES: ClassNote[] = [
  {
    id: 'note-1',
    classId: 'class-stas',
    title: 'Lesson 4 Recap & Midterm Schedule',
    content: 'Review chapter 3 on Industrial Revolutions. Prelim exam test questions submitted to department chair.',
    updatedAt: '2026-10-14T09:00:00Z'
  }
];

export const INITIAL_CLASS_TODOS: ClassTodo[] = [
  {
    id: 'td-1',
    classId: 'class-stas',
    task: 'Check excuse slip upload from Kathleen Reyes',
    isDone: true,
    dueDate: '2026-10-10'
  },
  {
    id: 'td-2',
    classId: 'class-stas',
    task: 'Upload Prelim Exam guidelines & seating arrangement',
    isDone: false,
    dueDate: '2026-10-18'
  }
];
