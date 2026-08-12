import { useState, useEffect } from 'react';
import { Search, FileText, TestTube, Pill, Stethoscope, Scan, MessageSquare, Paperclip, Loader2, Upload, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { recordsService, patientsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { exportToExcel } from '../lib/exportUtils';
import { formatDate, getTodayISODate } from '../lib/utils';
import type { MedicalRecord, Patient } from '../types';

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  'lab-report': TestTube, 'prescription': Pill, 'diagnosis': Stethoscope,
  'surgery': FileText, 'scan': Scan, 'note': MessageSquare,
};
const TYPE_COLORS: Record<string, string> = {
  'lab-report': 'text-blue-600 bg-blue-50', 'prescription': 'text-emerald-600 bg-emerald-50',
  'diagnosis': 'text-violet-600 bg-violet-50', 'surgery': 'text-red-600 bg-red-50',
  'scan': 'text-amber-600 bg-amber-50', 'note': 'text-gray-600 bg-gray-100',
};
const RECORD_TYPES = ['all', 'lab-report', 'prescription', 'diagnosis', 'surgery', 'scan', 'note'];

const emptyForm = {
  title: '',
  patientId: 'p1',
  patientName: 'Eleanor Whitfield',
  doctor: 'Dr. Sarah Mitchell',
  department: 'Cardiology',
  type: 'lab-report' as MedicalRecord['type'],
  date: getTodayISODate(),
  description: '',
  tagsStr: 'Lab Report, Diagnostics',
  attachmentName: 'medical_report.pdf',
};

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState('all');

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const unsubR = recordsService.subscribe((data) => {
      setRecords(data);
      setLoading(false);
    }, () => setLoading(false));
    const unsubP = patientsService.subscribe(setPatients);
    return () => { unsubR(); unsubP(); };
  }, []);

  const handlePatientChange = (patId: string) => {
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setForm({
        ...form,
        patientId: pat.id,
        patientName: pat.name,
        doctor: pat.primaryDoctor || 'Dr. Sarah Mitchell',
        department: pat.department || 'General Medicine',
      });
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    const tagsArr = form.tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const attachmentsArr = form.attachmentName.trim() ? [form.attachmentName.trim()] : undefined;

    try {
      await recordsService.add({
        patientId: form.patientId || 'p1',
        patientName: form.patientName || 'Eleanor Whitfield',
        title: form.title.trim(),
        doctor: form.doctor || 'Dr. Sarah Mitchell',
        department: form.department || 'General Medicine',
        type: form.type,
        date: form.date || '2026-08-05',
        description: form.description.trim() || 'Medical report record details',
        tags: tagsArr.length > 0 ? tagsArr : ['Medical'],
        attachments: attachmentsArr,
      });

      setSaving(false);
      setAddOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleExport = () => {
    const data = records.map(r => ({
      ID: r.id,
      Title: r.title,
      'Patient Name': r.patientName,
      Doctor: r.doctor,
      Department: r.department,
      Type: r.type,
      Date: r.date,
      Description: r.description || '',
    }));
    exportToExcel('medical_records', data);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await recordsService.delete(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = records.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchPatient = selectedPatient === 'all' || r.patientId === selectedPatient;
    return matchSearch && matchType && matchPatient;
  });

  const patientsWithRecords = patients.filter(p =>
    records.some(r => r.patientId === p.id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${records.length} records on file`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={15} />
            Export Excel
          </button>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Upload size={15} />
            Upload Record
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Search records by title or patient name…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {RECORD_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-input capitalize transition-all ${
                typeFilter === t ? 'bg-primary text-white' : 'bg-background border border-border text-paragraph hover:border-gray-300'
              }`}>
              {t === 'all' ? 'All Types' : t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Sidebar: Patients List */}
        <div className="card overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-border bg-background/50">
            <h2 className="text-sm font-semibold text-heading">Filter by Patient</h2>
          </div>
          <div className="divide-y divide-border-light max-h-96 overflow-y-auto">
            <button onClick={() => setSelectedPatient('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors ${selectedPatient === 'all' ? 'bg-primary-light/50 font-semibold' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold">All</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-heading">All Patients</p>
                <p className="text-xs text-muted">{records.length} total records</p>
              </div>
            </button>
            {patientsWithRecords.map(p => {
              const count = records.filter(r => r.patientId === p.id).length;
              return (
                <button key={p.id} onClick={() => setSelectedPatient(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors ${selectedPatient === p.id ? 'bg-primary-light/50 font-semibold' : ''}`}>
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">{p.name}</p>
                    <p className="text-xs text-muted">{count} records · {p.department}</p>
                  </div>
                </button>
              );
            })}
            {loading && (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <p className="text-xs text-muted">Loading…</p>
              </div>
            )}
          </div>
        </div>

        {/* Records Timeline */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <p className="text-sm text-muted">Loading records from Firebase…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText size={32} className="text-muted mx-auto mb-3" />
              <p className="text-muted text-sm">No records found</p>
            </div>
          ) : filtered.map((record, i) => {
            const Icon = TYPE_ICONS[record.type] || FileText;
            const colorClass = TYPE_COLORS[record.type] || 'text-muted bg-background';
            return (
              <motion.div key={record.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="card p-5 hover:shadow-card-hover transition-all relative group">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-heading">{record.title}</p>
                        <p className="text-xs text-muted mt-0.5">{record.patientName} · {record.doctor} · {record.department}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted">{formatDate(record.date)}</p>
                          <Badge variant="default" className="mt-1 capitalize">{record.type?.replace('-', ' ')}</Badge>
                        </div>
                        <button
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors ml-1"
                          title="Delete Record"
                          onClick={() => setDeleteConfirm(record)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-paragraph mt-2 leading-relaxed">{record.description}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {record.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-background border border-border rounded-full text-muted">{tag}</span>
                      ))}
                      {record.attachments?.map(file => (
                        <button key={file} className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-light text-primary rounded-full hover:bg-primary-100 transition-colors">
                          <Paperclip size={10} />{file}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Upload Record Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Upload Medical Record"
        subtitle="Add a lab report, prescription, scan, or diagnostic report to patient files"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddOpen(false)} type="button">
              Cancel
            </button>
            <button className="btn-primary" form="upload-record-form" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading…
                </>
              ) : (
                'Upload Record'
              )}
            </button>
          </>
        }
      >
        <form id="upload-record-form" onSubmit={handleAddRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-heading">Record Title *</label>
              <input
                className="input-base"
                required
                placeholder="e.g. Comprehensive Blood Count Report, MRI Brain Scan"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-heading">Select Patient *</label>
              <select
                className="input-base"
                value={form.patientId}
                onChange={e => handlePatientChange(e.target.value)}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn} — {p.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Attending Doctor</label>
              <input
                className="input-base"
                placeholder="Dr. Sarah Mitchell"
                value={form.doctor}
                onChange={e => setForm({ ...form, doctor: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Department</label>
              <input
                className="input-base"
                placeholder="Cardiology"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Record Type *</label>
              <select
                className="input-base capitalize"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as MedicalRecord['type'] })}
              >
                <option value="lab-report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="surgery">Surgery</option>
                <option value="scan">Scan / Imaging</option>
                <option value="note">Clinical Note</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Date *</label>
              <input
                type="date"
                className="input-base"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-heading">Description / Key Findings</label>
              <textarea
                className="input-base min-h-[75px]"
                placeholder="Enter summary of lab findings, diagnosis, or prescription dosage notes…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Tags <span className="text-muted font-normal">(comma-separated)</span></label>
              <input
                className="input-base"
                placeholder="Lab, Cardiology, Urgent"
                value={form.tagsStr}
                onChange={e => setForm({ ...form, tagsStr: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Attachment File Name</label>
              <input
                className="input-base"
                placeholder="blood_report_aug2026.pdf"
                value={form.attachmentName}
                onChange={e => setForm({ ...form, attachmentName: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Record Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Medical Record"
        subtitle="Confirm deletion of record"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-input bg-danger text-white hover:bg-danger-dark transition-colors"
              onClick={() => deleteConfirm && handleDeleteRecord(deleteConfirm.id)}
            >
              Delete Record
            </button>
          </>
        }
      >
        <p className="text-sm text-paragraph">
          Are you sure you want to permanently delete record <strong>{deleteConfirm?.title}</strong> for <strong>{deleteConfirm?.patientName}</strong>?
        </p>
      </Modal>
    </div>
  );
}
