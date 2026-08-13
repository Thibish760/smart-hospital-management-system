import { useState } from 'react';
import { Building2, Users, BedDouble, Activity, Download, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { departments as initialDepartments } from '../data/mockData';
import { Modal } from '../components/ui/Modal';
import { exportToExcel } from '../lib/exportUtils';
import type { Department } from '../types';

const COLOR_OPTIONS = [
  { label: 'Red', value: '#EF4444' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Teal', value: '#14B8A6' },
  { label: 'Orange', value: '#F97316' },
];

export function Departments() {
  const [deptList, setDeptList] = useState<Department[]>(initialDepartments);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);

  const [form, setForm] = useState({
    name: '',
    head: '',
    doctorCount: 5,
    bedCount: 20,
    bedsOccupied: 10,
    color: '#3B82F6',
  });

  const handleExport = () => {
    const dataToExport = deptList.map(d => ({
      ID: d.id,
      'Department Name': d.name,
      'Head of Department': d.head,
      'Total Doctors': d.doctorCount,
      'Total Beds': d.bedCount,
      'Beds Occupied': d.bedsOccupied,
      'Occupancy %': `${Math.round((d.bedsOccupied / d.bedCount) * 100)}%`,
    }));
    exportToExcel('departments_export', dataToExport);
  };

  const handleDeleteDepartment = (id: string) => {
    setDeptList(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    setTimeout(() => {
      const newDept: Department = {
        id: `d_${Date.now()}`,
        name: form.name.trim(),
        head: form.head.trim() || 'Dr. Department Head',
        doctorCount: Number(form.doctorCount) || 1,
        bedCount: Number(form.bedCount) || 10,
        bedsOccupied: Number(form.bedsOccupied) || 0,
        color: form.color,
      };

      setDeptList(prev => [...prev, newDept]);
      setSaving(false);
      setAddOpen(false);
      setForm({ name: '', head: '', doctorCount: 5, bedCount: 20, bedsOccupied: 10, color: '#3B82F6' });
    }, 200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-sm text-muted mt-1">{deptList.length} active departments</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={handleExport}>
            <Download size={15} />
            Export Excel
          </button>
          <button className="btn-primary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => setAddOpen(true)}>
            <Building2 size={15} />
            Add Department
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: deptList.length, icon: Building2, color: 'text-primary bg-primary-light' },
          { label: 'Total Doctors', value: deptList.reduce((s, d) => s + d.doctorCount, 0), icon: Users, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Total Beds', value: deptList.reduce((s, d) => s + d.bedCount, 0), icon: BedDouble, color: 'text-amber-700 bg-amber-50' },
          { label: 'Beds Occupied', value: deptList.reduce((s, d) => s + d.bedsOccupied, 0), icon: Activity, color: 'text-rose-700 bg-rose-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-heading">{value}</p>
            <p className="text-xs text-muted font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {deptList.map((dept, i) => {
          const occupancy = Math.round((dept.bedsOccupied / Math.max(dept.bedCount, 1)) * 100);
          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-card-hover transition-all relative group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-heading break-words leading-snug">{dept.name}</p>
                    <p className="text-xs text-muted truncate">{dept.head}</p>
                  </div>
                </div>
                <button
                  className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors flex-shrink-0"
                  title="Delete Department"
                  onClick={() => setDeleteConfirm(dept)}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Users size={12} className="text-muted" />
                    <p className="text-xs text-muted">Doctors</p>
                  </div>
                  <p className="text-lg font-bold text-heading">{dept.doctorCount}</p>
                </div>
                <div className="p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <BedDouble size={12} className="text-muted" />
                    <p className="text-xs text-muted">Beds</p>
                  </div>
                  <p className="text-lg font-bold text-heading">{dept.bedCount}</p>
                </div>
              </div>

              {/* Occupancy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted">Bed Occupancy</span>
                  <span className={`text-xs font-bold ${occupancy > 80 ? 'text-danger' : occupancy > 60 ? 'text-warning-dark' : 'text-success-dark'}`}>
                    {dept.bedsOccupied}/{dept.bedCount} ({occupancy}%)
                  </span>
                </div>
                <div className="h-2 bg-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(occupancy, 100)}%`,
                      backgroundColor: occupancy > 80 ? '#EF4444' : occupancy > 60 ? '#F59E0B' : dept.color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Department"
        subtitle="Create a new medical department and assign resources"
        size="md"
        footer={
          <>
            <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => setAddOpen(false)} type="button">
              Cancel
            </button>
            <button className="btn-primary text-xs sm:text-sm !py-1.5 !px-3" form="add-dept-form" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Adding…
                </>
              ) : (
                'Add Department'
              )}
            </button>
          </>
        }
      >
        <form id="add-dept-form" onSubmit={handleAddDepartment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Department Name *</label>
            <input
              className="input-base"
              required
              placeholder="e.g. Neurology, ICU, Pediatrics"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Head of Department *</label>
            <input
              className="input-base"
              required
              placeholder="e.g. Dr. Alexander Fleming"
              value={form.head}
              onChange={e => setForm({ ...form, head: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Doctors Count</label>
              <input
                type="number"
                min="1"
                className="input-base"
                value={form.doctorCount}
                onChange={e => setForm({ ...form, doctorCount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Total Beds</label>
              <input
                type="number"
                min="1"
                className="input-base"
                value={form.bedCount}
                onChange={e => setForm({ ...form, bedCount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Occupied Beds</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.bedsOccupied}
                onChange={e => setForm({ ...form, bedsOccupied: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Color Theme</label>
            <select
              className="input-base"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
            >
              {COLOR_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label} ({c.value})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Department Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Department"
        subtitle="Confirm department deletion"
        size="sm"
        footer={
          <>
            <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-input bg-danger text-white hover:bg-danger-dark transition-colors"
              onClick={() => deleteConfirm && handleDeleteDepartment(deleteConfirm.id)}
            >
              Delete Department
            </button>
          </>
        }
      >
        <p className="text-sm text-paragraph">
          Are you sure you want to permanently delete department <strong>{deleteConfirm?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
