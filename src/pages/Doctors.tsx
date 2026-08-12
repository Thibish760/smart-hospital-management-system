import { useState, useEffect } from 'react';
import { Search, Star, Calendar, Phone, Mail, ChevronRight, Loader2, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { doctorsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Drawer } from '../components/ui/Drawer';
import { Modal } from '../components/ui/Modal';
import { ScheduleModal } from '../components/ui/ScheduleModal';
import { exportToExcel } from '../lib/exportUtils';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Doctor } from '../types';

export function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [scheduleDoctorId, setScheduleDoctorId] = useState<string | undefined>(undefined);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Doctor | null>(null);

  useEffect(() => {
    const unsub = doctorsService.subscribe((data) => {
      setDoctors(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const departments = ['all', ...Array.from(new Set(doctors.map(d => d.department)))];

  const filtered = doctors.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || d.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleBookDoctor = (docId: string) => {
    setScheduleDoctorId(docId);
    setScheduleOpen(true);
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await doctorsService.delete(id);
      setDeleteConfirm(null);
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    const data = doctors.map(d => ({
      ID: d.id,
      Name: d.name,
      Specialty: d.specialty,
      Department: d.department,
      Qualification: d.qualification,
      Experience: `${d.experience} years`,
      Rating: d.rating,
      'Review Count': d.reviewCount,
      'Consultation Fee (₹)': d.consultationFee,
      Status: d.status,
      Phone: d.phone,
      Email: d.email,
    }));
    exportToExcel('doctors_directory', data);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Doctors Directory</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${doctors.length} specialists registered`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={15} />
            Export Excel
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search doctors, specialties…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 py-2"
            />
          </div>
        </div>
      </div>

      {/* Dept Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider flex-shrink-0 mr-1">Filter:</span>
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize whitespace-nowrap transition-all ${
              deptFilter === dept ? 'bg-primary text-white' : 'bg-white border border-border text-paragraph hover:border-gray-300'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={20} className="animate-spin text-primary" />
          <p className="text-sm text-muted">Loading doctors from Firebase…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((doctor, i) => (
            <motion.div key={doctor.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <DoctorCard
                doctor={doctor}
                onClick={() => setSelected(doctor)}
                onBook={() => handleBookDoctor(doctor.id)}
                onDelete={() => setDeleteConfirm(doctor)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)}
        title={selected?.name} subtitle={selected?.specialty} width="md">
        {selected && (
          <DoctorDrawerContent
            doctor={selected}
            onBook={() => { setSelected(null); handleBookDoctor(selected.id); }}
            onDelete={() => { const doc = selected; setSelected(null); setDeleteConfirm(doc); }}
          />
        )}
      </Drawer>

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        initialDoctorId={scheduleDoctorId}
      />

      {/* Delete Doctor Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Doctor"
        subtitle="Confirm deletion of doctor record"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-input bg-danger text-white hover:bg-danger-dark transition-colors"
              onClick={() => deleteConfirm && handleDeleteDoctor(deleteConfirm.id)}
            >
              Delete Doctor
            </button>
          </>
        }
      >
        <p className="text-sm text-paragraph">
          Are you sure you want to permanently delete <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.specialty})?
        </p>
      </Modal>
    </div>
  );
}

function DoctorCard({ doctor, onClick, onBook, onDelete }: { doctor: Doctor; onClick: () => void; onBook: () => void; onDelete: () => void }) {
  const statusDot: Record<string, string> = {
    available: 'bg-success', busy: 'bg-warning', 'off-duty': 'bg-muted', 'on-leave': 'bg-danger',
  };
  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer group relative" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={doctor.name} size="lg" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusDot[doctor.status] || 'bg-muted'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-heading">{doctor.name}</p>
            <p className="text-xs text-muted mt-0.5">{doctor.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={doctor.status} />
          <button
            className="p-1 text-muted hover:text-danger hover:bg-danger-light rounded-md transition-colors opacity-80 group-hover:opacity-100"
            title="Delete Doctor"
            onClick={e => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="px-3 py-2 bg-background rounded-xl mb-4">
        <p className="text-xs text-muted">Department</p>
        <p className="text-sm font-semibold text-heading mt-0.5">{doctor.department}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-heading">{doctor.experience}y</p>
          <p className="text-xs text-muted">Experience</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-heading">{doctor.patientCount}</p>
          <p className="text-xs text-muted">Patients</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Star size={13} className="fill-warning text-warning" />
            <span className="text-sm font-bold text-heading">{doctor.rating}</span>
          </div>
          <p className="text-xs text-muted">{doctor.reviewCount} reviews</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted">Consultation Fee</p>
          <p className="text-sm font-bold text-heading">{formatCurrency(doctor.consultationFee)}</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          onClick={e => { e.stopPropagation(); onBook(); }}>
          Book <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

function DoctorDrawerContent({ doctor, onBook, onDelete }: { doctor: Doctor; onBook: () => void; onDelete: () => void }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
        <Avatar name={doctor.name} size="xl" />
        <div>
          <p className="font-bold text-heading">{doctor.name}</p>
          <p className="text-sm text-muted">{doctor.qualification}</p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} className={i < Math.floor(doctor.rating) ? 'fill-warning text-warning' : 'text-muted'} />
            ))}
            <span className="text-xs text-muted ml-1">{doctor.rating} ({doctor.reviewCount} reviews)</span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">About</p>
        <p className="text-sm text-paragraph leading-relaxed">{doctor.bio}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Details</p>
        <div className="space-y-2.5">
          {[
            { label: 'Department', value: doctor.department },
            { label: 'Specialty', value: doctor.specialty },
            { label: 'Experience', value: `${doctor.experience} years` },
            { label: 'Joined', value: formatDate(doctor.joinedDate) },
            { label: 'Consultation Fee', value: formatCurrency(doctor.consultationFee) },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4">
              <span className="text-sm text-muted w-36 flex-shrink-0">{label}</span>
              <span className="text-sm font-medium text-heading">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Contact</p>
        <div className="space-y-2">
          <a href={`tel:${doctor.phone}`} className="flex items-center gap-3 p-3 bg-background rounded-xl hover:border hover:border-border transition-all">
            <Phone size={14} className="text-primary" />
            <span className="text-sm font-medium text-heading">{doctor.phone}</span>
          </a>
          <a href={`mailto:${doctor.email}`} className="flex items-center gap-3 p-3 bg-background rounded-xl hover:border hover:border-border transition-all">
            <Mail size={14} className="text-primary" />
            <span className="text-sm font-medium text-heading">{doctor.email}</span>
          </a>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Available Days</p>
        <div className="flex gap-2 flex-wrap">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <span key={day} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
              doctor.availableDays?.includes(day) ? 'bg-primary text-white' : 'bg-background text-muted border border-border'
            }`}>{day}</span>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="px-4 py-2.5 text-sm font-medium rounded-input border border-danger/30 text-danger hover:bg-danger-light transition-colors flex items-center justify-center gap-2 flex-1" onClick={onDelete}>
          <Trash2 size={15} /> Delete Doctor
        </button>
        <button className="btn-primary flex-1 justify-center" onClick={onBook}>
          <Calendar size={15} /> Book Appointment
        </button>
      </div>
    </div>
  );
}
