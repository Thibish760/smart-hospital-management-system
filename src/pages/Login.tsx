import { useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2,
  CheckCircle2, ShieldCheck, Stethoscope, ClipboardList,
  UserCheck, ArrowRight, Building2, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

/* ── Role definitions ── */
const ROLES = [
  {
    role: 'admin' as UserRole,
    label: 'Administrator',
    desc: 'Full system access',
    icon: ShieldCheck,
    color: '#005EB8',
  },
  {
    role: 'doctor' as UserRole,
    label: 'Physician',
    desc: 'Patient & clinical records',
    icon: Stethoscope,
    color: '#0D7A3E',
  },
  {
    role: 'receptionist' as UserRole,
    label: 'Receptionist',
    desc: 'Scheduling & billing',
    icon: ClipboardList,
    color: '#92400E',
  },
  {
    role: 'patient' as UserRole,
    label: 'Patient',
    desc: 'Personal health portal',
    icon: UserCheck,
    color: '#4C1D95',
  },
];

/* ── Stats ── */
const STATS = [
  { label: 'Active Patients', value: '12,400+', icon: UserCheck },
  { label: 'Departments', value: '48', icon: Building2 },
  { label: 'Daily Consultations', value: '680+', icon: Activity },
];

export function Login() {
  const { signIn, signUp, resetPassword, switchRole } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName || email.split('@')[0], selectedRole);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);

  async function handleDemoRoleLogin(role: UserRole) {
    const demoEmail = `${role}@mediflow.com`;
    const demoPassword = 'MediFlow2024!';
    setDemoLoading(role);
    setError('');
    try {
      // Try to sign in first; if the account doesn't exist, create it
      try {
        await signIn(demoEmail, demoPassword);
      } catch {
        await signUp(demoEmail, demoPassword, role.charAt(0).toUpperCase() + role.slice(1), role);
      }
      switchRole(role);
    } catch (err: any) {
      setError(`Demo login failed: ${err.message || 'Please try again.'}`);
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="lp-root">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="lp-left">

        {/* Top: Logo */}
        <header className="lp-header">
          <div className="lp-logo-mark">
            <img
              src="/ChatGPT Image Aug 5, 2026, 10_56_46 AM.png"
              alt="MediFlow Logo"
              className="lp-logo-img"
            />
          </div>
          <div className="lp-logo-text">
            <span className="lp-logo-name">MediFlow</span>
            <span className="lp-logo-tagline">Smart Hospital OS</span>
          </div>
        </header>

        {/* Main: Headline */}
        <main className="lp-main">
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-dot" />
            ISO 27001 · HIPAA Compliant
          </div>

          <h1 className="lp-headline">
            Precision<br />
            Healthcare<br />
            <span className="lp-headline-accent">Management.</span>
          </h1>

          <p className="lp-body">
            A unified clinical platform powering workflows, patient records,
            billing, and operations — built for modern hospitals.
          </p>

          {/* Stats */}
          <div className="lp-stats">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="lp-stat">
                <Icon size={14} className="lp-stat-icon" />
                <span className="lp-stat-value">{value}</span>
                <span className="lp-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </main>

        {/* Bottom: Demo access */}
        <footer className="lp-footer-section">
          <p className="lp-demo-heading">Quick Demo Access</p>
          <div className="lp-demo-list">
            {ROLES.map(({ role, label, icon: Icon, color }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoRoleLogin(role)}
                disabled={demoLoading !== null}
                className="lp-demo-item"
              >
                {demoLoading === role ? (
                  <Loader2 size={13} className="lp-spinner" style={{ color }} />
                ) : (
                  <span className="lp-demo-icon-wrap" style={{ background: `${color}22`, color }}>
                    <Icon size={13} />
                  </span>
                )}
                <span className="lp-demo-label">{label}</span>
                {demoLoading === role ? (
                  <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>Signing in…</span>
                ) : (
                  <ArrowRight size={12} className="lp-demo-arrow" />
                )}
              </button>
            ))}
          </div>

          <p className="lp-version">
            v2.4.0 &nbsp;·&nbsp; 256-bit TLS &nbsp;·&nbsp; JWT Secured
          </p>
        </footer>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="lp-right">
        <motion.div
          className="lp-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >

          {/* Mode tabs */}
          <div className="lp-tabs" role="tablist">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => { setMode(m); setError(''); setResetSent(false); }}
                className={`lp-tab ${mode === m ? 'lp-tab--active' : ''}`}
              >
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="lp-card-header"
            >
              <h2 className="lp-card-title">
                {mode === 'reset' && 'Reset Password'}
                {mode === 'signin' && 'Welcome back'}
                {mode === 'signup' && 'Create account'}
              </h2>
              <p className="lp-card-subtitle">
                {mode === 'reset' && 'Enter your email to receive a reset link.'}
                {mode === 'signin' && 'Sign in to access your hospital dashboard.'}
                {mode === 'signup' && 'Register with your role to get started.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Alerts */}
          {resetSent && (
            <div className="lp-alert lp-alert--success">
              <CheckCircle2 size={14} />
              <span>Reset link sent. Please check your inbox.</span>
            </div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="lp-alert lp-alert--error"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form">

            {/* Full Name — signup only */}
            {mode === 'signup' && (
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-name">Full Name</label>
                <div className="lp-input-wrap">
                  <User size={14} className="lp-input-icon" />
                  <input
                    id="lp-name"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    required
                    className="lp-input"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-email">Email Address</label>
              <div className="lp-input-wrap">
                <Mail size={14} className="lp-input-icon" />
                <input
                  id="lp-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@mediflow.com"
                  required
                  className="lp-input"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'reset' && (
              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label" htmlFor="lp-password">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setError(''); }}
                      className="lp-forgot"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="lp-input-wrap">
                  <Lock size={14} className="lp-input-icon" />
                  <input
                    id="lp-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="lp-input lp-input--pw"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="lp-eye-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Role selector — signup only */}
            {mode === 'signup' && (
              <div className="lp-field">
                <label className="lp-label">Select Role</label>
                <div className="lp-role-grid">
                  {ROLES.map(({ role, label, desc, icon: Icon, color }) => {
                    const active = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`lp-role-btn ${active ? 'lp-role-btn--active' : ''}`}
                        style={active ? {
                          borderColor: color,
                          background: `${color}08`,
                        } : {}}
                      >
                        <span
                          className="lp-role-icon"
                          style={{
                            background: active ? `${color}18` : '#F3F4F6',
                            color: active ? color : '#6B7280',
                          }}
                        >
                          <Icon size={13} />
                        </span>
                        <span>
                          <span className="lp-role-name" style={{ color: active ? color : '#111827' }}>{label}</span>
                          <span className="lp-role-desc">{desc}</span>
                        </span>
                        {active && (
                          <span className="lp-role-check" style={{ background: color }}>
                            <CheckCircle2 size={9} color="#fff" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              id="lp-submit"
              type="submit"
              disabled={loading}
              className="lp-submit"
            >
              {loading ? (
                <><Loader2 size={15} className="lp-spinner" /> Processing…</>
              ) : mode === 'reset' ? (
                <>Send Reset Link <ArrowRight size={14} /></>
              ) : mode === 'signup' ? (
                <>Create Account <ArrowRight size={14} /></>
              ) : (
                <>Sign In <ArrowRight size={14} /></>
              )}
            </button>

            {/* Back link — reset mode */}
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className="lp-back"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Trust row */}
          <div className="lp-trust">
            {['HIPAA Compliant', '256-bit SSL', 'SOC 2 Type II'].map(t => (
              <span key={t} className="lp-trust-item">
                <ShieldCheck size={11} />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <p className="lp-copyright">© 2026 MediFlow Health Systems · All rights reserved</p>
      </div>
    </div>
  );
}
