import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus, Download, ChevronLeft, ChevronRight, Eye, Phone, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { patientsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Drawer } from '../components/ui/Drawer';
import { Modal } from '../components/ui/Modal';
import { ScheduleModal } from '../components/ui/ScheduleModal';
import { exportToExcel } from '../lib/exportUtils';
import { formatDate, capitalizeStatus } from '../lib/utils';
import type { Patient } from '../types';

const STATUSES = ['all', 'active', 'admitted', 'discharged', 'inactive'];
const PER_PAGE = 8;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Emergency', 'Radiology', 'Dermatology'];

const emptyForm = {
  name: '', age: '', gender: 'Male', bloodGroup: 'O+', phone: '', email: '',
  address: '', dateOfBirth: '', department: 'Cardiology', primaryDoctor: '',
  status: 'active', allergies: '', conditions: '',
};

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [drawerTab, setDrawerTab] = useState('profile');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [schedulePatientId, setSchedulePatientId] = useState<string | undefined>(undefined);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    const unsub = patientsService.subscribe((data) => {
      setPatients(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleExport = () => {
    const data = patients.map(p => ({
      MRN: p.mrn,
      Name: p.name,
      Age: p.age,
      Gender: p.gender,
      'Blood Group': p.bloodGroup,
      Phone: p.phone,
      Email: p.email,
      Department: p.department,
      'Primary Doctor': p.primaryDoctor,
      Status: p.status,
      'Registered Date': p.registeredDate,
      'Last Visit': p.lastVisit,
    }));
    exportToExcel('patients_directory', data);
  };

  const filtered = patients.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn?.toLowerCase().includes(search.toLowerCase()) ||
      p.department?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFormChange(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const count = patients.length + 1;
      const mrn = `MRN-${String(100000 + count).padStart(6, '0')}`;
      const now = new Date().toISOString().split('T')[0];
      await patientsService.add({
        mrn,
        name: form.name,
        age: Number(form.age),
        gender: form.gender as any,
        bloodGroup: form.bloodGroup as any,
        phone: form.phone,
        email: form.email,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        department: form.department,
        primaryDoctor: form.primaryDoctor,
        status: form.status as any,
        registeredDate: now,
        lastVisit: now,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [],
        conditions: form.conditions ? form.conditions.split(',').map(s => s.trim()) : [],
      });
      setAddOpen(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(patient: Patient) {
    setDeleting(true);
    try {
      await patientsService.delete(patient.id);
      setDeleteConfirm(null);
      if (selected?.id === patient.id) setSelected(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${patients.length} total registered patients`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={15} />
            Export
          </button>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={15} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Search by name, MRN, or department…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3.5 py-2 text-sm font-medium rounded-input transition-all ${
                statusFilter === s ? 'bg-primary text-white' : 'bg-background border border-border text-paragraph hover:border-gray-300'
              }`}>
              {s === 'all' ? 'All' : capitalizeStatus(s)}
            </button>
          ))}
        </div>
        <button className="btn-icon flex-shrink-0"><SlidersHorizontal size={15} /></button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 size={20} className="animate-spin text-primary" />
            <p className="text-sm text-muted">Loading patients from Firebase…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border bg-background/60">
                  <th className="text-left px-6 py-3.5 table-header">Patient</th>
                  <th className="text-left px-4 py-3.5 table-header">MRN</th>
                  <th className="text-left px-4 py-3.5 table-header hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3.5 table-header hidden lg:table-cell">Primary Doctor</th>
                  <th className="text-left px-4 py-3.5 table-header hidden xl:table-cell">Last Visit</th>
                  <th className="text-left px-4 py-3.5 table-header">Status</th>
                  <th className="text-left px-4 py-3.5 table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginated.map(patient => (
                  <motion.tr key={patient.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-background/60 transition-colors group">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Avatar name={patient.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-heading truncate">{patient.name}</p>
                          <p className="text-xs text-muted">{patient.age}y · {patient.gender} · {patient.bloodGroup}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-mono font-medium text-paragraph">{patient.mrn}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-paragraph">{patient.department}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-paragraph">{patient.primaryDoctor}</span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-sm text-muted">{formatDate(patient.lastVisit)}</span>
                    </td>
                    <td className="px-4 py-4"><Badge status={patient.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelected(patient); setDrawerTab('profile'); }}
                          className="btn-icon w-7 h-7" title="View Profile">
                          <Eye size={13} />
                        </button>
                        <button className="btn-icon w-7 h-7" title="Call">
                          <Phone size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(patient)}
                          className="w-7 h-7 inline-flex items-center justify-center rounded-btn border border-transparent text-muted hover:text-danger hover:bg-danger-light hover:border-danger/20 transition-all"
                          title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-muted">No patients found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/40">
            <p className="text-sm text-muted">
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button className="btn-icon w-8 h-8 disabled:opacity-40" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm font-medium rounded-btn transition-colors ${p === page ? 'bg-primary text-white' : 'text-paragraph hover:bg-background'}`}>
                  {p}
                </button>
              ))}
              <button className="btn-icon w-8 h-8 disabled:opacity-40" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)}
        title={selected?.name} subtitle={`${selected?.mrn} · ${selected?.department}`} width="lg">
        {selected && (
          <PatientDrawerContent
            patient={selected}
            activeTab={drawerTab}
            setTab={setDrawerTab}
            onBook={() => {
              const pid = selected.id;
              setSelected(null);
              setSchedulePatientId(pid);
              setScheduleOpen(true);
            }}
          />
        )}
      </Drawer>

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        initialPatientId={schedulePatientId}
      />

      {/* Add Patient Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setForm(emptyForm); }}
        title="Add New Patient" subtitle="Register a new patient in Firebase"
        size="lg"
        footer={
          <>
            <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => { setAddOpen(false); setForm(emptyForm); }}>Cancel</button>
            <button className="btn-primary text-xs sm:text-sm !py-1.5 !px-3" form="add-patient-form" type="submit" disabled={saving}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Add Patient'}
            </button>
          </>
        }>
        <form id="add-patient-form" onSubmit={handleAddPatient}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-heading">Full Name *</label>
              <input className="input-base" required placeholder="e.g. John Smith"
                value={form.name} onChange={e => handleFormChange('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Age *</label>
              <input className="input-base" type="number" min="0" max="150" required placeholder="35"
                value={form.age} onChange={e => handleFormChange('age', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Date of Birth</label>
              <input className="input-base" type="date"
                value={form.dateOfBirth} onChange={e => handleFormChange('dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Gender</label>
              <select className="input-base" value={form.gender} onChange={e => handleFormChange('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Blood Group</label>
              <select className="input-base" value={form.bloodGroup} onChange={e => handleFormChange('bloodGroup', e.target.value)}>
                {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Phone *</label>
              <input className="input-base" required placeholder="+1 (555) 000-0000"
                value={form.phone} onChange={e => handleFormChange('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Email</label>
              <input className="input-base" type="email" placeholder="patient@email.com"
                value={form.email} onChange={e => handleFormChange('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Department *</label>
              <select className="input-base" required value={form.department} onChange={e => handleFormChange('department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Primary Doctor</label>
              <input className="input-base" placeholder="Dr. Name"
                value={form.primaryDoctor} onChange={e => handleFormChange('primaryDoctor', e.target.value)} />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-heading">Address</label>
              <input className="input-base" placeholder="123 Main Street, City, State"
                value={form.address} onChange={e => handleFormChange('address', e.target.value)} />
            </div>
            <div className="col-span-1 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-semibold text-heading">Allergies <span className="text-muted font-normal">(comma-separated)</span></label>
              <input className="input-base" placeholder="Penicillin, Sulfa"
                value={form.allergies} onChange={e => handleFormChange('allergies', e.target.value)} />
            </div>
            <div className="col-span-1 sm:col-span-1 space-y-1.5">
              <label className="text-sm font-semibold text-heading">Conditions <span className="text-muted font-normal">(comma-separated)</span></label>
              <input className="input-base" placeholder="Hypertension, Diabetes"
                value={form.conditions} onChange={e => handleFormChange('conditions', e.target.value)} />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        title="Delete Patient" subtitle="This action cannot be undone." size="sm"
        footer={
          <>
            <button className="btn-secondary w-full sm:w-auto" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-danger w-full sm:w-auto" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleting}>
              {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete Patient'}
            </button>
          </>
        }>
        <p className="text-sm text-paragraph">
          Are you sure you want to permanently delete <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.mrn}) from Firebase? All associated records will remain but the patient will be removed.
        </p>
      </Modal>
    </div>
  );
}

// ─── Patient Drawer ────────────────────────────────────────────────────────────
function PatientDrawerContent({ patient, activeTab, setTab, onBook }: { patient: Patient; activeTab: string; setTab: (t: string) => void; onBook?: () => void }) {
  const tabs = ['profile', 'history', 'prescriptions', 'billing'];
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 bg-background border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar name={patient.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-heading">{patient.name}</h3>
              <Badge status={patient.status} />
            </div>
            <p className="text-sm text-muted">{patient.age} years · {patient.gender} · Blood Group: <strong className="text-paragraph">{patient.bloodGroup}</strong></p>
            <p className="text-sm text-muted mt-0.5">DOB: {formatDate(patient.dateOfBirth)} · Reg: {formatDate(patient.registeredDate)}</p>
          </div>
        </div>
      </div>
      <div className="flex border-b border-border px-6 gap-1 flex-shrink-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === t ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-heading'
            }`}>
            {t === 'history' ? 'Med. History' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <Section title="Contact Information">
              <InfoRow label="Phone" value={patient.phone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Address" value={patient.address || '—'} />
            </Section>
            <Section title="Medical Information">
              <InfoRow label="Primary Doctor" value={patient.primaryDoctor} />
              <InfoRow label="Department" value={patient.department} />
              <InfoRow label="Last Visit" value={formatDate(patient.lastVisit)} />
            </Section>
            {patient.insuranceProvider && (
              <Section title="Insurance">
                <InfoRow label="Provider" value={patient.insuranceProvider} />
                <InfoRow label="ID" value={patient.insuranceId || '—'} />
              </Section>
            )}
            <Section title="Allergies & Conditions">
              <div className="flex flex-wrap gap-2 mb-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider w-full">Allergies</p>
                {(patient.allergies?.length ?? 0) > 0
                  ? patient.allergies.map(a => <Badge key={a} variant="danger">{a}</Badge>)
                  : <span className="text-sm text-muted">No known allergies</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider w-full">Conditions</p>
                {(patient.conditions?.length ?? 0) > 0
                  ? patient.conditions.map(c => <Badge key={c} variant="info">{c}</Badge>)
                  : <span className="text-sm text-muted">None recorded</span>}
              </div>
            </Section>
          </div>
        )}
        {activeTab === 'history' && (
          <p className="text-sm text-muted">Medical history timeline for {patient.name} will appear here from Firebase records.</p>
        )}
        {activeTab === 'prescriptions' && (
          <p className="text-sm text-muted">Prescriptions for {patient.name} will appear here from Firebase records.</p>
        )}
        {activeTab === 'billing' && (
          <p className="text-sm text-muted">Billing history for {patient.name} will appear here from Firebase invoices.</p>
        )}
      </div>
      <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
        <button className="btn-secondary flex-1">Edit Patient</button>
        <button className="btn-primary flex-1" onClick={onBook}>Book Appointment</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-sm text-muted w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-heading flex-1">{value}</span>
    </div>
  );
}
