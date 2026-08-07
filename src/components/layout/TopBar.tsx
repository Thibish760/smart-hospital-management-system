import { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Settings, User, LogOut, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNav } from '../../context/NavContext';
import { useAuth } from '../../context/AuthContext';
import { notificationsService } from '../../lib/firebaseService';
import { cn } from '../../lib/utils';
import type { Notification } from '../../types';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  doctors: 'Doctors',
  appointments: 'Appointments',
  departments: 'Departments',
  records: 'Medical Records',
  billing: 'Billing & Invoices',
  reports: 'Reports & Analytics',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function TopBar() {
  const { activePage } = useNav();
  const { user, userRole, switchRole, signOut } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsub = notificationsService.subscribe(setNotifications);
    return unsub;
  }, []);

  const email = user?.email || 'admin@mediflow.com';
  const displayName = user?.displayName || email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-8 gap-4 flex-shrink-0 relative z-10">
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-heading truncate">{pageTitles[activePage] || 'MediFlow'}</h1>
      </div>

      {/* Search */}
      <div className="relative w-72 hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search patients, doctors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-input text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
        {search && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted bg-border-light px-1.5 py-0.5 rounded font-medium">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Hospital Switcher */}
      <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-paragraph bg-background border border-border rounded-input hover:border-gray-300 transition-colors">
        <Building2 size={14} className="text-muted" />
        <span>MediFlow — Main Campus</span>
        <ChevronDown size={13} className="text-muted" />
      </button>

      <div className="flex items-center gap-1">
        {/* Messages */}
        <button className="btn-icon relative">
          <MessageSquare size={16} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="btn-icon relative"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-96 bg-surface rounded-modal border border-border shadow-modal overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-heading">Notifications</h3>
                  <span className="badge bg-primary-light text-primary-700">{unreadCount} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={cn(
                      'flex gap-3 px-5 py-3.5 border-b border-border-light hover:bg-background transition-colors',
                      !n.read && 'bg-primary-50/30'
                    )}>
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', {
                        'bg-danger': n.type === 'danger',
                        'bg-warning': n.type === 'warning',
                        'bg-success': n.type === 'success',
                        'bg-primary': n.type === 'info',
                      })} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-heading">{n.title}</p>
                        <p className="text-xs text-paragraph mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <button className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-btn hover:bg-background border border-transparent hover:border-border transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-heading leading-none capitalize">{displayName}</p>
              <p className="text-xs text-primary font-semibold leading-none mt-1 capitalize">{userRole}</p>
            </div>
            <ChevronDown size={13} className="text-muted hidden md:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-60 bg-surface rounded-modal border border-border shadow-modal overflow-hidden z-30"
              >
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-heading capitalize">{displayName}</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-light text-primary uppercase">{userRole}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">{email}</p>
                </div>

                <div className="p-2 border-b border-border">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider px-2 mb-1">Switch Role (Testing)</p>
                  <div className="grid grid-cols-2 gap-1">
                    {(['admin', 'doctor', 'receptionist', 'patient'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => { switchRole(r); setProfileOpen(false); }}
                        className={`px-2 py-1 text-xs font-semibold rounded capitalize text-left transition-colors ${
                          userRole === r ? 'bg-primary text-white' : 'text-paragraph hover:bg-background'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { icon: User, label: 'Profile' },
                  { icon: Settings, label: 'Settings' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-paragraph hover:bg-background transition-colors">
                    <Icon size={15} className="text-muted" />
                    {label}
                  </button>
                ))}
                <div className="h-px bg-border mx-4 my-1" />
                <button
                  onClick={() => { signOut(); setProfileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors">
                  <LogOut size={15} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop */}
      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setNotifOpen(false); setProfileOpen(false); }} />
      )}
    </header>
  );
}
