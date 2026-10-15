import React, { useState, useEffect } from 'react';
import { RosterEntry, GradeActivity, GradeScore, AttendanceRecord } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  MinusCircle
} from 'lucide-react';

interface RapidGradingModalProps {
  activity: GradeActivity;
  roster: RosterEntry[];
  existingScores: GradeScore[];
  todayAttendance?: AttendanceRecord[];
  onSaveScore: (rosterEntryId: string, score: number | null, isMissing: boolean) => void;
  onFinishGrading: (allScores: GradeScore[], shouldAutoGenerateAttendance: boolean) => void;
  onClose: () => void;
}

export const RapidGradingModal: React.FC<RapidGradingModalProps> = ({
  activity,
  roster,
  existingScores,
  todayAttendance,
  onSaveScore,
  onFinishGrading,
  onClose
}) => {
  // If attendance exists today, determine who was marked absent
  const absentRosterIds = new Set(
    todayAttendance?.filter(a => a.status === 'A').map(a => a.rosterEntryId) || []
  );

  // Active roster for this session (can auto-skip absent students if attendance was already recorded today)
  const [skipAbsent, setSkipAbsent] = useState(absentRosterIds.size > 0);
  const eligibleRoster = skipAbsent 
    ? roster.filter(s => !absentRosterIds.has(s.id))
    : roster;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputScore, setInputScore] = useState<string>('');
  const [localScores, setLocalScores] = useState<Record<string, { score: number | null, isMissing: boolean }>>(() => {
    const map: Record<string, { score: number | null, isMissing: boolean }> = {};
    existingScores.forEach(s => {
      map[s.rosterEntryId] = { score: s.score, isMissing: s.isMissing };
    });
    return map;
  });

  const currentStudent = eligibleRoster[currentIndex];

  useEffect(() => {
    if (currentStudent && localScores[currentStudent.id]) {
      const entry = localScores[currentStudent.id];
      if (entry.isMissing || entry.score === null) {
        setInputScore('');
      } else {
        setInputScore(entry.score.toString());
      }
    } else {
      setInputScore('');
    }
  }, [currentIndex, currentStudent, localScores]);

  const handleConfirmScore = (markMissing = false) => {
    if (!currentStudent) return;

    let scoreValue: number | null = null;
    let isMissing = markMissing;

    if (!markMissing) {
      const parsed = parseFloat(inputScore);
      if (!isNaN(parsed)) {
        scoreValue = Math.min(activity.maxScore, Math.max(0, parsed));
        isMissing = false;
      } else {
        isMissing = true;
      }
    }

    setLocalScores(prev => ({
      ...prev,
      [currentStudent.id]: { score: scoreValue, isMissing }
    }));

    onSaveScore(currentStudent.id, scoreValue, isMissing);

    if (currentIndex < eligibleRoster.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmScore(false);
    }
  };

  const isCompleted = currentIndex === eligibleRoster.length - 1;
  const showAutoAttendancePrompt = !todayAttendance || todayAttendance.length === 0;

  return (
    <div className="rapid-overlay-backdrop">
      <div className="rapid-card-modal" style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-elevated)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                RAPID GRADING OVERLAY
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • {activity.name} (Max: {activity.maxScore} pts)
              </span>
            </div>
            {absentRosterIds.size > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#FCD34D', marginTop: '2px' }}>
                ⚡ Auto-skipping {absentRosterIds.size} student(s) marked Absent today.
              </div>
            )}
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'var(--border-subtle)', width: '100%' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
            width: `${Math.round(((currentIndex + 1) / eligibleRoster.length) * 100)}%`,
            transition: 'width 0.2s ease'
          }} />
        </div>

        {/* Card Body */}
        {currentStudent ? (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <img 
              src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={currentStudent.studentName}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '3px solid var(--border-active)',
                marginBottom: '1rem'
              }}
            />

            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
              {currentStudent.studentName}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#A5B4FC' }}>{currentStudent.studentNumber}</span>
              {' • '}{currentStudent.program} - Year {currentStudent.yearLevel}
            </div>

            {/* Score Entry Box */}
            <div style={{ 
              maxWidth: '320px', 
              margin: '0 auto 1.5rem',
              background: 'var(--bg-elevated)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Score (out of {activity.maxScore})
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <input 
                  type="number"
                  min="0"
                  max={activity.maxScore}
                  step="0.5"
                  autoFocus
                  placeholder="0"
                  value={inputScore}
                  onChange={(e) => setInputScore(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: '120px',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    padding: '0.5rem',
                    background: 'var(--bg-surface)',
                    border: '2px solid var(--border-focus)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff'
                  }}
                />
                <span style={{ fontSize: '1.25rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  / {activity.maxScore}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => handleConfirmScore(false)}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Save Score</span>
                  <span className="keycap" style={{ fontSize: '0.65rem' }}>ENTER</span>
                </button>

                <button 
                  onClick={() => handleConfirmScore(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', color: '#F87171' }}
                  title="Store as strict NULL / Missing"
                >
                  <MinusCircle size={15} />
                  <span>Mark Missing</span>
                </button>
              </div>
            </div>

            {/* Strict Zero vs Missing Note */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '420px', margin: '0 auto' }}>
              💡 <em>Strict academic rule:</em> Entering <code>0</code> signifies earned zero. Marking <code>Missing</code> retains a NULL value to prevent premature grade deflation.
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--status-present)" style={{ margin: '0 auto 1rem' }} />
            <h2>Grading Complete!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              All {eligibleRoster.length} eligible students have been graded for {activity.name}.
            </p>

            {showAutoAttendancePrompt && (
              <div style={{
                marginTop: '1.5rem',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#A5B4FC' }}>
                  <Sparkles size={18} />
                  <span>Auto-generate Today's Attendance?</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Students with recorded scores will be marked <strong>Present (P)</strong>, and missing scores will be marked <strong>Absent (A)</strong>.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#FCD34D' }}>
                  <AlertTriangle size={14} />
                  <span>Warning: Auto-generation only assigns Present or Absent. Any Late or Excused must be adjusted manually.</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {showAutoAttendancePrompt && (
                <button 
                  onClick={() => onFinishGrading(existingScores, true)}
                  className="btn btn-primary"
                >
                  <Sparkles size={16} />
                  <span>Save & Auto-Generate Attendance</span>
                </button>
              )}
              <button 
                onClick={() => onFinishGrading(existingScores, false)}
                className="btn btn-secondary"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer controls */}
        {currentStudent && (
          <div style={{
            padding: '0.9rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {currentIndex + 1} of {eligibleRoster.length}
            </span>

            <button 
              disabled={currentIndex === eligibleRoster.length - 1}
              onClick={() => setCurrentIndex(prev => Math.min(eligibleRoster.length - 1, prev + 1))}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
