import React, { useState, useEffect } from 'react';
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
  ClassTodo,
  AttendanceStatus,
  UserRole
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_CLASSES, 
  INITIAL_ROSTER, 
  INITIAL_JOIN_REQUESTS, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCE, 
  INITIAL_GRADE_ACTIVITIES, 
  INITIAL_GRADE_SCORES, 
  INITIAL_EXCUSE_REQUESTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_STUDENT_EXTERNAL_CLASSES, 
  INITIAL_CLASS_NOTES, 
  INITIAL_CLASS_TODOS 
} from './services/mockData';
import { isSupabaseConfigured } from './services/supabase';
import { Navbar } from './components/Navbar';
import { InstructorPortal } from './components/InstructorPortal';
import { AdminPortal } from './components/AdminPortal';
import { StudentPortal } from './components/StudentPortal';
import { RapidRollCallModal } from './components/RapidRollCallModal';
import { RapidGradingModal } from './components/RapidGradingModal';
import { SupabaseModal } from './components/SupabaseModal';

export function App() {
  // Persistence Helper
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(`academiatrack_${key}`);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const saveState = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`academiatrack_${key}`, JSON.stringify(val));
    } catch {
      // Ignore storage errors
    }
  };

  // State definitions
  const [users, setUsers] = useState<User[]>(() => loadState('users', INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadState('currentUserId', 'user-inst-admin'));
  const [classes, setClasses] = useState<ClassItem[]>(() => loadState('classes', INITIAL_CLASSES));
  const [rosters, setRosters] = useState<Record<string, RosterEntry[]>>(() => {
    const loaded = loadState<Record<string, RosterEntry[]> | null>('rosters', null);
    if (loaded) return loaded;
    return { 'class-stas': INITIAL_ROSTER, 'class-cs301': [] };
  });
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(() => loadState('joinRequests', INITIAL_JOIN_REQUESTS));
  const [sessions, setSessions] = useState<Record<string, AttendanceSession[]>>(() => {
    const loaded = loadState<Record<string, AttendanceSession[]> | null>('sessions', null);
    if (loaded) return loaded;
    return { 'class-stas': INITIAL_SESSIONS, 'class-cs301': [] };
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadState('attendanceRecords', INITIAL_ATTENDANCE));
  const [gradeActivities, setGradeActivities] = useState<Record<string, GradeActivity[]>>(() => {
    const loaded = loadState<Record<string, GradeActivity[]> | null>('gradeActivities', null);
    if (loaded) return loaded;
    return { 'class-stas': INITIAL_GRADE_ACTIVITIES, 'class-cs301': [] };
  });
  const [gradeScores, setGradeScores] = useState<GradeScore[]>(() => loadState('gradeScores', INITIAL_GRADE_SCORES));
  const [excuseRequests, setExcuseRequests] = useState<ExcuseRequest[]>(() => loadState('excuseRequests', INITIAL_EXCUSE_REQUESTS));
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [externalClasses, setExternalClasses] = useState<StudentExternalClass[]>(() => loadState('externalClasses', INITIAL_STUDENT_EXTERNAL_CLASSES));
  const [notes, setNotes] = useState<Record<string, ClassNote[]>>(() => loadState('notes', { 'class-stas': INITIAL_CLASS_NOTES }));
  const [todos, setTodos] = useState<Record<string, ClassTodo[]>>(() => loadState('todos', { 'class-stas': INITIAL_CLASS_TODOS }));

  // Modals
  const [rapidRollCallData, setRapidRollCallData] = useState<{ classId: string, sessionDate: string } | null>(null);
  const [rapidGradingData, setRapidGradingData] = useState<{ classId: string, activityId: string } | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => saveState('users', users), [users]);
  useEffect(() => saveState('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveState('classes', classes), [classes]);
  useEffect(() => saveState('rosters', rosters), [rosters]);
  useEffect(() => saveState('joinRequests', joinRequests), [joinRequests]);
  useEffect(() => saveState('sessions', sessions), [sessions]);
  useEffect(() => saveState('attendanceRecords', attendanceRecords), [attendanceRecords]);
  useEffect(() => saveState('gradeActivities', gradeActivities), [gradeActivities]);
  useEffect(() => saveState('gradeScores', gradeScores), [gradeScores]);
  useEffect(() => saveState('excuseRequests', excuseRequests), [excuseRequests]);
  useEffect(() => saveState('notifications', notifications), [notifications]);
  useEffect(() => saveState('externalClasses', externalClasses), [externalClasses]);
  useEffect(() => saveState('notes', notes), [notes]);
  useEffect(() => saveState('todos', todos), [todos]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Dual-role POV Toggle Action
  const handleTogglePOV = () => {
    if (!currentUser.roles.includes('admin') || !currentUser.roles.includes('instructor')) return;
    const nextRole: UserRole = currentUser.activeRole === 'instructor' ? 'admin' : 'instructor';

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, activeRole: nextRole } : u));
  };

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  // Rapid Roll-Call handler
  const handleOpenRapidRollCall = (classId: string, sessionDate: string) => {
    // Ensure session exists
    let classSessions = sessions[classId] || [];
    let existingSession = classSessions.find(s => s.sessionDate === sessionDate);
    if (!existingSession) {
      const newSession: AttendanceSession = {
        id: `ses-${Date.now()}`,
        classId,
        sessionDate,
        sessionType: 'regular'
      };
      setSessions(prev => ({
        ...prev,
        [classId]: [...(prev[classId] || []), newSession]
      }));
    }

    setRapidRollCallData({ classId, sessionDate });
  };

  const handleSaveAttendanceRecord = (rosterEntryId: string, status: AttendanceStatus, notesText?: string) => {
    if (!rapidRollCallData) return;
    const classSessions = sessions[rapidRollCallData.classId] || [];
    const ses = classSessions.find(s => s.sessionDate === rapidRollCallData.sessionDate);
    if (!ses) return;

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.sessionId === ses.id && r.rosterEntryId === rosterEntryId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          notes: notesText
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sessionId: ses.id,
            rosterEntryId,
            status,
            notes: notesText
          }
        ];
      }
    });
  };

  // Add Attendance Session (e.g. Make-up or Instructor Self-Absence)
  const handleAddAttendanceSession = (classId: string, date: string, type: AttendanceSession['sessionType'], notesText?: string) => {
    const newSession: AttendanceSession = {
      id: `ses-${Date.now()}`,
      classId,
      sessionDate: date,
      sessionType: type,
      notes: notesText
    };

    setSessions(prev => ({
      ...prev,
      [classId]: [...(prev[classId] || []), newSession]
    }));
  };

  // Rapid Grading handler
  const handleOpenRapidGrading = (classId: string, activityId: string) => {
    setRapidGradingData({ classId, activityId });
  };

  const handleSaveGradeScore = (rosterEntryId: string, score: number | null, isMissing: boolean) => {
    if (!rapidGradingData) return;

    setGradeScores(prev => {
      const existingIdx = prev.findIndex(s => s.activityId === rapidGradingData.activityId && s.rosterEntryId === rosterEntryId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], score, isMissing };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            activityId: rapidGradingData.activityId,
            rosterEntryId,
            score,
            isMissing
          }
        ];
      }
    });
  };

  const handleFinishGrading = (_allScores: GradeScore[], shouldAutoGenerateAttendance: boolean) => {
    if (!rapidGradingData) return;
    const { classId, activityId } = rapidGradingData;

    if (shouldAutoGenerateAttendance) {
      const todayDate = new Date().toISOString().split('T')[0];
      const classSessions = sessions[classId] || [];
      let todaySession = classSessions.find(s => s.sessionDate === todayDate);

      let sessionId = todaySession?.id;
      if (!todaySession) {
        sessionId = `ses-${Date.now()}`;
        const newSession: AttendanceSession = {
          id: sessionId,
          classId,
          sessionDate: todayDate,
          sessionType: 'regular',
          notes: 'Auto-generated from activity submission'
        };
        setSessions(prev => ({ ...prev, [classId]: [...(prev[classId] || []), newSession] }));
      }

      // Generate attendance: numeric score -> Present, missing -> Absent
      const classRoster = rosters[classId] || [];
      const newAttendanceRecords: AttendanceRecord[] = [];

      classRoster.forEach(student => {
        const sc = gradeScores.find(s => s.activityId === activityId && s.rosterEntryId === student.id);
        const isPresent = sc && sc.score !== null && !sc.isMissing;
        const status: AttendanceStatus = isPresent ? 'P' : 'A';

        newAttendanceRecords.push({
          id: `att-auto-${Date.now()}-${student.id}`,
          sessionId: sessionId!,
          rosterEntryId: student.id,
          status,
          notes: 'Auto-assigned from grading overlay'
        });
      });

      setAttendanceRecords(prev => [
        ...prev.filter(a => a.sessionId !== sessionId),
        ...newAttendanceRecords
      ]);
    }

    setRapidGradingData(null);
  };

  // Roster Bulk Clipboard Import
  const handleBulkImportRoster = (classId: string, parsed: Array<{ studentNumber: string, studentName: string, program: string, yearLevel: number }>) => {
    const existing = rosters[classId] || [];
    let startSeq = existing.length + 1;

    const newEntries: RosterEntry[] = parsed.map((item, idx) => ({
      id: `rst-${Date.now()}-${idx}`,
      classId,
      sequenceNumber: startSeq + idx,
      studentNumber: item.studentNumber,
      studentName: item.studentName,
      program: item.program,
      yearLevel: item.yearLevel,
      enrollmentStatus: 'enrolled'
    }));

    setRosters(prev => ({
      ...prev,
      [classId]: [...(prev[classId] || []), ...newEntries]
    }));
  };

  // Add single Roster Student
  const handleAddRosterStudent = (classId: string, studentData: Omit<RosterEntry, 'id' | 'classId' | 'sequenceNumber'>) => {
    const existing = rosters[classId] || [];
    const newEntry: RosterEntry = {
      ...studentData,
      id: `rst-${Date.now()}`,
      classId,
      sequenceNumber: existing.length + 1
    };

    setRosters(prev => ({
      ...prev,
      [classId]: [...(prev[classId] || []), newEntry]
    }));
  };

  // Join Request Approval
  const handleApproveJoinRequest = (requestId: string) => {
    const req = joinRequests.find(r => r.id === requestId);
    if (!req) return;

    // Check if smart match exists in roster
    const classRoster = rosters[req.classId] || [];
    const matchIdx = classRoster.findIndex(r => 
      r.studentNumber.trim().replace(/\D/g, '') === req.studentNumber.trim().replace(/\D/g, '')
    );

    if (matchIdx >= 0) {
      // Link live account to pre-populated row
      const updated = [...classRoster];
      updated[matchIdx] = {
        ...updated[matchIdx],
        linkedUserId: req.studentUserId,
        photoUrl: req.photoUrl
      };
      setRosters(prev => ({ ...prev, [req.classId]: updated }));
    } else {
      // Append student to roster
      const newEntry: RosterEntry = {
        id: `rst-${Date.now()}`,
        classId: req.classId,
        sequenceNumber: classRoster.length + 1,
        studentNumber: req.studentNumber,
        studentName: req.studentName,
        program: 'BSCS',
        yearLevel: 3,
        linkedUserId: req.studentUserId,
        photoUrl: req.photoUrl,
        enrollmentStatus: 'enrolled'
      };
      setRosters(prev => ({ ...prev, [req.classId]: [...classRoster, newEntry] }));
    }

    setJoinRequests(prev => prev.filter(r => r.id !== requestId));

    // Send notification to student
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: req.studentUserId,
        title: 'Join Request Approved!',
        message: `Your request to join ${req.courseCode} has been approved by your instructor.`,
        type: 'join_request',
        timestamp: new Date().toISOString(),
        isRead: false
      },
      ...prev
    ]);
  };

  const handleDeclineJoinRequest = (requestId: string, reason: string) => {
    setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined', declineReason: reason } : r));
  };

  // Add Grade Activity
  const handleAddGradeActivity = (classId: string, actData: Omit<GradeActivity, 'id' | 'classId'>) => {
    const newAct: GradeActivity = {
      ...actData,
      id: `act-${Date.now()}`,
      classId
    };

    setGradeActivities(prev => ({
      ...prev,
      [classId]: [...(prev[classId] || []), newAct]
    }));
  };

  // Update Grade Score inline
  const handleUpdateGradeScore = (activityId: string, rosterEntryId: string, score: number | null, isMissing: boolean) => {
    setGradeScores(prev => {
      const existingIdx = prev.findIndex(s => s.activityId === activityId && s.rosterEntryId === rosterEntryId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], score, isMissing };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `sc-${Date.now()}`,
            activityId,
            rosterEntryId,
            score,
            isMissing
          }
        ];
      }
    });
  };

  // Student Join Submit
  const handleJoinClassSubmit = (courseCode: string, joinCode: string) => {
    const targetClass = classes.find(c => 
      c.courseCode.toLowerCase() === courseCode.toLowerCase() || 
      c.joinCode.toLowerCase() === joinCode.toLowerCase()
    );

    if (targetClass) {
      const newReq: JoinRequest = {
        id: `req-${Date.now()}`,
        classId: targetClass.id,
        courseCode: targetClass.courseCode,
        courseTitle: targetClass.courseTitle,
        studentUserId: currentUser.id,
        studentNumber: currentUser.studentIdNumber || '2023-10492',
        studentName: `${currentUser.lastName}, ${currentUser.firstName} ${currentUser.middleName ? currentUser.middleName[0] + '.' : ''}`,
        photoUrl: currentUser.photoUrl || '',
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      setJoinRequests(prev => [newReq, ...prev]);

      // Alert instructor
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetClass.instructorId,
          title: 'New Class Join Request',
          message: `${currentUser.firstName} ${currentUser.lastName} requested to join ${targetClass.courseCode}.`,
          type: 'join_request',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        ...prev
      ]);
    }
  };

  // Student Excuse Submission
  const handleSubmitExcuseRequest = (classId: string, attendanceRecordId: string, date: string, reason: string) => {
    const newExc: ExcuseRequest = {
      id: `exc-${Date.now()}`,
      attendanceRecordId,
      classId,
      studentId: currentUser.id,
      studentName: `${currentUser.firstName} ${currentUser.lastName}`,
      date,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    setExcuseRequests(prev => [newExc, ...prev]);
  };

  // Resolve Excuse Request by Instructor
  const handleResolveExcuse = (excuseId: string, approved: boolean, remarks: string) => {
    const exc = excuseRequests.find(e => e.id === excuseId);
    if (!exc) return;

    setExcuseRequests(prev => prev.map(e => e.id === excuseId ? { ...e, status: approved ? 'approved' : 'declined', instructorRemarks: remarks } : e));

    if (approved) {
      // Convert attendance record to Excused (E)
      setAttendanceRecords(prev => prev.map(a => a.id === exc.attendanceRecordId ? { ...a, status: 'E', notes: `Excused: ${remarks}` } : a));
    }
  };

  // Add External Class for Student
  const handleAddExternalClass = (ext: Omit<StudentExternalClass, 'id' | 'studentId'>) => {
    const newExt: StudentExternalClass = {
      ...ext,
      id: `ext-${Date.now()}`,
      studentId: currentUser.id
    };

    setExternalClasses(prev => [...prev, newExt]);
  };

  // Provision Faculty by Admin
  const handleProvisionInstructor = (instData: { email: string, firstName: string, lastName: string, department: string }) => {
    const newInst: User = {
      id: `user-inst-${Date.now()}`,
      email: instData.email,
      firstName: instData.firstName,
      lastName: instData.lastName,
      department: instData.department,
      roles: ['instructor'],
      activeRole: 'instructor',
      isOnboarded: false,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    };

    setUsers(prev => [...prev, newInst]);
    alert(`Instructor account provisioned for ${instData.firstName} ${instData.lastName} (${instData.email}). Temporary credentials generated.`);
  };

  // Regenerate Join Code
  const handleRegenerateJoinCode = (classId: string) => {
    const randomCode = `${classes.find(c => c.id === classId)?.courseCode || 'CLASS'}-${Math.floor(1000 + Math.random() * 9000)}`;
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, joinCode: randomCode } : c));
  };

  return (
    <>
      {/* Global Navigation Bar with POV Toggle & Personas */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        onTogglePOV={handleTogglePOV}
        notifications={notifications}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        isSupabaseConnected={isSupabaseConfigured}
      />

      {/* Main Role-Based Body */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {currentUser.activeRole === 'instructor' && (
          <InstructorPortal
            currentUser={currentUser}
            classes={classes}
            rosters={rosters}
            joinRequests={joinRequests}
            sessions={sessions}
            attendanceRecords={attendanceRecords}
            gradeActivities={gradeActivities}
            gradeScores={gradeScores}
            excuseRequests={excuseRequests}
            notes={notes}
            todos={todos}
            onOpenRapidRollCall={handleOpenRapidRollCall}
            onOpenRapidGrading={handleOpenRapidGrading}
            onUpdateAttendanceRecord={(recId, st, n) => {
              setAttendanceRecords(prev => prev.map(r => r.id === recId ? { ...r, status: st, notes: n } : r));
            }}
            onAddAttendanceRecord={(sesId, rstId, st, n) => {
              setAttendanceRecords(prev => [
                ...prev,
                { id: `att-${Date.now()}`, sessionId: sesId, rosterEntryId: rstId, status: st, notes: n }
              ]);
            }}
            onAddAttendanceSession={handleAddAttendanceSession}
            onAddGradeActivity={handleAddGradeActivity}
            onUpdateGradeScore={handleUpdateGradeScore}
            onApproveJoinRequest={handleApproveJoinRequest}
            onDeclineJoinRequest={handleDeclineJoinRequest}
            onBulkImportRoster={handleBulkImportRoster}
            onAddRosterStudent={handleAddRosterStudent}
            onResolveExcuse={handleResolveExcuse}
            onCreateClass={(newCls) => {
              const created: ClassItem = {
                ...newCls,
                id: `class-${Date.now()}`,
                instructorId: currentUser.id,
                instructorName: `${currentUser.firstName} ${currentUser.lastName}`,
                joinCode: `${newCls.courseCode}-${Math.floor(1000 + Math.random() * 9000)}`,
                createdAt: new Date().toISOString()
              };
              setClasses(prev => [...prev, created]);
            }}
            onRegenerateJoinCode={handleRegenerateJoinCode}
          />
        )}

        {currentUser.activeRole === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            allUsers={users}
            allClasses={classes}
            allRosters={rosters}
            onProvisionInstructor={handleProvisionInstructor}
            onUpdateGlobalSettings={(_settings) => {
              // Update default institutional policies
            }}
          />
        )}

        {currentUser.activeRole === 'student' && (
          <StudentPortal
            currentUser={currentUser}
            allClasses={classes}
            allRosters={rosters}
            allSessions={sessions}
            allAttendance={attendanceRecords}
            allActivities={gradeActivities}
            allScores={gradeScores}
            externalClasses={externalClasses}
            onJoinClassSubmit={handleJoinClassSubmit}
            onSubmitExcuseRequest={handleSubmitExcuseRequest}
            onAddExternalClass={handleAddExternalClass}
          />
        )}
      </main>

      {/* Rapid Roll-Call Modal Overlay */}
      {rapidRollCallData && (() => {
        const cls = classes.find(c => c.id === rapidRollCallData.classId);
        const roster = rosters[rapidRollCallData.classId] || [];
        const classSessions = sessions[rapidRollCallData.classId] || [];
        const currentSession = classSessions.find(s => s.sessionDate === rapidRollCallData.sessionDate);
        const existingRecs = currentSession
          ? attendanceRecords.filter(a => a.sessionId === currentSession.id)
          : [];

        return (
          <RapidRollCallModal
            roster={roster}
            sessionDate={rapidRollCallData.sessionDate}
            courseCode={cls?.courseCode || ''}
            courseTitle={cls?.courseTitle || ''}
            existingRecords={existingRecs}
            onSaveRecord={handleSaveAttendanceRecord}
            onClose={() => setRapidRollCallData(null)}
          />
        );
      })()}

      {/* Rapid Grading Modal Overlay */}
      {rapidGradingData && (() => {
        const cls = classes.find(c => c.id === rapidGradingData.classId);
        const roster = rosters[rapidGradingData.classId] || [];
        const activities = gradeActivities[rapidGradingData.classId] || [];
        const currentActivity = activities.find(a => a.id === rapidGradingData.activityId);

        // Check if attendance exists today
        const todayDate = new Date().toISOString().split('T')[0];
        const classSessions = sessions[rapidGradingData.classId] || [];
        const todaySession = classSessions.find(s => s.sessionDate === todayDate);
        const todayAttendance = todaySession
          ? attendanceRecords.filter(a => a.sessionId === todaySession.id)
          : undefined;

        if (!currentActivity) return null;

        return (
          <RapidGradingModal
            activity={currentActivity}
            roster={roster}
            existingScores={gradeScores.filter(s => s.activityId === currentActivity.id)}
            todayAttendance={todayAttendance}
            onSaveScore={handleSaveGradeScore}
            onFinishGrading={handleFinishGrading}
            onClose={() => setRapidGradingData(null)}
          />
        );
      })()}

      {/* Supabase Setup Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </>
  );
}

export default App;
