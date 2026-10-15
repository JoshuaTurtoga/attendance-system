import React from 'react';
import { User, UserRole, SystemNotification } from '../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  Repeat, 
  Bell, 
  Database, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onTogglePOV: () => void;
  notifications: SystemNotification[];
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onTogglePOV,
  notifications,
  onOpenSupabaseModal,
  isSupabaseConnected
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isDualRole = currentUser.roles.includes('admin') && currentUser.roles.includes('instructor');

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-box">
          <GraduationCap size={22} />
        </div>
        <div>
          <span style={{ letterSpacing: '-0.03em' }}>Academia</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Track</span>
          <span style={{ 
            fontSize: '0.65rem', 
            background: 'rgba(99, 102, 241, 0.2)', 
            color: '#A5B4FC', 
            padding: '2px 6px', 
            borderRadius: '4px',
            marginLeft: '8px',
            verticalAlign: 'middle',
            border: '1px solid rgba(99, 102, 241, 0.4)'
          }}>
            PHASE 1 WEB
          </span>
        </div>
      </div>

      <div className="nav-controls">
        {/* Supabase Status Button */}
        <button 
          onClick={onOpenSupabaseModal}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
          title="Supabase Cloud Database Status"
        >
          <Database size={14} color={isSupabaseConnected ? 'var(--status-present)' : '#F59E0B'} />
          <span style={{ fontSize: '0.75rem' }}>
            {isSupabaseConnected ? 'Supabase Connected' : 'Local Storage Mode'}
          </span>
        </button>

        {/* Dual-Role POV Toggle Button */}
        {isDualRole && (
          <button 
            onClick={onTogglePOV}
            className="pov-toggle-btn"
            title="Toggle between Instructor Workspace and Administrative Oversight"
          >
            <Repeat size={14} />
            <span>Switch POV: <strong>{currentUser.activeRole === 'instructor' ? 'Go to Admin Dashboard' : 'Go to Instructor Portal'}</strong></span>
          </button>
        )}

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary" 
            style={{ padding: '0.45rem', borderRadius: '50%', position: 'relative' }}
            title="System Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--status-absent)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '45px',
              width: '320px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} updates</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher Dropdown (for instant testing of multiple roles) */}
        <div className="user-profile-badge">
          <img 
            src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
            alt={currentUser.firstName} 
            className="user-avatar-sm"
          />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {currentUser.department || currentUser.program || 'User'}
            </span>
          </div>

          <span className={`role-badge ${currentUser.activeRole}`}>
            {currentUser.activeRole}
          </span>

          {/* Quick Persona Selector */}
          <select 
            value={currentUser.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.2rem 0.4rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              marginLeft: '6px'
            }}
            title="Switch User Account Persona"
          >
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.firstName} ({u.roles.join('+')})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
