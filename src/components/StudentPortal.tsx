import React, { useState } from 'react';
import { 
  User, 
  ClassItem, 
  RosterEntry, 
  AttendanceSession, 
  AttendanceRecord, 
  GradeActivity, 
  GradeScore, 
  ExcuseRequest, 
  StudentExternalClass 
} from '../types';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Upload, 
  Sparkles, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';

interface StudentPortalProps {
  currentUser: User;
  allClasses: ClassItem[];
  allRosters: Record<string, RosterEntry[]>;
  allSessions: Record<string, AttendanceSession[]>;
  allAttendance: AttendanceRecord[];
  allActivities: Record<string, GradeActivity[]>;
  allScores: GradeScore[];
  externalClasses: StudentExternalClass[];
  onJoinClassSubmit: (courseCode: string, joinCode: string) => void;
  onSubmitExcuseRequest: (classId: string, attendanceRecordId: string, date: string, reason: string) => void;
  onAddExternalClass: (extClass: Omit<StudentExternalClass, 'id' | 'studentId'>) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentUser,
  allClasses,
  allRosters,
  allSessions,
  allAttendance,
  allActivities,
  allScores,
  externalClasses,
  onJoinClassSubmit,
  onSubmitExcuseRequest,
  onAddExternalClass
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'classes' | 'schedule' | 'join'>('today');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [selectedAttendanceForExcuse, setSelectedAttendanceForExcuse] = useState<{ recordId: string, date: string, classId: string } | null>(null);
  const [excuseReason, setExcuseReason] = useState('');

  // Join Class Form State
  const [joinCourseCode, setJoinCourseCode] = useState('');
  const [joinClassCode, setJoinClassCode] = useState('');
  const [joinStatusMessage, setJoinStatusMessage] = useState<string | null>(null);

  // External Class Form State
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);
  const [newExternal, setNewExternal] = useState({
    courseCode: '',
    courseTitle: '',
    room: 'Room TBA',
    dayOfWeek: 'Monday' as StudentExternalClass['dayOfWeek'],
    startTime: '13:00',
    endTime: '15:00'
  });

  // Find all classes where this student is enrolled
  const enrolledClasses = allClasses.filter(c => {
    const roster = allRosters[c.id] || [];
    return roster.some(r => r.linkedUserId === currentUser.id || r.studentNumber === currentUser.studentIdNumber);
  });

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="role-badge student">STUDENT ACADEMIC PORTAL</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {currentUser.studentIdNumber}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
            Student Personal Academic Hub
          </h1>
        </div>

        <button 
          onClick={() => setActiveTab('join')}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Apply to Join Class</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('today')}
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
        >
          <Clock size={16} />
          <span>"Today" Live Academic Standing</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('classes');
            if (!selectedClassId && enrolledClasses.length > 0) {
              setSelectedClassId(enrolledClasses[0].id);
            }
          }}
          className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Enrolled Classes ({enrolledClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
        >
          <Calendar size={16} />
          <span>Personal Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('join')}
          className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
        >
          <Plus size={16} />
          <span>Join a Class</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: "TODAY" DASHBOARD
          ------------------------------------------------------------- */}
      {activeTab === 'today' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Today's Scheduled Classes & Live Records</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time attendance stamps and grade updates recorded by your instructors today
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {enrolledClasses.map(cls => {
              const roster = allRosters[cls.id] || [];
              const myRosterSlot = roster.find(r => r.linkedUserId === currentUser.id || r.studentNumber === currentUser.studentIdNumber);
              const sessions = allSessions[cls.id] || [];
              const todaySession = sessions.find(s => s.sessionDate === todayDateStr);
              const todayAtt = (todaySession && myRosterSlot)
                ? allAttendance.find(a => a.sessionId === todaySession.id && a.rosterEntryId === myRosterSlot.id)
                : null;

              // Today's grades
              const todayActivities = (allActivities[cls.id] || []).filter(a => a.activityDate === todayDateStr);

              return (
                <div key={cls.id} className="glass-panel" style={{ borderLeft: `4px solid ${cls.colorAccent || 'var(--primary)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#A5B4FC', fontWeight: 700 }}>
                        {cls.section} • {cls.classType}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', marginTop: '0.25rem' }}>
                        {cls.courseCode} - {cls.courseTitle}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                        {cls.instructorName}
                      </div>
                    </div>

                    {/* Today's Attendance Status Badge */}
                    <div>
                      {todayAtt ? (
                        <div style={{ textAlign: 'center' }}>
                          <span className={`status-pill ${todayAtt.status}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                            {todayAtt.status}
                          </span>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            {todayAtt.status === 'P' && 'Present'}
                            {todayAtt.status === 'L' && 'Late'}
                            {todayAtt.status === 'E' && 'Excused'}
                            {todayAtt.status === 'A' && 'Absent'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-elevated)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                          No roll-call yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Today's Activities */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      ASSESSMENTS CONDUCTED TODAY:
                    </div>
                    {todayActivities.length > 0 ? (
                      todayActivities.map(act => {
                        const sc = myRosterSlot ? allScores.find(s => s.activityId === act.id && s.rosterEntryId === myRosterSlot.id) : null;
                        return (
                          <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.25rem 0' }}>
                            <span>{act.name}</span>
                            <span style={{ fontWeight: 700, color: sc?.isMissing ? '#F87171' : 'var(--status-present)' }}>
                              {sc?.isMissing || sc?.score === null ? 'Missing / Ungraded' : `${sc?.score} / ${act.maxScore}`}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No assessments scheduled today.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: ENROLLED CLASSES (STRICT DATA ISOLATION)
          ------------------------------------------------------------- */}
      {activeTab === 'classes' && (
        <div>
          {enrolledClasses.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <BookOpen size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
              <h3>No Enrolled Classes Found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Join your university courses using the Class Code provided by your instructor.
              </p>
              <button onClick={() => setActiveTab('join')} className="btn btn-primary">
                Join a Class Now
              </button>
            </div>
          ) : (
            <div>
              {/* Class Switcher */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {enrolledClasses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassId(c.id)}
                    className={`btn ${selectedClassId === c.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {c.courseCode} ({c.section})
                  </button>
                ))}
              </div>

              {/* Selected Class Details */}
              {(() => {
                const currentCls = enrolledClasses.find(c => c.id === selectedClassId) || enrolledClasses[0];
                if (!currentCls) return null;

                const roster = allRosters[currentCls.id] || [];
                const mySlot = roster.find(r => r.linkedUserId === currentUser.id || r.studentNumber === currentUser.studentIdNumber);
                const sessions = allSessions[currentCls.id] || [];
                const activities = allActivities[currentCls.id] || [];

                // Calculate personal attendance cuts
                let absences = 0;
                let lates = 0;
                let excused = 0;
                let present = 0;

                const myAttendanceHistory = sessions.map(ses => {
                  const rec = mySlot ? allAttendance.find(a => a.sessionId === ses.id && a.rosterEntryId === mySlot.id) : null;
                  if (rec?.status === 'P') present++;
                  if (rec?.status === 'L') lates++;
                  if (rec?.status === 'E') excused++;
                  if (rec?.status === 'A') absences++;
                  return { session: ses, record: rec };
                });

                const effectiveAbsences = absences + Math.floor(lates / currentCls.lateConversionThreshold);
                const limit = currentCls.fdaAbsenceThresholdHours;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* FDA Summary Card */}
                    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem' }}>{currentCls.courseCode}: {currentCls.courseTitle}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Instructor: {currentCls.instructorName} • {currentCls.section}
                        </span>
                      </div>

                      {/* Cut Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>FDA Cut Accumulation</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                            {effectiveAbsences} / {limit} cuts
                          </div>
                        </div>

                        <span className={`fda-badge ${effectiveAbsences >= limit ? 'danger' : effectiveAbsences >= limit * 0.6 ? 'warning' : 'safe'}`}>
                          {effectiveAbsences >= limit ? '🚨 FDA RISK' : effectiveAbsences >= limit * 0.6 ? '⚠️ WARNING' : '✓ SAFE STANDING'}
                        </span>
                      </div>
                    </div>

                    {/* Attendance History & Excuse Slip Submission */}
                    <div className="glass-panel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>Your Attendance Log</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Present: {present} | Late: {lates} | Excused: {excused} | Absent: {absences}
                        </span>
                      </div>

                      <div className="table-container">
                        <table className="matrix-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Notes from Instructor</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myAttendanceHistory.map(({ session, record }) => (
                              <tr key={session.id}>
                                <td style={{ fontWeight: 600 }}>{session.sessionDate}</td>
                                <td style={{ textTransform: 'capitalize', color: 'var(--text-dim)' }}>{session.sessionType}</td>
                                <td>
                                  {record ? (
                                    <span className={`status-pill ${record.status}`}>
                                      {record.status}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-dim)' }}>-</span>
                                  )}
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {record?.notes || 'No notes'}
                                </td>
                                <td>
                                  {record?.status === 'A' && (
                                    <button
                                      onClick={() => {
                                        setSelectedAttendanceForExcuse({
                                          recordId: record.id,
                                          date: session.sessionDate,
                                          classId: currentCls.id
                                        });
                                        setShowExcuseModal(true);
                                      }}
                                      className="btn btn-secondary"
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#0EA5E9' }}
                                    >
                                      Submit Excuse Slip
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Personal Academic Scores (Strictly Isolated from Classmates) */}
                    <div className="glass-panel">
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>Your Assessment Scores</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Academic Privacy: You can only view your own recorded grades.
                        </span>
                      </div>

                      <div className="table-container">
                        <table className="matrix-table">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Assessment Name</th>
                              <th>Max Points</th>
                              <th>Your Score</th>
                              <th>Date Conducted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities.map(act => {
                              const sc = mySlot ? allScores.find(s => s.activityId === act.id && s.rosterEntryId === mySlot.id) : null;
                              const isMissing = !sc || sc.isMissing || sc.score === null;

                              return (
                                <tr key={act.id}>
                                  <td style={{ color: '#A5B4FC', fontWeight: 600 }}>{act.category}</td>
                                  <td style={{ fontWeight: 600 }}>{act.name}</td>
                                  <td>{act.maxScore} pts</td>
                                  <td>
                                    {isMissing ? (
                                      <span style={{ color: '#F87171', fontWeight: 700 }}>-- (Missing / Ungraded)</span>
                                    ) : (
                                      <span style={{ color: 'var(--status-present)', fontWeight: 700 }}>{sc?.score} pts</span>
                                    )}
                                  </td>
                                  <td style={{ color: 'var(--text-dim)' }}>{act.activityDate}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: PERSONAL TIMETABLE (+ MANUAL EXTERNAL SUBJECTS)
          ------------------------------------------------------------- */}
      {activeTab === 'schedule' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Your Weekly College Timetable</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Combined timetable of your enrolled university classes and manually added external subjects.
              </p>
            </div>

            <button
              onClick={() => setShowAddExternalModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={15} />
              <span>Manually Add External Class</span>
            </button>
          </div>

          <div className="timetable-grid">
            <div className="timetable-header">Time</div>
            <div className="timetable-header">Mon</div>
            <div className="timetable-header">Tue</div>
            <div className="timetable-header">Wed</div>
            <div className="timetable-header">Thu</div>
            <div className="timetable-header">Fri</div>
            <div className="timetable-header">Sat</div>

            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => (
              <React.Fragment key={hour}>
                <div className="timetable-cell" style={{ fontWeight: 600, color: 'var(--text-dim)', textAlign: 'center', background: 'var(--bg-elevated)' }}>
                  {hour}
                </div>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                  // Find enrolled class
                  const enrolledSlot = enrolledClasses.flatMap(c => 
                    c.schedules
                      .filter(s => s.dayOfWeek === day && s.startTime.startsWith(hour.slice(0, 2)))
                      .map(s => ({ title: `${c.courseCode} (${s.room})`, color: c.colorAccent || 'var(--primary)' }))
                  )[0];

                  // Find external class
                  const extSlot = externalClasses.find(e => 
                    e.dayOfWeek === day && e.startTime.startsWith(hour.slice(0, 2))
                  );

                  return (
                    <div key={day} className="timetable-cell">
                      {enrolledSlot && (
                        <div style={{ background: enrolledSlot.color, padding: '0.35rem 0.5rem', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                          {enrolledSlot.title}
                        </div>
                      )}
                      {extSlot && !enrolledSlot && (
                        <div style={{ background: '#475569', padding: '0.35rem 0.5rem', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                          {extSlot.courseCode} ({extSlot.room})
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
          TAB 4: JOIN CLASS WORKFLOW
          ------------------------------------------------------------- */}
      {activeTab === 'join' && (
        <div className="glass-panel" style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Join University Class Workspace</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Enter the Course Code and unique Class Join Code provided by your instructor. Your student ID and official profile photo will be submitted for verification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Course Code (e.g. STAS or CS301)
              </label>
              <input
                type="text"
                placeholder="STAS"
                value={joinCourseCode}
                onChange={(e) => setJoinCourseCode(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Unique Class Code (e.g. STAS-9482)
              </label>
              <input
                type="text"
                placeholder="STAS-9482"
                value={joinClassCode}
                onChange={(e) => setJoinClassCode(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {joinStatusMessage && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#34D399', fontSize: '0.85rem' }}>
                {joinStatusMessage}
              </div>
            )}

            <button
              onClick={() => {
                if (joinCourseCode && joinClassCode) {
                  onJoinClassSubmit(joinCourseCode, joinClassCode);
                  setJoinStatusMessage(
                    `Successfully sent a request to join the class ${joinCourseCode.toUpperCase()} to your instructor.`
                  );
                  setJoinCourseCode('');
                  setJoinClassCode('');
                }
              }}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              <Check size={16} />
              <span>Submit Join Application</span>
            </button>
          </div>
        </div>
      )}

      {/* EXCUSE SLIP SUBMISSION MODAL */}
      {showExcuseModal && selectedAttendanceForExcuse && (
        <div className="rapid-overlay-backdrop">
          <div className="rapid-card-modal">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Submit Absence Excuse Slip ({selectedAttendanceForExcuse.date})</div>
              <button onClick={() => setShowExcuseModal(false)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Please provide official medical certificate or formal explanation. Your instructor will review this in their queue.
              </p>
              <textarea
                rows={4}
                placeholder="Reason for absence..."
                value={excuseReason}
                onChange={(e) => setExcuseReason(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff', padding: '0.6rem', fontSize: '0.85rem' }}
              />
              <div style={{ marginTop: '1rem', padding: '1rem', border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                <Upload size={20} style={{ margin: '0 auto 4px' }} />
                <span>Upload Medical Certificate / Supporting Document (Simulated)</span>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setShowExcuseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (excuseReason) {
                      onSubmitExcuseRequest(
                        selectedAttendanceForExcuse.classId,
                        selectedAttendanceForExcuse.recordId,
                        selectedAttendanceForExcuse.date,
                        excuseReason
                      );
                      setShowExcuseModal(false);
                      setExcuseReason('');
                      alert("Excuse request submitted to your instructor's queue.");
                    }
                  }}
                  className="btn btn-primary"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXTERNAL SUBJECT MODAL */}
      {showAddExternalModal && (
        <div className="rapid-overlay-backdrop">
          <div className="rapid-card-modal">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Manually Add External Class</div>
              <button onClick={() => setShowAddExternalModal(false)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Course Code (e.g., MATH201)"
                  value={newExternal.courseCode}
                  onChange={(e) => setNewExternal({ ...newExternal, courseCode: e.target.value })}
                  style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="Course Title"
                  value={newExternal.courseTitle}
                  onChange={(e) => setNewExternal({ ...newExternal, courseTitle: e.target.value })}
                  style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="Room (e.g., Eng 302)"
                  value={newExternal.room}
                  onChange={(e) => setNewExternal({ ...newExternal, room: e.target.value })}
                  style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <select
                    value={newExternal.dayOfWeek}
                    onChange={(e) => setNewExternal({ ...newExternal, dayOfWeek: e.target.value as any })}
                    style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                  <input
                    type="time"
                    value={newExternal.startTime}
                    onChange={(e) => setNewExternal({ ...newExternal, startTime: e.target.value })}
                    style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                  <input
                    type="time"
                    value={newExternal.endTime}
                    onChange={(e) => setNewExternal({ ...newExternal, endTime: e.target.value })}
                    style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setShowAddExternalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newExternal.courseCode) {
                      onAddExternalClass(newExternal);
                      setShowAddExternalModal(false);
                    }
                  }}
                  className="btn btn-primary"
                >
                  Save to Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
