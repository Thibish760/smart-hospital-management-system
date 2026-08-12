import { useState } from 'react';
import { Hospital, Users, Lock, Shield, Database, FileText, Bell, Globe, ChevronRight, CheckCircle2, Download, Plus, Trash2, Loader2, Check, X, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { exportToExcel } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import { adminRequestsService } from '../lib/firebaseService';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Hospital Profile', icon: Hospital, desc: 'General hospital info and branding' },
  { id: 'users', label: 'User Management', icon: Users, desc: 'Manage staff accounts and invitations' },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield, desc: 'Access control and role permissions' },
  { id: 'security', label: 'Security & Auth', icon: Lock, desc: 'Password, 2FA, and active sessions' },
  { id: 'backup', label: 'Backup & Data', icon: Database, desc: 'Data export and automated backup' },
  { id: 'audit', label: 'System Audit Logs', icon: FileText, desc: 'System activity and access logs' },
  { id: 'notifications', label: 'Notification Alerts', icon: Bell, desc: 'Alert preferences and notification channels' },
  { id: 'integrations', label: 'Integrations & APIs', icon: Globe, desc: 'Connected EHR/PACS and API keys' },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings & Configuration</h1>
          <p className="text-sm text-muted mt-1">Manage your hospital system setup, security, and integrations</p>
        </div>
        {toastMessage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-success-light text-success-dark rounded-xl text-sm font-semibold border border-success/20 animate-fade-in">
            <CheckCircle2 size={16} />
            {toastMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Sidebar Nav */}
        <div className="card p-2 h-fit">
          <nav className="space-y-0.5">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                  activeSection === id
                    ? 'bg-primary-50 text-primary font-semibold'
                    : 'text-paragraph hover:bg-background'
                )}
              >
                <Icon size={16} className={activeSection === id ? 'text-primary' : 'text-muted'} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${activeSection === id ? 'text-primary font-bold' : 'font-medium text-heading'}`}>{label}</p>
                  <p className="text-xs text-muted truncate">{desc}</p>
                </div>
                <ChevronRight size={13} className={activeSection === id ? 'text-primary' : 'text-muted'} />
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-5">
          {activeSection === 'profile' && <HospitalProfileSettings showToast={showToast} />}
          {activeSection === 'users' && <UserManagementSettings showToast={showToast} />}
          {activeSection === 'roles' && <RolesSettings showToast={showToast} />}
          {activeSection === 'security' && <SecuritySettings showToast={showToast} />}
          {activeSection === 'backup' && <BackupSettings showToast={showToast} />}
          {activeSection === 'audit' && <AuditLogSettings />}
          {activeSection === 'notifications' && <NotificationSettings showToast={showToast} />}
          {activeSection === 'integrations' && <IntegrationsSettings showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-5 pb-4 border-b border-border">
        <h2 className="text-base font-bold text-heading">{title}</h2>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
      <div className="w-48 flex-shrink-0">
        <label className="text-sm font-semibold text-heading">{label}</label>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}

// ─── SECTION 1: Hospital Profile ─────────────────────────────────────────────
function HospitalProfileSettings({ showToast }: { showToast: (msg: string) => void }) {
  const [profile, setProfile] = useState({
    name: 'MediFlow Main Campus',
    tagline: 'Advanced Multi-Specialty Healthcare & Research Institute',
    address: '1200 Medical Center Drive, Boston, MA 02134',
    phone: '+1 (617) 555-0100',
    website: 'https://mediflow.health',
    timezone: 'America/New_York (EST)',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Hospital profile updated successfully!');
    }, 300);
  };

  return (
    <SettingsCard title="Hospital Profile" subtitle="Update general information and branding for your hospital">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup label="Hospital Name" hint="Displayed on invoices and reports">
          <input
            className="input-base"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Tagline" hint="Hospital motto or description">
          <input
            className="input-base"
            value={profile.tagline}
            onChange={e => setProfile({ ...profile, tagline: e.target.value })}
          />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Address" hint="Physical facility location">
          <textarea
            className="input-base resize-none h-20"
            value={profile.address}
            onChange={e => setProfile({ ...profile, address: e.target.value })}
          />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Contact Phone">
          <input
            className="input-base"
            value={profile.phone}
            onChange={e => setProfile({ ...profile, phone: e.target.value })}
          />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Website URL">
          <input
            className="input-base"
            value={profile.website}
            onChange={e => setProfile({ ...profile, website: e.target.value })}
          />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="System Timezone">
          <select
            className="input-base"
            value={profile.timezone}
            onChange={e => setProfile({ ...profile, timezone: e.target.value })}
          >
            <option>America/New_York (EST)</option>
            <option>America/Chicago (CST)</option>
            <option>America/Los_Angeles (PST)</option>
            <option>Asia/Kolkata (IST)</option>
          </select>
        </FieldGroup>
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <button className="btn-secondary" type="button" onClick={() => showToast('Changes reset')}>
            Reset
          </button>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}

// ─── SECTION 2: User Management ──────────────────────────────────────────────
const INITIAL_STAFF = [
  { id: '1', name: 'Thibish760 Admin', email: 'thibish760@gmail.com', role: 'Administrator', status: 'active' },
  { id: '2', name: 'Dr. Sarah Mitchell', email: 's.mitchell@mediflow.com', role: 'Doctor', status: 'active' },
  { id: '3', name: 'Receptionist Desk', email: 'reception@mediflow.com', role: 'Receptionist', status: 'active' },
  { id: '4', name: 'Billing Desk', email: 'billing@mediflow.com', role: 'Billing', status: 'active' },
];

function UserManagementSettings({ showToast }: { showToast: (msg: string) => void }) {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Doctor' });
  const [requests, setRequests] = useState(() => adminRequestsService.getRequests());

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    setStaff([
      ...staff,
      { id: Date.now().toString(), name: form.name.trim(), email: form.email.trim(), role: form.role, status: 'active' },
    ]);
    setInviteOpen(false);
    setForm({ name: '', email: '', role: 'Doctor' });
    showToast(`Invitation sent to ${form.email}!`);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    showToast('Staff member removed.');
  };

  const handleApproveAdminRequest = (id: string, email: string) => {
    adminRequestsService.approveRequest(id);
    setRequests(adminRequestsService.getRequests());
    showToast(`Admin Panel access APPROVED for ${email}!`);
  };

  const handleRejectAdminRequest = (id: string, email: string) => {
    adminRequestsService.rejectRequest(id);
    setRequests(adminRequestsService.getRequests());
    showToast(`Admin Panel request REJECTED for ${email}.`);
  };

  return (
    <div className="space-y-6">
      {/* Primary Admin Notice */}
      <div className="p-4 bg-primary-light/40 border border-primary/20 rounded-xl flex items-start gap-3">
        <ShieldCheck className="text-primary flex-shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Master Admin Credentials</h4>
          <p className="text-xs text-muted mt-0.5">
            Primary Admin Access: <strong className="text-heading font-semibold">admin760@gmail.com</strong> (Password: <code className="bg-background px-1.5 py-0.5 rounded text-primary font-mono font-bold">admin@123</code>). All other users require explicit approval below to access the Admin Panel.
          </p>
        </div>
      </div>

      {/* Admin Access Requests Queue */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-heading">Admin Panel Access Requests</h3>
            <p className="text-xs text-muted mt-0.5">Approve or reject pending requests from staff requesting Admin privileges</p>
          </div>
          <span className="badge bg-amber-50 text-amber-700 text-xs font-bold">
            {requests.filter(r => r.status === 'pending').length} Pending
          </span>
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-4 py-2.5 table-header">Applicant</th>
                <th className="text-left px-4 py-2.5 table-header">Date</th>
                <th className="text-left px-4 py-2.5 table-header">Status</th>
                <th className="text-left px-4 py-2.5 table-header">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-xs">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">No admin access requests submitted yet</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-heading">{req.name}</p>
                      <p className="text-muted">{req.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted font-medium">{req.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 font-bold rounded-full capitalize ${
                        req.status === 'approved' ? 'bg-success-light text-success-dark' :
                        req.status === 'rejected' ? 'bg-danger-light text-danger-dark' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveAdminRequest(req.id, req.email)}
                            className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1 bg-success hover:bg-success-dark text-white"
                          >
                            <Check size={12} /> Approve Admin
                          </button>
                          <button
                            onClick={() => handleRejectAdminRequest(req.id, req.email)}
                            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 text-danger border-danger/30 hover:bg-danger-light"
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SettingsCard title="User Management" subtitle="Manage hospital staff accounts and access permissions">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{staff.length} Active Staff Members</p>
            <button className="btn-primary py-2 text-sm" onClick={() => setInviteOpen(true)}>
              <Plus size={15} /> Invite Staff
            </button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left px-4 py-3 table-header">Name</th>
                  <th className="text-left px-4 py-3 table-header hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 table-header">Status</th>
                  <th className="text-left px-4 py-3 table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {staff.map(user => (
                  <tr key={user.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-heading">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm font-medium text-paragraph">{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-muted/20 text-muted'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="p-1 text-muted hover:text-danger rounded-md transition-colors"
                        title="Remove Staff"
                        onClick={() => handleDeleteStaff(user.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SettingsCard>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Staff Member" size="md">
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Full Name *</label>
            <input
              className="input-base"
              required
              placeholder="e.g. Dr. Alexander Fleming"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Email Address *</label>
            <input
              type="email"
              className="input-base"
              required
              placeholder="doctor@mediflow.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Assigned Role</label>
            <select className="input-base" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option>Doctor</option>
              <option>Administrator</option>
              <option>Receptionist</option>
              <option>Nurse</option>
              <option>Billing</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button className="btn-secondary" type="button" onClick={() => setInviteOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit">Send Invitation</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── SECTION 3: Roles & Permissions ─────────────────────────────────────────
function RolesSettings({ showToast }: { showToast: (msg: string) => void }) {
  const [roles] = useState([
    { name: 'Administrator', users: 1, perms: 'Full access to all modules and configurations', enabled: true },
    { name: 'Doctor', users: 8, perms: 'Manage Patients, Medical Records, Appointments', enabled: true },
    { name: 'Receptionist', users: 4, perms: 'Book Appointments, Patient Registration, Billing', enabled: true },
    { name: 'Nurse', users: 12, perms: 'Patient Vitals, Medical History (Read)', enabled: true },
    { name: 'Billing Specialist', users: 2, perms: 'Invoices, Payments, Billing Reports', enabled: true },
  ]);

  return (
    <SettingsCard title="Roles & Permissions" subtitle="Configure granular access control per hospital role">
      <div className="space-y-3">
        {roles.map(role => (
          <div key={role.name} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-background transition-colors">
            <div>
              <p className="text-sm font-bold text-heading">{role.name}</p>
              <p className="text-xs text-muted mt-0.5">{role.perms} · {role.users} assigned users</p>
            </div>
            <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => showToast(`Configuring permissions for ${role.name}`)}>
              Configure Permissions
            </button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

// ─── SECTION 4: Security ──────────────────────────────────────────────────────
function SecuritySettings({ showToast }: { showToast: (msg: string) => void }) {
  const [securityOpts, setSecurityOpts] = useState([
    { id: '2fa', label: 'Two-Factor Authentication (2FA)', desc: 'Require 2FA code for all administrator logins', enabled: true },
    { id: 'timeout', label: 'Automatic Session Timeout', desc: 'Auto-logout users after 30 minutes of inactivity', enabled: true },
    { id: 'ip', label: 'IP Address Allowlist', desc: 'Restrict admin panel access to hospital network IPs', enabled: false },
    { id: 'audit', label: 'Audit Log Retention', desc: 'Retain system audit logs for 12 months for HIPAA compliance', enabled: true },
  ]);

  const toggleOption = (id: string) => {
    setSecurityOpts(prev => prev.map(opt => opt.id === id ? { ...opt, enabled: !opt.enabled } : opt));
    showToast('Security policy updated.');
  };

  return (
    <SettingsCard title="Security & Authentication" subtitle="Manage authentication security, session timeouts, and HIPAA compliance">
      <div className="space-y-5">
        {securityOpts.map(({ id, label, desc, enabled }) => (
          <div key={id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-semibold text-heading">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggleOption(id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <button className="px-4 py-2 text-sm font-medium rounded-input border border-danger/30 text-danger hover:bg-danger-light transition-colors" onClick={() => showToast('All active sessions revoked!')}>
            Revoke All Sessions
          </button>
          <button className="btn-primary" onClick={() => showToast('Security settings saved!')}>Save Security Policy</button>
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── SECTION 5: Backup & Data ────────────────────────────────────────────────
function BackupSettings({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <SettingsCard title="Backup & Data Management" subtitle="Export data and configure automated database backups">
      <div className="space-y-5">
        <div className="p-4 border border-border rounded-xl bg-background flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-heading">Export Complete System Database</p>
            <p className="text-xs text-muted mt-0.5">Download JSON/CSV dump of all patients, doctors, records, and invoices</p>
          </div>
          <button className="btn-secondary" onClick={() => { exportToExcel('mediflow_full_backup', [{ system: 'MediFlow OS', timestamp: new Date().toISOString() }]); showToast('Database backup downloaded!'); }}>
            <Download size={15} /> Export Backup
          </button>
        </div>

        <div className="p-4 border border-border rounded-xl bg-background flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-heading">Automated Daily Backups</p>
            <p className="text-xs text-muted mt-0.5">Scheduled nightly backup at 02:00 AM EST to secure cloud storage</p>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-success-light text-success-dark">Active</span>
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── SECTION 6: System Audit Logs ───────────────────────────────────────────
const AUDIT_LOGS = [
  { id: '1', user: 'Thibish760 (Admin)', action: 'Exported Patients CSV Directory', ip: '192.168.1.45', time: '10 mins ago' },
  { id: '2', user: 'Dr. Sarah Mitchell', action: 'Created Prescription for Eleanor Whitfield', ip: '192.168.1.12', time: '42 mins ago' },
  { id: '3', user: 'Receptionist Desk', action: 'Scheduled Appointment with Dr. James Hawkins', ip: '192.168.1.88', time: '2 hours ago' },
  { id: '4', user: 'System Auto-Backup', action: 'Nightly Database Backup Completed', ip: 'Localhost', time: '8 hours ago' },
];

function AuditLogSettings() {
  return (
    <SettingsCard title="System Audit Logs" subtitle="Live activity trail for security and HIPAA compliance">
      <div className="space-y-3">
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-4 py-3 table-header">User</th>
                <th className="text-left px-4 py-3 table-header">Action / Event</th>
                <th className="text-left px-4 py-3 table-header hidden md:table-cell">IP Address</th>
                <th className="text-left px-4 py-3 table-header">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {AUDIT_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-background/60 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-heading">{log.user}</td>
                  <td className="px-4 py-3 text-sm text-paragraph">{log.action}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted hidden md:table-cell">{log.ip}</td>
                  <td className="px-4 py-3 text-xs text-muted">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── SECTION 7: Notification Channels ───────────────────────────────────────
function NotificationSettings({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <SettingsCard title="Notification Preferences" subtitle="Choose notification channels for system alerts">
      <div className="space-y-4">
        {[
          { label: 'Emergency Alerts', desc: 'Critical ER patient status & emergency codes', email: true, push: true, sms: true },
          { label: 'Appointment Reminders', desc: 'Upcoming scheduled patient consultations', email: true, push: true, sms: false },
          { label: 'Billing Updates', desc: 'New invoice generation and payment logs', email: true, push: false, sms: false },
          { label: 'Lab Results', desc: 'When diagnostic lab reports are ready', email: true, push: true, sms: false },
        ].map(({ label, desc, email, push, sms }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-semibold text-heading">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ key: 'email', val: email }, { key: 'push', val: push }, { key: 'sms', val: sms }].map(({ key, val }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked={val} className="w-3.5 h-3.5 accent-primary" onChange={() => showToast('Preference updated')} />
                  <span className="text-xs text-muted capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-3 border-t border-border">
          <button className="btn-primary" onClick={() => showToast('Notification preferences saved!')}>Save Preferences</button>
        </div>
      </div>
    </SettingsCard>
  );
}

// ─── SECTION 8: Integrations & APIs ─────────────────────────────────────────
function IntegrationsSettings({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <SettingsCard title="Integrations & API Gateways" subtitle="Connect external health systems, EHR, PACS, and payment gateways">
      <div className="space-y-4">
        {[
          { name: 'HL7 / FHIR Health API', desc: 'Interoperability standard for EHR data exchange', active: true },
          { name: 'PACS Medical Imaging System', desc: 'DICOM imaging and MRI scan server integration', active: true },
          { name: 'Stripe & Payment Gateway', desc: 'Online patient billing payment processing', active: true },
          { name: 'Twilio SMS Gateway', desc: 'Patient SMS appointment reminder delivery', active: false },
        ].map(({ name, desc, active }) => (
          <div key={name} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-background transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-heading">{name}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </div>
            </div>
            <button className="btn-secondary text-xs py-1.5" onClick={() => showToast(`Configured ${name}`)}>
              {active ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
