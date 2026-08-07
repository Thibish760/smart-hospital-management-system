import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useNav } from '../../context/NavContext';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

// Pages
import {
  Dashboard,
  Patients,
  Doctors,
  Appointments,
  MedicalRecords,
  Billing,
  Reports,
  Settings,
  Departments,
  NotificationsPage,
} from '../../pages';

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  patients: Patients,
  doctors: Doctors,
  appointments: Appointments,
  departments: Departments,
  records: MedicalRecords,
  billing: Billing,
  reports: Reports,
  notifications: NotificationsPage,
  settings: Settings,
};

const allowedPagesByRole: Record<UserRole, string[]> = {
  admin: ['dashboard', 'patients', 'doctors', 'appointments', 'departments', 'records', 'billing', 'reports', 'notifications', 'settings'],
  doctor: ['dashboard', 'patients', 'appointments', 'records', 'notifications', 'settings'],
  receptionist: ['dashboard', 'patients', 'doctors', 'appointments', 'billing', 'notifications', 'settings'],
  patient: ['dashboard', 'appointments', 'records', 'billing', 'doctors', 'notifications', 'settings'],
};

export function Layout() {
  const { activePage, setActivePage } = useNav();
  const { userRole } = useAuth();

  useEffect(() => {
    const allowed = allowedPagesByRole[userRole] || allowedPagesByRole.admin;
    if (!allowed.includes(activePage)) {
      setActivePage('dashboard');
    }
  }, [userRole, activePage, setActivePage]);

  const PageComponent = PAGE_MAP[activePage] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-container mx-auto px-8 py-8">
            <PageComponent />
          </div>
        </main>
      </div>
    </div>
  );
}
