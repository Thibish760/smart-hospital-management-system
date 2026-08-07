import { useState, useEffect } from 'react';
import { Search, Star, Calendar, Phone, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { doctorsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Drawer } from '../components/ui/Drawer';
import { formatCurrency, formatDate } from '../lib/utils';
import type { Doctor } from '../types';

export function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selected, setSelected] = useState<Doctor | null>(null);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${doctors.length} physicians on staff`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Search doctors or specialties…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {departments.slice(0, 6).map(s => (
            <button key={s} onClick={() => setDeptFilter(s)}
              className={`px-3.5 py-2 text-sm font-medium rounded-input transition-all ${
                deptFilter === s ? 'bg-primary text-white' : 'bg-white border border-border text-paragraph hover:border-gray-300'
              }`}>
              {s === 'all' ? 'All Departments' : s}
            </button>
          ))}
        </div>
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
              <DoctorCard doctor={doctor} onClick={() => setSelected(doctor)} />
            </motion.div>
          ))}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)}
        title={selected?.name} subtitle={selected?.specialty} width="md">
        {selected && <DoctorDrawerContent doctor={selected} />}
      </Drawer>
    </div>
  );
}

function DoctorCard({ doctor, onClick }: { doctor: Doctor; onClick: () => void }) {
  const statusDot: Record<string, string> = {
    available: 'bg-success', busy: 'bg-warning', 'off-duty': 'bg-muted', 'on-leave': 'bg-danger',
  };
  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer group" onClick={onClick}>
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
        <Badge status={doctor.status} />
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
          <div className="flex items-center justify-center gap-0.5">
            <Star size={12} className="fill-warning text-warning" />
            <p className="text-lg font-bold text-heading">{doctor.rating}</p>
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
          onClick={e => e.stopPropagation()}>
          Book <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

function DoctorDrawerContent({ doctor }: { doctor: Doctor }) {
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
      <button className="btn-primary w-full justify-center">
        <Calendar size={15} />
        Book Appointment
      </button>
    </div>
  );
}
