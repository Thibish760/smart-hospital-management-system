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
const DEMO_ROLES = [
  {
    role: 'doctor' as UserRole,
    label: 'Doctor',
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
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
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
        if (selectedRole === 'doctor') {
          if (accessCode.trim() !== 'mediflow760') {
            setError("Invalid Doctor Access Code! Please enter the authorized Doctor registration code.");
            setLoading(false);
            return;
          }
        } else if (selectedRole === 'receptionist') {
          if (accessCode.trim() !== 'mediflow123') {
            setError("Invalid Receptionist Access Code! Please enter the authorized Receptionist registration code.");
            setLoading(false);
            return;
          }
        }
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

  return (
    <div className="lp-root">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="lp-left">

        {/* Top: Logo */}
        <header className="lp-header">
          <div className="lp-logo-mark">
            <img
              src="/logo.png"
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
                  {DEMO_ROLES.map(({ role, label, desc, icon: Icon, color }) => {
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

            {/* Access Code verification for Doctor & Receptionist */}
            {mode === 'signup' && selectedRole === 'doctor' && (
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-access-code">Doctor Access Code *</label>
                <div className="lp-input-wrap">
                  <ShieldCheck size={14} className="lp-input-icon text-primary" />
                  <input
                    id="lp-access-code"
                    type={showAccessCode ? 'text' : 'password'}
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value)}
                    placeholder="Enter secret doctor access code"
                    required
                    className="lp-input lp-input--pw font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessCode(v => !v)}
                    className="lp-eye-btn"
                    aria-label={showAccessCode ? 'Hide access code' : 'Show access code'}
                  >
                    {showAccessCode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-muted mt-1">Authorized Doctor verification code required to register</p>
              </div>
            )}

            {mode === 'signup' && selectedRole === 'receptionist' && (
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-access-code">Receptionist Access Code *</label>
                <div className="lp-input-wrap">
                  <ShieldCheck size={14} className="lp-input-icon text-primary" />
                  <input
                    id="lp-access-code"
                    type={showAccessCode ? 'text' : 'password'}
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value)}
                    placeholder="Enter secret receptionist access code"
                    required
                    className="lp-input lp-input--pw font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessCode(v => !v)}
                    className="lp-eye-btn"
                    aria-label={showAccessCode ? 'Hide access code' : 'Show access code'}
                  >
                    {showAccessCode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-muted mt-1">Authorized Receptionist verification code required to register</p>
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
