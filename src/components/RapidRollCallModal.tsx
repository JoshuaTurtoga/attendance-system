import React, { useState, useEffect, useCallback } from 'react';
import { RosterEntry, AttendanceStatus, AttendanceRecord } from '../types';
import { 
  Check, 
  Clock, 
  ShieldCheck, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface RapidRollCallModalProps {
  roster: RosterEntry[];
  sessionDate: string;
  courseTitle: string;
  courseCode: string;
  existingRecords: AttendanceRecord[];
  onSaveRecord: (rosterEntryId: string, status: AttendanceStatus, notes?: string) => void;
  onClose: () => void;
}

export const RapidRollCallModal: React.FC<RapidRollCallModalProps> = ({
  roster,
  sessionDate,
  courseTitle,
  courseCode,
  existingRecords,
  onSaveRecord,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [note, setNote] = useState('');
  const [flashColor, setFlashColor] = useState<string | null>(null);

  const currentStudent = roster[currentIndex];
  const currentRecord = currentStudent 
    ? existingRecords.find(r => r.rosterEntryId === currentStudent.id)
    : undefined;

  // Sync note when student changes
  useEffect(() => {
    if (currentRecord?.notes) {
      setNote(currentRecord.notes);
    } else {
      setNote('');
    }
  }, [currentIndex, currentRecord]);

  const handleMarkStatus = useCallback((status: AttendanceStatus) => {
    if (!currentStudent) return;
    
    // Visual feedback flash
    const colors: Record<AttendanceStatus, string> = {
      P: 'rgba(16, 185, 129, 0.25)',
      L: 'rgba(245, 158, 11, 0.25)',
      E: 'rgba(14, 165, 233, 0.25)',
      A: 'rgba(239, 68, 68, 0.25)',
    };
    setFlashColor(colors[status]);
    setTimeout(() => setFlashColor(null), 200);

    onSaveRecord(currentStudent.id, status, note.trim() ? note.trim() : undefined);

    // Auto-advance
    if (currentIndex < roster.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentStudent, currentIndex, roster.length, note, onSaveRecord]);

  // Global Single-Key Shortcuts: P, L, E, A, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside the text note input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'P') {
        e.preventDefault();
        handleMarkStatus('P');
      } else if (key === 'L') {
        e.preventDefault();
        handleMarkStatus('L');
      } else if (key === 'E') {
        e.preventDefault();
        handleMarkStatus('E');
      } else if (key === 'A') {
        e.preventDefault();
        handleMarkStatus('A');
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < roster.length - 1) setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMarkStatus, currentIndex, roster.length, onClose]);

  if (!currentStudent) {
    return null;
  }

  const progressPercent = Math.round(((currentIndex + 1) / roster.length) * 100);

  return (
    <div className="rapid-overlay-backdrop">
      <div 
        className="rapid-card-modal"
        style={{
          backgroundColor: flashColor || 'var(--bg-surface)',
          transition: 'background-color 0.2s ease'
        }}
      >
        {/* Header Bar */}
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
                RAPID ROLL-CALL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • {courseCode} ({sessionDate})
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Press Single-Key Shortcuts (<span className="keycap">P</span> <span className="keycap">L</span> <span className="keycap">E</span> <span className="keycap">A</span>) to mark & auto-advance
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'var(--border-subtle)', width: '100%' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), #10B981)',
            width: `${progressPercent}%`,
            transition: 'width 0.2s ease'
          }} />
        </div>

        {/* Student Verification Card */}
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          {/* Official Student Photo Verification */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
            <img 
              src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={currentStudent.studentName}
              style={{
                width: '130px',
                height: '130px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '3px solid var(--border-active)',
                boxShadow: 'var(--shadow-xl)'
              }}
            />
            {currentRecord && (
              <span 
                className={`status-pill ${currentRecord.status}`}
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  width: '36px',
                  height: '36px',
                  fontSize: '1rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
              >
                {currentRecord.status}
              </span>
            )}
          </div>

          {/* Student Identifiers */}
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            {currentStudent.studentName}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#A5B4FC' }}>
              {currentStudent.studentNumber}
            </span>
            <span>•</span>
            <span>{currentStudent.program} - Year {currentStudent.yearLevel}</span>
            <span>•</span>
            <span>#{currentStudent.sequenceNumber}</span>
          </div>

          {/* Quick Notes Input */}
          <div style={{ maxWidth: '420px', margin: '0 auto 1.5rem', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Add quick attendance note (e.g., reason for tardiness)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Rapid Hotkey Action Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '0.75rem', 
            maxWidth: '460px', 
            margin: '0 auto' 
          }}>
            <button 
              onClick={() => handleMarkStatus('P')}
              className="btn"
              style={{
                background: 'var(--status-present-bg)',
                border: '1px solid var(--status-present-border)',
                color: 'var(--status-present)',
                flexDirection: 'column',
                padding: '0.85rem 0.5rem',
                gap: '0.35rem'
              }}
            >
              <Check size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>PRESENT</span>
              <span className="keycap">P</span>
            </button>

            <button 
              onClick={() => handleMarkStatus('L')}
              className="btn"
              style={{
                background: 'var(--status-late-bg)',
                border: '1px solid var(--status-late-border)',
                color: 'var(--status-late)',
                flexDirection: 'column',
                padding: '0.85rem 0.5rem',
                gap: '0.35rem'
              }}
            >
              <Clock size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>LATE</span>
              <span className="keycap">L</span>
            </button>

            <button 
              onClick={() => handleMarkStatus('E')}
              className="btn"
              style={{
                background: 'var(--status-excused-bg)',
                border: '1px solid var(--status-excused-border)',
                color: 'var(--status-excused)',
                flexDirection: 'column',
                padding: '0.85rem 0.5rem',
                gap: '0.35rem'
              }}
            >
              <ShieldCheck size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>EXCUSED</span>
              <span className="keycap">E</span>
            </button>

            <button 
              onClick={() => handleMarkStatus('A')}
              className="btn"
              style={{
                background: 'var(--status-absent-bg)',
                border: '1px solid var(--status-absent-border)',
                color: 'var(--status-absent)',
                flexDirection: 'column',
                padding: '0.85rem 0.5rem',
                gap: '0.35rem'
              }}
            >
              <X size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>ABSENT</span>
              <span className="keycap">A</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar */}
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
            <span>Previous</span>
            <span className="keycap" style={{ fontSize: '0.65rem' }}>←</span>
          </button>

          {/* Jump to Student Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {currentIndex + 1} of {roster.length}
            </span>
            <select
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem'
              }}
            >
              {roster.map((s, idx) => (
                <option key={s.id} value={idx}>
                  #{s.sequenceNumber}: {s.studentName}
                </option>
              ))}
            </select>
          </div>

          <button 
            disabled={currentIndex === roster.length - 1}
            onClick={() => setCurrentIndex(prev => Math.min(roster.length - 1, prev + 1))}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <span>Next</span>
            <span className="keycap" style={{ fontSize: '0.65rem' }}>→</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
