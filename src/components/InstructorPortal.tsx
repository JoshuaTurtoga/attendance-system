import React, { useState } from 'react';
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
  ClassNote, 
  ClassTodo,
  AttendanceStatus,
  GradeCategory
} from '../types';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Plus, 
  FileSpreadsheet, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X, 
  ClipboardCopy, 
  Download, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  FileText, 
  Layers,
  BookOpen,
  UserX,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { exportClassRecordToExcel } from '../services/excelExport';

interface InstructorPortalProps {
  currentUser: User;
  classes: ClassItem[];
  rosters: Record<string, RosterEntry[]>;
  joinRequests: JoinRequest[];
  sessions: Record<string, AttendanceSession[]>;
  attendanceRecords: AttendanceRecord[];
  gradeActivities: Record<string, GradeActivity[]>;
  gradeScores: GradeScore[];
  excuseRequests: ExcuseRequest[];
  notes: Record<string, ClassNote[]>;
  todos: Record<string, ClassTodo[]>;

  // Callbacks
  onOpenRapidRollCall: (classId: string, sessionDate: string) => void;
  onOpenRapidGrading: (classId: string, activityId: string) => void;
  onUpdateAttendanceRecord: (recordId: string, status: AttendanceStatus, notes?: string) => void;
  onAddAttendanceRecord: (sessionId: string, rosterEntryId: string, status: AttendanceStatus, notes?: string) => void;
  onAddAttendanceSession: (classId: string, date: string, type: AttendanceSession['sessionType'], notes?: string) => void;
  onAddGradeActivity: (classId: string, activity: Omit<GradeActivity, 'id' | 'classId'>) => void;
  onUpdateGradeScore: (activityId: string, rosterEntryId: string, score: number | null, isMissing: boolean) => void;
  onApproveJoinRequest: (requestId: string) => void;
  onDeclineJoinRequest: (requestId: string, reason: string) => void;
  onBulkImportRoster: (classId: string, parsedStudents: Array<{ studentNumber: string, studentName: string, program: string, yearLevel: number }>) => void;
  onAddRosterStudent: (classId: string, student: Omit<RosterEntry, 'id' | 'classId' | 'sequenceNumber'>) => void;
  onResolveExcuse: (excuseId: string, approved: boolean, remarks: string) => void;
  onCreateClass: (newClass: Omit<ClassItem, 'id' | 'instructorId' | 'instructorName' | 'joinCode' | 'createdAt'>) => void;
  onRegenerateJoinCode: (classId: string) => void;
}

export const InstructorPortal: React.FC<InstructorPortalProps> = ({
  currentUser,
  classes,
  rosters,
  joinRequests,
  sessions,
  attendanceRecords,
  gradeActivities,
  gradeScores,
  excuseRequests,
  notes,
  todos,
  onOpenRapidRollCall,
  onOpenRapidGrading,
  onUpdateAttendanceRecord,
  onAddAttendanceRecord,
  onAddAttendanceSession,
  onAddGradeActivity,
  onUpdateGradeScore,
  onApproveJoinRequest,
  onDeclineJoinRequest,
  onBulkImportRoster,
  onAddRosterStudent,
  onResolveExcuse,
  onCreateClass,
  onRegenerateJoinCode
}) => {
  // Navigation: 'today' | 'schedule' | 'class-workspace'
  const [activeView, setActiveView] = useState<'today' | 'schedule' | 'class-workspace'>('today');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [workspaceTab, setWorkspaceTab] = useState<'roster' | 'attendance' | 'grades' | 'notes'>('roster');

  // Modals state
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showClipboardModal, setShowClipboardModal] = useState(false);
  const [clipboardText, setClipboardText] = useState('');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    name: '',
    category: 'Quizzes' as GradeCategory,
    maxScore: 20,
    activityDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Manual Roster Add Row
  const [manualRosterEntry, setManualRosterEntry] = useState({
    studentNumber: '',
    studentName: '',
    program: 'BSCS',
    yearLevel: 3
  });

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const activeRoster = activeClass ? (rosters[activeClass.id] || []) : [];
  const activeSessions = activeClass ? (sessions[activeClass.id] || []) : [];
  const activeActivities = activeClass ? (gradeActivities[activeClass.id] || []) : [];
  const pendingRequests = activeClass 
    ? joinRequests.filter(r => r.classId === activeClass.id && r.status === 'pending')
    : [];

  // Today's classes
  const todayDateStr = new Date().toISOString().split('T')[0];

  // FDA Calculation Helper
  const calculateStudentFDA = (studentId: string, classItem: ClassItem) => {
    let unexcusedAbsences = 0;
    let lates = 0;

    activeSessions.forEach(session => {
      const rec = attendanceRecords.find(a => a.sessionId === session.id && a.rosterEntryId === studentId);
      if (rec?.status === 'A') unexcusedAbsences++;
      if (rec?.status === 'L') lates++;
    });

    const effectiveAbsences = unexcusedAbsences + Math.floor(lates / classItem.lateConversionThreshold);
    const limit = classItem.fdaAbsenceThresholdHours;
    let badgeType: 'safe' | 'warning' | 'danger' = 'safe';

    if (effectiveAbsences >= limit) {
      badgeType = 'danger';
    } else if (effectiveAbsences >= limit * 0.6) {
      badgeType = 'warning';
    }

    return { effectiveAbsences, limit, badgeType, rawAbsences: unexcusedAbsences, lates };
  };

  // Clipboard Paste Parser
  const handleParseClipboard = () => {
    if (!activeClass || !clipboardText.trim()) return;
    const lines = clipboardText.trim().split(/\r?\n/);
    const parsed: Array<{ studentNumber: string, studentName: string, program: string, yearLevel: number }> = [];

    lines.forEach(line => {
      const cols = line.split(/[\t,]/).map(c => c.trim()).filter(Boolean);
      // Expected: [#], Student Number, Student Name, Program, Year Level
      // Or: Student Number, Student Name, Program, Year Level
      if (cols.length >= 4) {
        let studentNumber = cols[0];
        let studentName = cols[1];
        let program = cols[2];
        let yearLevel = parseInt(cols[3]) || 1;

        // If first column is just a row index like "1"
        if (/^\d{1,3}$/.test(cols[0]) && cols.length >= 5) {
          studentNumber = cols[1];
          studentName = cols[2];
          program = cols[3];
          yearLevel = parseInt(cols[4]) || 1;
        }

        parsed.push({ studentNumber, studentName, program, yearLevel });
      }
    });

    if (parsed.length > 0) {
      onBulkImportRoster(activeClass.id, parsed);
      setClipboardText('');
      setShowClipboardModal(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sub-Header & Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>
            Faculty Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Welcome back, {currentUser.firstName} {currentUser.lastName} • {currentUser.department}
          </p>
        </div>

        {/* View Switcher: Today | Schedule | Class Workspace */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-elevated)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveView('today')}
            className={`btn ${activeView === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', border: 'none' }}
          >
            <Clock size={15} />
            <span>"Today" Hub</span>
          </button>
          <button
            onClick={() => setActiveView('schedule')}
            className={`btn ${activeView === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', border: 'none' }}
          >
            <Calendar size={15} />
            <span>Weekly Timetable</span>
          </button>
          <button
            onClick={() => setActiveView('class-workspace')}
            className={`btn ${activeView === 'class-workspace' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', border: 'none' }}
          >
            <Layers size={15} />
            <span>Class Workspaces</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          VIEW 1: "TODAY" DASHBOARD (DAILY QUICK-ACCESS HUB)
          ------------------------------------------------------------- */}
      {activeView === 'today' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Today's Lectures & Classes</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {classes.map(cls => {
              const classRoster = rosters[cls.id] || [];
              const classSessions = sessions[cls.id] || [];
              const todaySession = classSessions.find(s => s.sessionDate === todayDateStr);

              return (
                <div key={cls.id} className="glass-panel" style={{ borderLeft: `4px solid ${cls.colorAccent || 'var(--primary)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#A5B4FC',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {cls.section} • {cls.classType}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>
                        {cls.courseCode} - {cls.courseTitle}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {cls.schedules.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime} (${s.room})`).join(' • ')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Enrolled</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                        {classRoster.length}
                      </div>
                    </div>
                  </div>

                  {/* One-Click Quick Actions */}
                  <div style={{ 
                    marginTop: '1.5rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => onOpenRapidRollCall(cls.id, todayDateStr)}
                      className="btn btn-primary"
                      style={{ flex: 1, minWidth: '150px', fontSize: '0.825rem' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Record Attendance Today</span>
                    </button>

                    <button
                      onClick={() => {
                        const act = (gradeActivities[cls.id] || [])[0];
                        if (act) {
                          onOpenRapidGrading(cls.id, act.id);
                        } else {
                          setSelectedClassId(cls.id);
                          setActiveView('class-workspace');
                          setWorkspaceTab('grades');
                          setShowAddActivityModal(true);
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, minWidth: '150px', fontSize: '0.825rem', background: 'rgba(139, 92, 246, 0.15)', color: '#C084FC', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    >
                      <Sparkles size={16} />
                      <span>Record Grades Today</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 2: VISUAL WEEKLY TIMETABLE
          ------------------------------------------------------------- */}
      {activeView === 'schedule' && (
        <div className="glass-panel">
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Visual Weekly Timetable</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Multi-room and day-specific scheduling blocks for 1st Semester AY 2026-2027
              </p>
            </div>
          </div>

          <div className="timetable-grid">
            <div className="timetable-header">Time</div>
            <div className="timetable-header">Mon</div>
            <div className="timetable-header">Tue</div>
            <div className="timetable-header">Wed</div>
            <div className="timetable-header">Thu</div>
            <div className="timetable-header">Fri</div>
            <div className="timetable-header">Sat</div>

            {/* Time Rows from 08:00 to 18:00 */}
            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => (
              <React.Fragment key={hour}>
                <div className="timetable-cell" style={{ fontWeight: 600, color: 'var(--text-dim)', textAlign: 'center', background: 'var(--bg-elevated)' }}>
                  {hour}
                </div>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                  // Find any matching class block
                  const matchingSlot = classes.flatMap(c => 
                    c.schedules
                      .filter(s => s.dayOfWeek === day && s.startTime.startsWith(hour.slice(0, 2)))
                      .map(s => ({ classItem: c, slot: s }))
                  )[0];

                  return (
                    <div key={day} className="timetable-cell">
                      {matchingSlot && (
                        <div style={{
                          background: matchingSlot.classItem.colorAccent || 'var(--primary)',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          color: '#fff',
                          height: '100%'
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                            {matchingSlot.classItem.courseCode} ({matchingSlot.classItem.section})
                          </div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                            {matchingSlot.slot.room} • {matchingSlot.slot.startTime}-{matchingSlot.slot.endTime}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 3: ISOLATED CLASS WORKSPACE (4 TABS)
          ------------------------------------------------------------- */}
      {activeView === 'class-workspace' && activeClass && (
        <div>
          {/* Class Selector Bar & Header */}
          <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-heading)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} ({c.section}) - {c.courseTitle}
                    </option>
                  ))}
                </select>

                {/* Join Code Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class Code:</span>
                  <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#A5B4FC', background: 'transparent' }}>
                    {activeClass.joinCode}
                  </code>
                  <button 
                    onClick={() => onRegenerateJoinCode(activeClass.id)}
                    title="Regenerate & Invalidate Previous Code"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Export Excel */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => exportClassRecordToExcel(
                    activeClass,
                    activeRoster,
                    activeSessions,
                    attendanceRecords,
                    activeActivities,
                    gradeScores
                  )}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                >
                  <FileSpreadsheet size={16} />
                  <span>Export to Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Main Workspace Tabs */}
          <div className="tab-navigation">
            <button
              onClick={() => setWorkspaceTab('roster')}
              className={`tab-btn ${workspaceTab === 'roster' ? 'active' : ''}`}
            >
              <Users size={16} />
              <span>1. Class List & Smart Enrollment ({activeRoster.length})</span>
              {pendingRequests.length > 0 && (
                <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px' }}>
                  {pendingRequests.length} pending
                </span>
              )}
            </button>

            <button
              onClick={() => setWorkspaceTab('attendance')}
              className={`tab-btn ${workspaceTab === 'attendance' ? 'active' : ''}`}
            >
              <CheckCircle2 size={16} />
              <span>2. Attendance System ({activeSessions.length} Sessions)</span>
            </button>

            <button
              onClick={() => setWorkspaceTab('grades')}
              className={`tab-btn ${workspaceTab === 'grades' ? 'active' : ''}`}
            >
              <BookOpen size={16} />
              <span>3. Grades Management ({activeActivities.length} Activities)</span>
            </button>

            <button
              onClick={() => setWorkspaceTab('notes')}
              className={`tab-btn ${workspaceTab === 'notes' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>4. Beta: Notes & To-Do</span>
            </button>
          </div>

          {/* TAB 1: CLASS LIST & SMART ENROLLMENT */}
          {workspaceTab === 'roster' && (
            <div>
              {/* Pending Join Requests Queue */}
              {pendingRequests.length > 0 && (
                <div className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Sparkles size={18} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.1rem' }}>Student Join Request Queue & Smart Matching</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                    {pendingRequests.map(req => {
                      // Smart Matching Engine: Check if applicant's student number matches any pre-populated row
                      const matchedRosterSlot = activeRoster.find(r => 
                        r.studentNumber.trim().replace(/\D/g, '') === req.studentNumber.trim().replace(/\D/g, '')
                      );

                      return (
                        <div key={req.id} style={{
                          background: 'var(--bg-surface)',
                          border: matchedRosterSlot ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center'
                        }}>
                          <img 
                            src={req.photoUrl || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120'}
                            alt={req.studentName}
                            style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.studentName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#A5B4FC', fontFamily: 'var(--font-mono)' }}>
                              ID: {req.studentNumber}
                            </div>
                            {matchedRosterSlot ? (
                              <div style={{ fontSize: '0.75rem', color: 'var(--status-present)', fontWeight: 600, marginTop: '2px' }}>
                                ✓ Smart Match: Row #{matchedRosterSlot.sequenceNumber} ({matchedRosterSlot.studentName})
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: '#FCD34D', marginTop: '2px' }}>
                                ⚠️ No pre-populated row found. Approving will append student.
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <button
                              onClick={() => onApproveJoinRequest(req.id)}
                              className="btn btn-success"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => onDeclineJoinRequest(req.id, 'Incorrect section or student ID mismatch')}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#F87171' }}
                            >
                              <X size={14} />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Roster Controls: Bulk Clipboard Import & Add Single */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>Master 5-Column Class Roster</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Type directly or paste 5-column table from Microsoft Excel / Google Sheets
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setShowClipboardModal(true)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <ClipboardCopy size={15} />
                    <span>Paste from Excel</span>
                  </button>
                </div>
              </div>

              {/* 5-Column Roster Table */}
              <div className="table-container">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Student Number</th>
                      <th>Student Name</th>
                      <th>Program / Strand</th>
                      <th>Academic Level</th>
                      <th>Account Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRoster.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-dim)' }}>{s.sequenceNumber}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A5B4FC' }}>
                          {s.studentNumber}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {s.photoUrl && (
                              <img src={s.photoUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                            )}
                            <span>{s.studentName}</span>
                          </div>
                        </td>
                        <td>{s.program}</td>
                        <td>Year {s.yearLevel}</td>
                        <td>
                          {s.linkedUserId ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--status-present)', fontWeight: 600 }}>
                              ● Live Account Linked
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              ○ Roster Reserved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Manual entry row */}
                    <tr style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                      <td style={{ color: 'var(--text-dim)' }}>+</td>
                      <td>
                        <input
                          type="text"
                          placeholder="2023-XXXXX"
                          value={manualRosterEntry.studentNumber}
                          onChange={(e) => setManualRosterEntry({ ...manualRosterEntry, studentNumber: e.target.value })}
                          style={{ width: '100%', background: 'transparent', border: '1px dashed var(--border-subtle)', color: 'var(--text-main)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Last Name, First Name, M.I."
                          value={manualRosterEntry.studentName}
                          onChange={(e) => setManualRosterEntry({ ...manualRosterEntry, studentName: e.target.value })}
                          style={{ width: '100%', background: 'transparent', border: '1px dashed var(--border-subtle)', color: 'var(--text-main)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g. BSCS"
                          value={manualRosterEntry.program}
                          onChange={(e) => setManualRosterEntry({ ...manualRosterEntry, program: e.target.value })}
                          style={{ width: '90px', background: 'transparent', border: '1px dashed var(--border-subtle)', color: 'var(--text-main)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={manualRosterEntry.yearLevel}
                          onChange={(e) => setManualRosterEntry({ ...manualRosterEntry, yearLevel: parseInt(e.target.value) || 1 })}
                          style={{ width: '60px', background: 'transparent', border: '1px dashed var(--border-subtle)', color: 'var(--text-main)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (manualRosterEntry.studentNumber && manualRosterEntry.studentName) {
                              onAddRosterStudent(activeClass.id, {
                                ...manualRosterEntry,
                                enrollmentStatus: 'enrolled'
                              });
                              setManualRosterEntry({ studentNumber: '', studentName: '', program: 'BSCS', yearLevel: 3 });
                            }
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          <Plus size={14} />
                          <span>Add Row</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE SYSTEM */}
          {workspaceTab === 'attendance' && (
            <div>
              {/* Controls bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>Attendance Matrix & FDA Warning Engine</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Tardy rule: {activeClass.lateConversionThreshold} Late = 1 Absent | Cut Threshold: {activeClass.fdaAbsenceThresholdHours} absences
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onOpenRapidRollCall(activeClass.id, todayDateStr)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Launch Rapid Roll-Call ({todayDateStr})</span>
                  </button>

                  <button
                    onClick={() => {
                      const dateInput = prompt('Enter Make-up Class Date (YYYY-MM-DD):', todayDateStr);
                      if (dateInput) {
                        onAddAttendanceSession(activeClass.id, dateInput, 'make-up', 'Make-up session');
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Make-Up Class</span>
                  </button>

                  {/* Instructor Self-Absence Toggle */}
                  <button
                    onClick={() => {
                      const confirmAbsence = window.confirm(
                        "Officially mark Instructor Self-Absence for today?\n\nThis will record an institutional session that does not penalize students."
                      );
                      if (confirmAbsence) {
                        onAddAttendanceSession(activeClass.id, todayDateStr, 'instructor-absence', 'Instructor Official Absence');
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', color: '#FCD34D' }}
                    title="Officially declare instructor absence so students are not penalized"
                  >
                    <UserX size={15} />
                    <span>Instructor Self-Absence</span>
                  </button>
                </div>
              </div>

              {/* Master Attendance Matrix */}
              <div className="table-container">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Student</th>
                      {activeSessions.map(ses => (
                        <th key={ses.id} style={{ textAlign: 'center', minWidth: '70px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {new Date(ses.sessionDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                            {ses.sessionType === 'regular' ? 'Reg' : ses.sessionType}
                          </div>
                        </th>
                      ))}
                      <th style={{ textAlign: 'center' }}>Cut Limit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRoster.map(student => {
                      const fda = calculateStudentFDA(student.id, activeClass);

                      return (
                        <tr key={student.id}>
                          <td style={{ color: 'var(--text-dim)' }}>{student.sequenceNumber}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{student.studentName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                              {student.studentNumber}
                            </div>
                          </td>

                          {/* Attendance Status Cells with quick click toggle */}
                          {activeSessions.map(ses => {
                            const rec = attendanceRecords.find(a => a.sessionId === ses.id && a.rosterEntryId === student.id);
                            const currentStatus: AttendanceStatus = rec ? rec.status : 'P';

                            return (
                              <td key={ses.id} style={{ textAlign: 'center' }}>
                                <select
                                  value={rec ? rec.status : ''}
                                  onChange={(e) => {
                                    const newSt = e.target.value as AttendanceStatus;
                                    if (rec) {
                                      onUpdateAttendanceRecord(rec.id, newSt);
                                    } else {
                                      onAddAttendanceRecord(ses.id, student.id, newSt);
                                    }
                                  }}
                                  className={`status-pill ${currentStatus}`}
                                  style={{
                                    border: 'none',
                                    padding: '0.2rem',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="">-</option>
                                  <option value="P">P</option>
                                  <option value="L">L</option>
                                  <option value="E">E</option>
                                  <option value="A">A</option>
                                </select>
                              </td>
                            );
                          })}

                          {/* FDA Alert Badges */}
                          <td style={{ textAlign: 'center' }}>
                            <span className={`fda-badge ${fda.badgeType}`}>
                              {fda.badgeType === 'danger' && '🚨 FDA RISK: '}
                              {fda.badgeType === 'warning' && '⚠️ WARNING: '}
                              {fda.badgeType === 'safe' && '✓ SAFE: '}
                              {fda.effectiveAbsences} / {fda.limit} cuts
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GRADES MANAGEMENT */}
          {workspaceTab === 'grades' && (
            <div>
              {/* Controls bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>Categorized Master Grade Book</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Strict NULL / Missing (--): Ungraded assessments do not prematurely deflate student standing
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Plus size={15} />
                    <span>Add Assessment / Record</span>
                  </button>
                </div>
              </div>

              {/* Master Grade Matrix */}
              <div className="table-container">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Student</th>
                      {activeActivities.map(act => (
                        <th key={act.id} style={{ minWidth: '130px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#A5B4FC' }}>{act.category}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{act.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            Max: {act.maxScore} pts • {act.activityDate}
                          </div>
                          <button
                            onClick={() => onOpenRapidGrading(activeClass.id, act.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem', marginTop: '4px' }}
                          >
                            Rapid Grade
                          </button>
                        </th>
                      ))}
                      <th style={{ textAlign: 'center' }}>Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRoster.map(student => {
                      let totalEarned = 0;
                      let totalPossible = 0;

                      return (
                        <tr key={student.id}>
                          <td style={{ color: 'var(--text-dim)' }}>{student.sequenceNumber}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{student.studentName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                              {student.studentNumber}
                            </div>
                          </td>

                          {activeActivities.map(act => {
                            const sc = gradeScores.find(s => s.activityId === act.id && s.rosterEntryId === student.id);
                            const isMissing = !sc || sc.isMissing || sc.score === null;
                            if (!isMissing && sc.score !== null) {
                              totalEarned += sc.score;
                              totalPossible += act.maxScore;
                            }

                            return (
                              <td key={act.id} style={{ textAlign: 'center' }}>
                                <input
                                  type="text"
                                  placeholder="--"
                                  value={isMissing || sc?.score === null || sc?.score === undefined ? '' : sc.score}
                                  onChange={(e) => {
                                    const val = e.target.value.trim();
                                    if (val === '') {
                                      onUpdateGradeScore(act.id, student.id, null, true);
                                    } else {
                                      const num = parseFloat(val);
                                      if (!isNaN(num)) {
                                        onUpdateGradeScore(act.id, student.id, num, false);
                                      }
                                    }
                                  }}
                                  style={{
                                    width: '65px',
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    background: isMissing ? 'transparent' : 'var(--bg-elevated)',
                                    color: isMissing ? 'var(--text-dim)' : 'var(--text-main)',
                                    border: '1px solid var(--border-subtle)',
                                    padding: '0.3rem',
                                    borderRadius: '4px'
                                  }}
                                />
                              </td>
                            );
                          })}

                          <td style={{ textAlign: 'center', fontWeight: 700 }}>
                            <span style={{ color: '#10B981' }}>{totalEarned}</span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}> / {totalPossible}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BETA — NOTES & TO-DO */}
          {workspaceTab === 'notes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--primary)" />
                  <span>Class Scratchpad & Lesson Notes</span>
                </h3>
                <textarea
                  placeholder="Type lesson outlines, lecture reminders, and student notices..."
                  defaultValue={(notes[activeClass.id] || [])[0]?.content || ''}
                  rows={8}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    padding: '0.75rem',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div className="glass-panel">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <span>Instructor Checklist & To-Dos</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(todos[activeClass.id] || []).map(td => (
                    <label key={td.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={td.isDone} />
                      <span style={{ textDecoration: td.isDone ? 'line-through' : 'none', color: td.isDone ? 'var(--text-dim)' : 'var(--text-main)' }}>
                        {td.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CLIPBOARD BULK IMPORT FROM EXCEL
          ------------------------------------------------------------- */}
      {showClipboardModal && (
        <div className="rapid-overlay-backdrop">
          <div className="rapid-card-modal">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Paste Roster from Excel / Google Sheets</div>
              <button onClick={() => setShowClipboardModal(false)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Copy the 5-column table from your spreadsheet (<code>[#]</code>, <code>[Student Number]</code>, <code>[Student Name]</code>, <code>[Program]</code>, <code>[Year Level]</code>) and paste it below:
              </p>
              <textarea
                rows={8}
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                placeholder="1&#9;2023-10492&#9;Turtoga, Joshua A.&#9;BSCS&#9;3&#10;2&#9;2023-10493&#9;Reyes, Kathleen B.&#9;BSCS&#9;3"
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  padding: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}
              />
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setShowClipboardModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleParseClipboard} className="btn btn-primary">
                  Import Rows
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD GRADE ACTIVITY
          ------------------------------------------------------------- */}
      {showAddActivityModal && activeClass && (
        <div className="rapid-overlay-backdrop">
          <div className="rapid-card-modal">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Add Academic Assessment (Record Grades)</div>
              <button onClick={() => setShowAddActivityModal(false)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Activity Category
                  </label>
                  <select
                    value={newActivityData.category}
                    onChange={(e) => setNewActivityData({ ...newActivityData, category: e.target.value as GradeCategory })}
                    style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="Quizzes">Quizzes</option>
                    <option value="Exams">Exams</option>
                    <option value="Performance Tasks">Performance Tasks</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Activity Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Quiz 3: Normalization & SQL"
                    value={newActivityData.name}
                    onChange={(e) => setNewActivityData({ ...newActivityData, name: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Max Score (Points)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newActivityData.maxScore}
                      onChange={(e) => setNewActivityData({ ...newActivityData, maxScore: parseInt(e.target.value) || 10 })}
                      style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Date Conducted
                    </label>
                    <input
                      type="date"
                      value={newActivityData.activityDate}
                      onChange={(e) => setNewActivityData({ ...newActivityData, activityDate: e.target.value })}
                      style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setShowAddActivityModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newActivityData.name) {
                      onAddGradeActivity(activeClass.id, newActivityData);
                      setShowAddActivityModal(false);
                    }
                  }}
                  className="btn btn-primary"
                >
                  Create & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
