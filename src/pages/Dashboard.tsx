import { useEffect, useState } from 'react';
import { Users, Stethoscope, CalendarDays, IndianRupee, AlertTriangle, BedDouble, Plus, ArrowRight, FileText, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { KpiCard } from '../components/ui/KpiCard';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ScheduleModal } from '../components/ui/ScheduleModal';
import { RevenueChart, DepartmentChart } from '../components/charts/DashboardCharts';
import { kpiSparklines } from '../data/mockData';
import { patientsService, doctorsService, appointmentsService, invoicesService } from '../lib/firebaseService';
import { formatDate, formatCurrency, getCurrentFullDate } from '../lib/utils';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';
import type { Patient, Doctor, Appointment, Invoice } from '../types';

const stagger = { initial: {}, animate: { transition: { staggerChildren: 0.06 } } };
const fadeSlide = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export function Dashboard() {
  const { setActivePage } = useNav();
  const { user, userRole } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    const unsubP = patientsService.subscribe(setPatients);
    const unsubD = doctorsService.subscribe(setDoctors);
    const unsubA = appointmentsService.subscribe(setAppointments);
    const unsubI = invoicesService.subscribe(setInvoices);
    return () => { unsubP(); unsubD(); unsubA(); unsubI(); };
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === todayStr || a.date === '2026-08-05');
  const monthRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const emergencyCount = appointments.filter(a => a.type === 'emergency').length;
  const recentAppointments = appointments.slice(0, 5);
  const recentPatients = patients.slice(0, 4);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
      {/* Page header with Role Badge */}
      <motion.div variants={fadeSlide} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title capitalize">Welcome back, {displayName} 👋</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary-light text-primary uppercase border border-primary/20">
              {userRole}
            </span>
          </div>
          <p className="text-sm text-muted">{getCurrentFullDate()} — MediFlow Main Campus</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {userRole === 'admin' && (
            <>
              <button className="btn-secondary" onClick={() => setScheduleOpen(true)}>
                <CalendarDays size={15} /> Schedule
              </button>
              <button className="btn-primary" onClick={() => setActivePage('patients')}>
                <Plus size={15} /> New Patient
              </button>
            </>
          )}
          {userRole === 'doctor' && (
            <button className="btn-primary" onClick={() => setActivePage('records')}>
              <FileText size={15} /> Add Prescription
            </button>
          )}
          {userRole === 'receptionist' && (
            <>
              <button className="btn-secondary" onClick={() => setActivePage('billing')}>
                <IndianRupee size={15} /> Create Bill
              </button>
              <button className="btn-primary" onClick={() => setScheduleOpen(true)}>
                <Plus size={15} /> Book Appointment
              </button>
            </>
          )}
          {userRole === 'patient' && (
            <button className="btn-primary" onClick={() => setScheduleOpen(true)}>
              <Stethoscope size={15} /> Book Doctor
            </button>
          )}
        </div>
      </motion.div>

      {/* Role-tailored KPI Section */}
      {userRole === 'admin' && (
        <motion.div variants={fadeSlide} className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-5">
          <KpiCard label="Total Patients" value={patients.length || 2614} change={6.2} changeType="increase"
            icon={<Users size={18} />} sparkline={kpiSparklines.patients} />
          <KpiCard label="Active Doctors" value={doctors.filter(d => d.status !== 'on-leave').length || 48} change={4.1} changeType="increase"
            icon={<Stethoscope size={18} />} sparkline={kpiSparklines.appointments} />
          <KpiCard label="Appointments Today" value={todayAppts.length || 84} change={12.3} changeType="increase"
            icon={<CalendarDays size={18} />} sparkline={kpiSparklines.appointments} />
          <KpiCard label="Monthly Revenue" value={monthRevenue || 1850000} change={9.8} changeType="increase"
            icon={<IndianRupee size={18} />} isCurrency sparkline={kpiSparklines.revenue} />
          <KpiCard label="Emergency Cases" value={emergencyCount || 9} change={2.1} changeType="decrease"
            icon={<AlertTriangle size={18} />} sparkline={kpiSparklines.emergency} />
          <KpiCard label="Beds Available" value={72} change={3.4} changeType="decrease"
            icon={<BedDouble size={18} />} sparkline={kpiSparklines.patients} />
        </motion.div>
      )}

      {userRole === 'doctor' && (
        <motion.div variants={fadeSlide} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">My Consultations Today</p>
            <p className="text-3xl font-bold text-heading mt-2">12</p>
            <p className="text-xs text-success-dark font-medium mt-1">↑ 3 pending</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">Assigned Patients</p>
            <p className="text-3xl font-bold text-heading mt-2">142</p>
            <p className="text-xs text-muted mt-1">Active under care</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">Lab Reports Pending</p>
            <p className="text-3xl font-bold text-heading mt-2">5</p>
            <p className="text-xs text-warning-dark font-medium mt-1">Requires review</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">Rating</p>
            <p className="text-3xl font-bold text-heading mt-2">4.9 ★</p>
            <p className="text-xs text-muted mt-1">387 patient reviews</p>
          </div>
        </motion.div>
      )}

      {userRole === 'receptionist' && (
        <motion.div variants={fadeSlide} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">Appointments Today</p>
            <p className="text-3xl font-bold text-heading mt-2">{todayAppts.length || 84}</p>
            <p className="text-xs text-primary font-medium mt-1">Check-ins in progress</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">New Registrations</p>
            <p className="text-3xl font-bold text-heading mt-2">{patients.length || 12}</p>
            <p className="text-xs text-success-dark font-medium mt-1">Registered today</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">Pending Invoices</p>
            <p className="text-3xl font-bold text-heading mt-2">{invoices.filter(i => i.status === 'pending').length}</p>
            <p className="text-xs text-warning-dark font-medium mt-1">Ready for payment</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-muted uppercase">Available Beds</p>
            <p className="text-3xl font-bold text-heading mt-2">72 / 120</p>
            <p className="text-xs text-muted mt-1">General & ICU</p>
          </div>
        </motion.div>
      )}

      {userRole === 'patient' && (
        <motion.div variants={fadeSlide} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card p-6 bg-gradient-to-br from-primary-light to-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center">
                <Heart size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase">Health Status</p>
                <p className="text-lg font-bold text-heading">Good · Active Care</p>
              </div>
            </div>
            <p className="text-xs text-muted mt-2">Primary Doctor: Dr. Rajesh Kumar (Cardiology)</p>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold text-muted uppercase">Next Appointment</p>
            <p className="text-lg font-bold text-heading mt-1">Today at 09:00 AM</p>
            <p className="text-xs text-primary font-medium mt-1">Room C-104 · Dr. Rajesh Kumar</p>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold text-muted uppercase">My Medical Bills</p>
            <p className="text-lg font-bold text-heading mt-1">{formatCurrency(2500)}</p>
            <p className="text-xs text-success-dark font-medium mt-1">Paid via Insurance</p>
          </div>
        </motion.div>
      )}

      {/* Analytics Charts — shown for Admin & Receptionist */}
      {(userRole === 'admin' || userRole === 'receptionist') && (
        <motion.div variants={fadeSlide} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="card p-6 xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Revenue Overview (INR ₹)</h2>
                <p className="text-sm text-muted mt-0.5">Monthly revenue trend — {new Date().getFullYear()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-heading">{formatCurrency(monthRevenue || 1850000)}</span>
                <span className="badge bg-success-light text-success-dark text-xs">+9.8%</span>
              </div>
            </div>
            <RevenueChart />
          </div>
          <div className="card p-6">
            <div className="mb-4">
              <h2 className="section-title">Departments</h2>
              <p className="text-sm text-muted mt-0.5">Patient distribution</p>
            </div>
            <DepartmentChart />
          </div>
        </motion.div>
      )}

      {/* Appointments & Patient Lists */}
      <motion.div variants={fadeSlide} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Appointments Table */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="section-title">Today's Appointments</h2>
              <p className="text-sm text-muted">{appointments.length} total scheduled</p>
            </div>
            <button className="btn-ghost text-xs" onClick={() => setActivePage('appointments')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-border-light">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-background transition-colors">
                <div className="text-center w-14 flex-shrink-0">
                  <p className="text-sm font-bold text-heading">{apt.time}</p>
                  <p className="text-xs text-muted">{apt.duration}min</p>
                </div>
                <div className="w-px h-8 bg-border flex-shrink-0" />
                <Avatar name={apt.patientName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading truncate">{apt.patientName}</p>
                  <p className="text-xs text-muted truncate">{apt.doctorName} · {apt.department}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge status={apt.status} />
                  {apt.room && <span className="text-xs text-muted">{apt.room}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patients / Quick Overview */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="section-title">Patients Directory</h2>
              <p className="text-sm text-muted">{patients.length} registered patients</p>
            </div>
            <button className="btn-ghost text-xs" onClick={() => setActivePage('patients')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-border-light">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-background transition-colors">
                <Avatar name={patient.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading truncate">{patient.name}</p>
                  <p className="text-xs text-muted">{patient.mrn} · {patient.department} · {patient.age}y, {patient.gender}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge status={patient.status} />
                  <p className="text-xs text-muted mt-1">Last: {formatDate(patient.lastVisit)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
