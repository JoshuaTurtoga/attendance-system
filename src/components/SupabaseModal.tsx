import React, { useState } from 'react';
import { Database, X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_CONFIG_HELP } from '../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rapid-overlay-backdrop">
      <div className="rapid-card-modal" style={{ maxWidth: '640px' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Supabase Cloud Database & Storage</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Connection Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isSupabaseConfigured ? 'var(--status-present)' : 'var(--status-late)'
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {isSupabaseConfigured ? 'Cloud Database Connected' : 'Running in Client-Side Offline Mode'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isSupabaseConfigured 
                  ? `Active endpoint: ${SUPABASE_CONFIG_HELP.url}`
                  : 'Currently storing all class records, attendance marks, and grades in fast LocalStorage with instant reactivity.'}
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>How to Connect Live Supabase:</h4>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>
              Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>supabase.com</a>.
            </li>
            <li>
              Go to your project's <strong>SQL Editor</strong> and execute the script in <code style={{ color: '#A5B4FC' }}>src/supabase/schema.sql</code>. It creates all tables and Row-Level Security policies.
            </li>
            <li>
              Copy your Project URL and Anon API Key from <strong>Settings &gt; API</strong>.
            </li>
            <li>
              Create a <code style={{ color: '#A5B4FC' }}>.env.local</code> file in this repository root:
            </li>
          </ol>

          {/* Sample Env Snippet */}
          <div style={{ position: 'relative', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
            <pre style={{
              background: 'var(--bg-elevated)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#F3F4F6',
              overflowX: 'auto'
            }}>
              {envSample}
            </pre>
            <button
              onClick={handleCopyEnv}
              className="btn btn-secondary"
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.7rem'
              }}
            >
              {copied ? <Check size={12} color="var(--status-present)" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Row-Level Security Guaranteed:</strong> The provided schema contains strict PostgreSQL policies blocking Administrators from tampering with grades or roll-calls.
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-primary">
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
