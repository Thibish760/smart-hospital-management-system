import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Settings, User, LogOut, Building2, Menu, X } from 'lucide-react';
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

// ── Reusable compact mobile popup card ──────────────────────────
function MobilePanel({
  open, onClose, title, badge, children, footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-[150] sm:hidden"
            onClick={onClose}
          />
          {/* Compact floating dialog card on mobile (properly space-gapped and screen adapted) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-x-3 top-16 z-[151] sm:hidden bg-surface rounded-2xl shadow-2xl border border-border flex flex-col max-h-[70vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-heading">{title}</h3>
                {badge}
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={13} />
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>
            {/* Footer */}
            {footer && (
              <div className="px-4 py-2.5 border-t border-border bg-background/50 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TopBar() {
  const { activePage, toggleMobileNav } = useNav();
  const { user, userRole, signOut } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = notificationsService.subscribe(setNotifications);
    return unsub;
  }, []);

  const email = user?.email || 'admin@mediflow.com';
  const displayName = user?.displayName || email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close desktop dropdowns on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    if (notifOpen || profileOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen, profileOpen]);

  // Notification list shared between mobile popup and desktop dropdown
  const notifList = (
    <>
      {notifications.map(n => (
        <div key={n.id} className={cn(
          'flex gap-2.5 px-3.5 py-2.5 border-b border-border-light hover:bg-background transition-colors text-left',
          !n.read && 'bg-primary-50/30'
        )}>
          <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', {
            'bg-danger': n.type === 'danger',
            'bg-warning': n.type === 'warning',
            'bg-success': n.type === 'success',
            'bg-primary': n.type === 'info',
          })} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-heading leading-snug">{n.title}</p>
            <p className="text-[11px] text-paragraph mt-0.5 leading-snug">{n.message}</p>
            <p className="text-[10px] text-muted mt-1">{n.time}</p>
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <p className="text-center py-6 text-xs text-muted">No notifications</p>
      )}
    </>
  );

  return (
    <>
      {/* ─────────────────── TOP BAR ─────────────────── */}
      <header className="h-14 sm:h-16 bg-surface border-b border-border flex items-center px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 flex-shrink-0 relative z-10">

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileNav}
          className="btn-icon md:hidden flex-shrink-0 text-heading !w-8 !h-8 sm:!w-9 sm:!h-9"
          title="Open Navigation"
        >
          <Menu size={18} />
        </button>

        {/* Page Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-heading truncate">
            {pageTitles[activePage] || 'MediFlow'}
          </h1>
        </div>

        {/* Desktop Search */}
        <div className="relative w-64 lg:w-72 hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search patients, doctors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-input text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Mobile Search toggle */}
        <button
          className="btn-icon md:hidden flex-shrink-0 !w-8 !h-8"
          onClick={() => setSearchOpen(v => !v)}
          title="Search"
        >
          <Search size={15} />
        </button>

        {/* Hospital Switcher — desktop only */}
        <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-paragraph bg-background border border-border rounded-input hover:border-gray-300 transition-colors flex-shrink-0">
          <Building2 size={14} className="text-muted" />
          <span className="hidden xl:inline">MediFlow — Main Campus</span>
          <ChevronDown size={13} className="text-muted" />
        </button>

        <div className="flex items-center gap-1">
          {/* Messages — hidden on mobile */}
          <button className="btn-icon relative hidden sm:inline-flex">
            <MessageSquare size={16} />
          </button>

          {/* ── NOTIFICATIONS ── */}
          <div className="relative" ref={notifRef}>
            <button
              className="btn-icon relative !w-8 !h-8 sm:!w-9 sm:!h-9"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-danger rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Desktop dropdown — hidden on mobile */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="hidden sm:block absolute right-0 top-full mt-2 w-80 lg:w-96 bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-heading">Notifications</h3>
                    <span className="badge bg-primary-light text-primary-700 text-xs">{unreadCount} new</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifList}
                  </div>
                  <div className="px-4 py-2.5 border-t border-border">
                    <button className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PROFILE ── */}
          <div className="relative ml-0.5 sm:ml-1" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 pr-1 sm:pr-3 py-1 rounded-btn hover:bg-background border border-transparent hover:border-border transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-heading leading-none capitalize">{displayName}</p>
                <p className="text-xs text-primary font-semibold leading-none mt-1 capitalize">{userRole}</p>
              </div>
              <ChevronDown size={13} className="text-muted hidden md:block" />
            </button>

            {/* Desktop profile dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="hidden sm:block absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-heading capitalize truncate">{displayName}</p>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-light text-primary uppercase flex-shrink-0">{userRole}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5 truncate">{email}</p>
                  </div>
                  <div className="py-1">
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
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-danger hover:bg-danger-light transition-colors">
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ─── Mobile Search Overlay ─── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-surface border-b border-border px-3 py-2.5 z-[9] flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search patients, doctors…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-input text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
            <button
              onClick={() => { setSearchOpen(false); setSearch(''); }}
              className="text-muted hover:text-heading p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Notifications Compact Dialog ─── */}
      <MobilePanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        badge={
          unreadCount > 0
            ? <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-light text-primary rounded-full">{unreadCount} new</span>
            : undefined
        }
        footer={
          <button className="text-xs font-semibold text-primary w-full text-center py-0.5">
            View all notifications
          </button>
        }
      >
        {notifList}
      </MobilePanel>

      {/* ─── Mobile Profile Compact Dialog ─── */}
      <MobilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title={displayName}
        badge={
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary-light text-primary uppercase">{userRole}</span>
        }
      >
        <div className="px-4 py-2 border-b border-border">
          <p className="text-[11px] text-muted truncate">{email}</p>
        </div>
        <div className="py-1">
          {[
            { icon: User, label: 'Profile' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-paragraph hover:bg-background transition-colors">
              <Icon size={14} className="text-muted" />
              {label}
            </button>
          ))}
          <div className="h-px bg-border mx-4 my-1" />
          <button
            onClick={() => { signOut(); setProfileOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-danger hover:bg-danger-light transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </MobilePanel>
    </>
  );
}
