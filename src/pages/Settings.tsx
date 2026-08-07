import { useState } from 'react';
import { Hospital, Users, Lock, Shield, Database, FileText, Bell, Globe, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Hospital Profile', icon: Hospital, desc: 'General hospital info and branding' },
  { id: 'users', label: 'User Management', icon: Users, desc: 'Manage staff accounts' },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield, desc: 'Access control and permissions' },
  { id: 'security', label: 'Security', icon: Lock, desc: 'Password, 2FA, and sessions' },
  { id: 'backup', label: 'Backup & Data', icon: Database, desc: 'Data export and backup settings' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, desc: 'System activity and access logs' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert preferences and channels' },
  { id: 'integrations', label: 'Integrations', icon: Globe, desc: 'Connected services and APIs' },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your hospital system configuration</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Sidebar Nav */}
        <div className="card p-2">
          <nav className="space-y-0.5">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                  activeSection === id
                    ? 'bg-primary-50 text-primary'
                    : 'text-paragraph hover:bg-background'
                )}
              >
                <Icon size={16} className={activeSection === id ? 'text-primary' : 'text-muted'} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${activeSection === id ? 'text-primary' : 'text-heading'}`}>{label}</p>
                  <p className="text-xs text-muted truncate">{desc}</p>
                </div>
                <ChevronRight size={13} className={activeSection === id ? 'text-primary' : 'text-muted'} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="xl:col-span-3 space-y-5">
          {activeSection === 'profile' && <HospitalProfileSettings />}
          {activeSection === 'users' && <UserManagementSettings />}
          {activeSection === 'roles' && <RolesSettings />}
          {activeSection === 'security' && <SecuritySettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {(activeSection === 'backup' || activeSection === 'audit' || activeSection === 'integrations') && (
            <div className="card p-12 text-center">
              <p className="text-muted text-sm">This section is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-5 pb-4 border-b border-border">
        <h2 className="text-base font-semibold text-heading">{title}</h2>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <div className="w-48 flex-shrink-0">
        <label className="text-sm font-semibold text-heading">{label}</label>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function HospitalProfileSettings() {
  return (
    <SettingsCard title="Hospital Profile" subtitle="Update general information about your hospital">
      <div className="space-y-5">
        <FieldGroup label="Hospital Name" hint="Displayed across the system">
          <input className="input-base" defaultValue="MediFlow Main Campus" />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Tagline" hint="Short description">
          <input className="input-base" defaultValue="Advanced Multi-Specialty Healthcare" />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Address">
          <textarea className="input-base resize-none h-20" defaultValue="1200 Medical Center Drive, Boston, MA 02134" />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Contact Phone">
          <input className="input-base" defaultValue="+1 (617) 555-0100" />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Website">
          <input className="input-base" defaultValue="https://mediflow.health" />
        </FieldGroup>
        <div className="h-px bg-border" />
        <FieldGroup label="Timezone">
          <select className="input-base">
            <option>America/New_York (EST)</option>
            <option>America/Chicago (CST)</option>
            <option>America/Los_Angeles (PST)</option>
          </select>
        </FieldGroup>
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary">Cancel</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </SettingsCard>
  );
}

const STAFF = [
  { name: 'Admin User', email: 'admin@mediflow.com', role: 'Administrator', status: 'active' },
  { name: 'Dr. Sarah Mitchell', email: 's.mitchell@mediflow.com', role: 'Doctor', status: 'active' },
  { name: 'Receptionist A', email: 'reception@mediflow.com', role: 'Receptionist', status: 'active' },
  { name: 'Billing Team', email: 'billing@mediflow.com', role: 'Billing', status: 'inactive' },
];

function UserManagementSettings() {
  return (
    <SettingsCard title="User Management" subtitle="Manage staff access to MediFlow">
      <div className="space-y-3">
        <div className="flex justify-end">
          <button className="btn-primary py-2 text-sm">+ Invite User</button>
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
              {STAFF.map(user => (
                <tr key={user.email} className="hover:bg-background/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-heading">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-paragraph">{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-border-light text-muted'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsCard>
  );
}

const ROLES = [
  { name: 'Administrator', users: 1, perms: 'Full access', color: 'bg-primary text-white' },
  { name: 'Doctor', users: 8, perms: 'Patients, Records, Appointments', color: 'bg-success-light text-success-dark' },
  { name: 'Nurse', users: 12, perms: 'Patients, Records', color: 'bg-info-light text-info-dark' },
  { name: 'Receptionist', users: 4, perms: 'Appointments, Patients (read)', color: 'bg-amber-50 text-amber-700' },
  { name: 'Billing', users: 2, perms: 'Billing, Reports', color: 'bg-violet-50 text-violet-700' },
];

function RolesSettings() {
  return (
    <SettingsCard title="Roles & Permissions" subtitle="Control what each role can access">
      <div className="space-y-3">
        {ROLES.map(role => (
          <div key={role.name} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-background transition-colors">
            <div className="flex items-center gap-3">
              <span className={`badge ${role.color}`}>{role.name}</span>
              <div>
                <p className="text-sm font-medium text-heading">{role.users} user{role.users !== 1 ? 's' : ''}</p>
                <p className="text-xs text-muted">{role.perms}</p>
              </div>
            </div>
            <button className="btn-secondary py-1.5 text-xs">Configure</button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

function SecuritySettings() {
  return (
    <SettingsCard title="Security Settings" subtitle="Manage authentication and session security">
      <div className="space-y-5">
        {[
          { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin logins', enabled: true },
          { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', enabled: true },
          { label: 'IP Allowlist', desc: 'Restrict access to specific IP ranges', enabled: false },
          { label: 'Audit Log Retention', desc: 'Keep logs for 12 months', enabled: true },
        ].map(({ label, desc, enabled }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-semibold text-heading">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
            <div
              className={`relative w-10 h-5.5 rounded-full cursor-pointer transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}
              style={{ height: '22px' }}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-danger py-2 text-sm">Revoke All Sessions</button>
          <button className="btn-primary">Save</button>
        </div>
      </div>
    </SettingsCard>
  );
}

function NotificationSettings() {
  return (
    <SettingsCard title="Notification Preferences" subtitle="Choose how and when you receive alerts">
      <div className="space-y-4">
        {[
          { label: 'Emergency Alerts', desc: 'Critical patient and ER alerts', email: true, push: true, sms: true },
          { label: 'Appointment Reminders', desc: 'Upcoming appointment notifications', email: true, push: true, sms: false },
          { label: 'Billing Updates', desc: 'Invoice and payment notifications', email: true, push: false, sms: false },
          { label: 'Lab Results', desc: 'When lab results are ready', email: true, push: true, sms: false },
          { label: 'System Updates', desc: 'Maintenance and system announcements', email: false, push: false, sms: false },
        ].map(({ label, desc, email, push, sms }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-semibold text-heading">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ key: 'email', val: email }, { key: 'push', val: push }, { key: 'sms', val: sms }].map(({ key, val }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked={val} className="w-3.5 h-3.5 accent-primary" />
                  <span className="text-xs text-muted capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button className="btn-primary">Save Preferences</button>
        </div>
      </div>
    </SettingsCard>
  );
}
