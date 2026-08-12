import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Loader2, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { appointmentsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { ScheduleModal } from '../components/ui/ScheduleModal';
import { exportToExcel } from '../lib/exportUtils';
import { formatCurrency, capitalizeStatus, getCurrentDateShort } from '../lib/utils';
import type { Appointment, AppointmentStatus } from '../types';

type ViewMode = 'timeline' | 'week' | 'list';
const STATUSES: (AppointmentStatus | 'all')[] = ['all', 'pending', 'in-progress', 'completed', 'cancelled', 'rescheduled'];
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'border-l-warning bg-warning-light',
  completed: 'border-l-success bg-success-light/30',
  cancelled: 'border-l-danger bg-danger-light/30',
  rescheduled: 'border-l-info bg-info-light/30',
  'in-progress': 'border-l-primary bg-primary-light/30',
};
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function getWeekDays(): string[] {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);

  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
  }
  return days;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null);

  useEffect(() => {
    const unsub = appointmentsService.subscribe((data) => {
      setAppointments(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleExport = () => {
    const data = appointments.map(a => ({
      ID: a.id,
      'Patient Name': a.patientName,
      'Doctor Name': a.doctorName,
      Department: a.department,
      Date: a.date,
      Time: a.time,
      Type: a.type,
      Room: a.room || 'N/A',
      Status: a.status,
      'Fee (₹)': a.fee,
      Notes: a.notes || '',
    }));
    exportToExcel('appointments_export', data);
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await appointmentsService.delete(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = statusFilter === 'all' ? appointments : appointments.filter(a => a.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${appointments.length} total appointments`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={15} />
            Export Excel
          </button>
          <div className="flex bg-background border border-border rounded-input p-0.5">
            {(['list', 'timeline', 'week'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${
                  view === v ? 'bg-white text-heading shadow-card' : 'text-muted hover:text-heading'
                }`}>{v}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setScheduleOpen(true)}><Plus size={15} />Schedule</button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all ${
              statusFilter === s ? 'bg-primary text-white' : 'bg-white border border-border text-paragraph hover:border-gray-300'
            }`}>
            {s === 'all' ? 'All' : capitalizeStatus(s)}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {appointments.filter(a => a.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={20} className="animate-spin text-primary" />
          <p className="text-sm text-muted">Loading appointments from Firebase…</p>
        </div>
      ) : (
        <>
          {/* List View */}
          {view === 'list' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                  <thead>
                    <tr className="border-b border-border bg-background/60">
                      <th className="text-left px-6 py-3.5 table-header">Patient</th>
                      <th className="text-left px-4 py-3.5 table-header">Doctor</th>
                      <th className="text-left px-4 py-3.5 table-header hidden md:table-cell">Date & Time</th>
                      <th className="text-left px-4 py-3.5 table-header hidden lg:table-cell">Type</th>
                      <th className="text-left px-4 py-3.5 table-header hidden lg:table-cell">Room</th>
                      <th className="text-left px-4 py-3.5 table-header">Status</th>
                      <th className="text-left px-4 py-3.5 table-header hidden xl:table-cell">Fee</th>
                      <th className="text-left px-4 py-3.5 table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {filtered.map((apt, i) => (
                      <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }} className="hover:bg-background/60 transition-colors group">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Avatar name={apt.patientName} size="sm" />
                            <p className="text-sm font-semibold text-heading truncate">{apt.patientName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-paragraph truncate max-w-[100px] sm:max-w-none">{apt.doctorName}</p>
                          <p className="text-xs text-muted">{apt.department}</p>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-sm font-medium text-heading">{apt.date}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-muted" />
                            <p className="text-xs text-muted">{apt.time} · {apt.duration}min</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="capitalize text-sm text-paragraph">{apt.type}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {apt.room ? <div className="flex items-center gap-1"><MapPin size={11} className="text-muted" /><span className="text-sm text-muted">{apt.room}</span></div> : '—'}
                        </td>
                        <td className="px-4 py-4"><Badge status={apt.status} /></td>
                        <td className="px-4 py-4 hidden xl:table-cell">
                          <span className="text-sm font-semibold text-heading">{formatCurrency(apt.fee)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                            title="Cancel / Delete Appointment"
                            onClick={() => setDeleteConfirm(apt)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-sm text-muted">No appointments found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline View */}
          {view === 'timeline' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Today — {getCurrentDateShort()}</h2>
                <div className="flex items-center gap-2">
                  <button className="btn-icon"><ChevronLeft size={14} /></button>
                  <button className="btn-icon"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="space-y-2">
                {HOURS.map(hour => {
                  const hourAppts = appointments.filter(a => a.time?.startsWith(hour.split(':')[0]));
                  return (
                    <div key={hour} className="flex gap-4 min-h-[52px]">
                      <div className="w-14 text-right flex-shrink-0 pt-1">
                        <span className="text-xs font-medium text-muted">{hour}</span>
                      </div>
                      <div className="w-px bg-border-light flex-shrink-0" />
                      <div className="flex-1 flex gap-2 pb-2">
                        {hourAppts.length > 0 ? hourAppts.map(apt => (
                          <div key={apt.id} className={`flex-1 max-w-xs p-3 rounded-xl border-l-4 ${STATUS_COLORS[apt.status]}`}>
                            <p className="text-sm font-semibold text-heading truncate">{apt.patientName}</p>
                            <p className="text-xs text-muted">{apt.doctorName} · {apt.room || apt.department}</p>
                            <Badge status={apt.status} className="mt-1.5" />
                          </div>
                        )) : (
                          <div className="flex-1 border-b border-dashed border-border-light" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {view === 'week' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Week of {getCurrentDateShort()}</h2>
                <div className="flex items-center gap-2">
                  <button className="btn-icon"><ChevronLeft size={14} /></button>
                  <button className="btn-icon"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {getWeekDays().map((day, di) => {
                  const dayAppts = appointments.filter((_, i) => i % 5 === di).slice(0, 3);
                  return (
                    <div key={day} className={`rounded-xl border p-3 ${di === 0 ? 'border-primary bg-primary-50' : 'border-border'}`}>
                      <p className={`text-xs font-bold mb-3 ${di === 0 ? 'text-primary' : 'text-muted'}`}>{day}</p>
                      <div className="space-y-2">
                        {dayAppts.map(apt => (
                          <div key={apt.id} className={`p-2 rounded-lg border-l-2 ${STATUS_COLORS[apt.status]} text-xs`}>
                            <p className="font-semibold text-heading truncate">{apt.time}</p>
                            <p className="text-muted truncate">{apt.patientName}</p>
                          </div>
                        ))}
                        {dayAppts.length === 0 && <p className="text-xs text-muted text-center py-4">No appointments</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', s: 'pending', color: 'text-warning-dark' },
          { label: 'In Progress', s: 'in-progress', color: 'text-primary' },
          { label: 'Completed', s: 'completed', color: 'text-success-dark' },
          { label: 'Cancelled', s: 'cancelled', color: 'text-danger' },
        ].map(({ label, s, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>
              {appointments.filter(a => a.status === s).length}
            </p>
          </div>
        ))}
      </div>

      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />

      {/* Delete Appointment Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete / Cancel Appointment"
        subtitle="Confirm deletion of appointment record"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-input bg-danger text-white hover:bg-danger-dark transition-colors"
              onClick={() => deleteConfirm && handleDeleteAppointment(deleteConfirm.id)}
            >
              Delete Appointment
            </button>
          </>
        }
      >
        <p className="text-sm text-paragraph">
          Are you sure you want to permanently delete appointment for <strong>{deleteConfirm?.patientName}</strong> with <strong>{deleteConfirm?.doctorName}</strong> on {deleteConfirm?.date}?
        </p>
      </Modal>
    </div>
  );
}
