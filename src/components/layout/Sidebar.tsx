import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, Building2,
  FileText, CreditCard, BarChart3, Bell, Settings, LogOut,
} from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../types';

const allNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'records', label: 'Medical Records', icon: FileText },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['dashboard', 'patients', 'doctors', 'appointments', 'departments', 'records', 'billing', 'reports'],
  doctor: ['dashboard', 'patients', 'appointments', 'records'],
  receptionist: ['dashboard', 'patients', 'doctors', 'appointments', 'billing'],
  patient: ['dashboard', 'appointments', 'records', 'billing', 'doctors'],
};

const bottomItems = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, mobileNavOpen, setMobileNavOpen } = useNav();
  const { userRole } = useAuth();

  const allowedIds = rolePermissions[userRole] || rolePermissions.admin;
  const filteredNavItems = allNavItems.filter(item => allowedIds.includes(item.id));

  const renderNavContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : sidebarCollapsed;
    return (
      <div className="flex flex-col h-full bg-sidebar">
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0 justify-between',
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="MediFlow Logo"
              className="flex-shrink-0"
              style={{ width: 36, height: 36, objectFit: 'contain' }}
            />
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0">
                <p className="text-white font-bold text-base tracking-tight leading-none">MediFlow</p>
                <p className="text-slate-400 text-xs mt-0.5 capitalize font-medium">{userRole} Workspace</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Close Menu"
            >
              <LogOut size={16} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Nav List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (isMobile) setMobileNavOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'sidebar-nav-item w-full text-left',
                  isCollapsed ? 'justify-center px-2' : '',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}

          <div className="h-px bg-sidebar-border my-3 mx-1" />

          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (isMobile) setMobileNavOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'sidebar-nav-item w-full text-left',
                  isCollapsed ? 'justify-center px-2' : '',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <SidebarUser collapsed={isCollapsed} />
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col flex-shrink-0 h-screen bg-sidebar border-r border-sidebar-border overflow-hidden z-20"
        style={{ minWidth: sidebarCollapsed ? 72 : 260 }}
      >
        {renderNavContent(false)}
      </motion.aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-[90] md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="relative w-[280px] max-w-[85vw] h-full bg-sidebar border-r border-sidebar-border z-[91] shadow-2xl flex flex-col"
            >
              {renderNavContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const { user, userRole, signOut } = useAuth();
  const email = user?.email || 'admin@mediflow.com';
  const displayName = user?.displayName || email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  const roleBadgeColor: Record<UserRole, string> = {
    admin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    doctor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    receptionist: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    patient: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  };

  return (
    <div className={cn(
      'flex-shrink-0 border-t border-sidebar-border p-3',
      collapsed ? 'flex justify-center' : ''
    )}>
      {collapsed ? (
        <button
          onClick={signOut}
          title={`Sign out (${userRole})`}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          {initials}
        </button>
      ) : (
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-white text-sm font-semibold truncate capitalize leading-tight" title={displayName}>
                {displayName}
              </p>
              <button
                onClick={signOut}
                title="Sign out"
                className="text-slate-400 hover:text-white hover:bg-sidebar-hover p-1 rounded-md transition-all flex-shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${roleBadgeColor[userRole]}`}>
                {userRole}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] font-mono leading-tight mt-1 break-all" title={email}>
              {email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
