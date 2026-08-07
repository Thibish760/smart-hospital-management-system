import { useState, useEffect } from 'react';
import { Search, FileText, TestTube, Pill, Stethoscope, Scan, MessageSquare, Paperclip, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { recordsService, patientsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { formatDate } from '../lib/utils';
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

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState('all');

  useEffect(() => {
    const unsubR = recordsService.subscribe((data) => {
      setRecords(data);
      setLoading(false);
    }, () => setLoading(false));
    const unsubP = patientsService.subscribe(setPatients);
    return () => { unsubR(); unsubP(); };
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchPatient = selectedPatient === 'all' || r.patientId === selectedPatient;
    return matchSearch && matchType && matchPatient;
  });

  // Patients that have records
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
        <button className="btn-primary">
          <Upload size={15} />
          Upload Record
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Search records or patients…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-base w-48" value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}>
          <option value="all">All Patients</option>
          {patientsWithRecords.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {RECORD_TYPES.slice(0, 5).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-xs font-semibold rounded-input capitalize transition-all ${
                typeFilter === t ? 'bg-primary text-white' : 'bg-background border border-border text-paragraph hover:border-gray-300'
              }`}>
              {t === 'all' ? 'All' : t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Patient Sidebar */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border">
            <h2 className="section-title text-base">Patients</h2>
          </div>
          <div className="divide-y divide-border-light">
            <button onClick={() => setSelectedPatient('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors ${selectedPatient === 'all' ? 'bg-primary-50' : ''}`}>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors ${selectedPatient === p.id ? 'bg-primary-50' : ''}`}>
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
                transition={{ delay: i * 0.05 }} className="card p-5 hover:shadow-card-hover transition-all">
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
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-muted">{formatDate(record.date)}</p>
                        <Badge variant="default" className="mt-1 capitalize">{record.type?.replace('-', ' ')}</Badge>
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
    </div>
  );
}
