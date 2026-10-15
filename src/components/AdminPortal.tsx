import React, { useState } from 'react';
import { User, ClassItem, RosterEntry } from '../types';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Settings, 
  Lock, 
  Layers, 
  Search, 
  AlertOctagon, 
  Check, 
  X,
  FileText
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: User;
  allUsers: User[];
  allClasses: ClassItem[];
  allRosters: Record<string, RosterEntry[]>;
  onProvisionInstructor: (instructorData: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
  }) => void;
  onUpdateGlobalSettings: (settings: {
    activeTerm: string;
    lateRatio: number;
    cutLimitPercent: number;
  }) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  allUsers,
  allClasses,
  allRosters,
  onProvisionInstructor,
  onUpdateGlobalSettings
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'settings'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'College of Computer Studies'
  });

  const [globalSettings, setGlobalSettings] = useState({
    activeTerm: '1st Semester AY 2026-2027',
    lateRatio: 3,
    cutLimitPercent: 20
  });

  const filteredUsers = allUsers.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email} ${u.department || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="role-badge admin">ADMINISTRATIVE DASHBOARD POV</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Institutional Governance</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
            System Administration Portal
          </h1>
        </div>

        <button 
          onClick={() => setShowProvisionModal(true)}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
        >
          <UserPlus size={16} />
          <span>Provision Faculty Account</span>
        </button>
      </div>

      {/* Strict Academic Barrier Warning Notice */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <Lock size={28} color="#EF4444" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ color: '#F87171', fontSize: '0.95rem', marginBottom: '0.15rem' }}>
            Strict Academic Data Privacy Enforced (Admin Restriction)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            System Administrators possess oversight of users, institutional terms, and class allocations. However, 
            <strong> Admins are strictly blocked at both the UI and database API levels from viewing, editing, or tampering with grades, attendance records, and student assessment internals.</strong>
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={16} />
          <span>User Management ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>Institutional Class Oversight ({allClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={16} />
          <span>Global Institutional Settings</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Institution-wide User Accounts</h3>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search user by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Official Email</th>
                  <th>Roles</th>
                  <th>Department / Program</th>
                  <th>Onboarded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img 
                          src={u.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                          alt="" 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#A5B4FC' }}>
                      {u.email}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {u.roles.map(r => (
                          <span key={r} className={`role-badge ${r}`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td>{u.department || u.program || 'N/A'}</td>
                    <td>
                      {u.isOnboarded ? (
                        <span style={{ color: 'var(--status-present)', fontSize: '0.75rem', fontWeight: 600 }}>✓ Complete</span>
                      ) : (
                        <span style={{ color: 'var(--status-late)', fontSize: '0.75rem' }}>⏳ Pending</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: 'var(--status-present)', fontSize: '0.75rem', fontWeight: 600 }}>● Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS OVERSIGHT */}
      {activeTab === 'classes' && (
        <div className="glass-panel">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Institutional Class Registry</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Read-only institutional audit view of all created class workspaces. Internal academic records (grades and attendance) are sealed to the assigned instructor.
            </p>
          </div>

          <div className="table-container">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Section</th>
                  <th>Instructor</th>
                  <th>Term</th>
                  <th>Enrolled</th>
                  <th>Academic Data Access</th>
                </tr>
              </thead>
              <tbody>
                {allClasses.map(c => {
                  const roster = allRosters[c.id] || [];
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.courseCode}</td>
                      <td>{c.courseTitle}</td>
                      <td><span className="keycap">{c.section}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.instructorName}</td>
                      <td>{c.academicTerm}</td>
                      <td style={{ fontWeight: 700 }}>{roster.length} students</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Lock size={12} />
                          <span>Sealed to Instructor</span>
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

      {/* TAB 3: GLOBAL SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ maxWidth: '650px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Global University Attendance & Term Policies</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Active Academic Term / Semester
              </label>
              <input
                type="text"
                value={globalSettings.activeTerm}
                onChange={(e) => setGlobalSettings({ ...globalSettings, activeTerm: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Default Tardiness Conversion Ratio (Lates per 1 Equivalent Absent)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={globalSettings.lateRatio}
                onChange={(e) => setGlobalSettings({ ...globalSettings, lateRatio: parseInt(e.target.value) || 3 })}
                style={{ width: '120px', padding: '0.55rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '10px' }}>Default: 3 Lates = 1 Absent</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Maximum Cut Threshold Percentage (FDA Limit)
              </label>
              <input
                type="number"
                min="10"
                max="40"
                value={globalSettings.cutLimitPercent}
                onChange={(e) => setGlobalSettings({ ...globalSettings, cutLimitPercent: parseInt(e.target.value) || 20 })}
                style={{ width: '120px', padding: '0.55rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '10px' }}>% of total semester class hours</span>
            </div>

            <button
              onClick={() => {
                onUpdateGlobalSettings(globalSettings);
                alert("Global institutional policies updated successfully.");
              }}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
            >
              Save Institutional Policies
            </button>
          </div>
        </div>
      )}

      {/* PROVISION INSTRUCTOR MODAL */}
      {showProvisionModal && (
        <div className="rapid-overlay-backdrop">
          <div className="rapid-card-modal">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Provision Faculty (Instructor) Account</div>
              <button onClick={() => setShowProvisionModal(false)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Per institutional security rules, instructors cannot self-register. Administrative credentials will be provisioned below:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newInstructor.firstName}
                    onChange={(e) => setNewInstructor({ ...newInstructor, firstName: e.target.value })}
                    style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newInstructor.lastName}
                    onChange={(e) => setNewInstructor({ ...newInstructor, lastName: e.target.value })}
                    style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Official Faculty Email (e.g., name@university.edu.ph)"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
                <select
                  value={newInstructor.department}
                  onChange={(e) => setNewInstructor({ ...newInstructor, department: e.target.value })}
                  style={{ padding: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                >
                  <option value="College of Computer Studies">College of Computer Studies</option>
                  <option value="College of Engineering">College of Engineering</option>
                  <option value="College of Arts & Sciences">College of Arts & Sciences</option>
                  <option value="College of Nursing">College of Nursing</option>
                </select>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setShowProvisionModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (newInstructor.email && newInstructor.firstName) {
                      onProvisionInstructor(newInstructor);
                      setShowProvisionModal(false);
                      setNewInstructor({ firstName: '', lastName: '', email: '', department: 'College of Computer Studies' });
                    }
                  }} 
                  className="btn btn-primary"
                >
                  Provision & Send Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
