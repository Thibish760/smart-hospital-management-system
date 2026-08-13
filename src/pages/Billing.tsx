import { useState, useEffect } from 'react';
import { Download, Plus, Search, FileText, CheckCircle, AlertCircle, Clock, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { invoicesService, patientsService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { exportToExcel } from '../lib/exportUtils';
import { formatDate, formatCurrency, capitalizeStatus, getTodayISODate } from '../lib/utils';
import type { Invoice, Patient, PaymentStatus } from '../types';

const PAYMENT_STATUSES = ['all', 'paid', 'pending', 'overdue', 'partial'];

const emptyForm = {
  patientId: 'p1',
  patientName: 'Eleanor Whitfield',
  date: getTodayISODate(),
  dueDate: getTodayISODate(),
  subtotal: '1500',
  tax: '100',
  discount: '0',
  status: 'pending' as PaymentStatus,
  paymentMethod: 'card' as Invoice['paymentMethod'],
};

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Invoice | null>(null);

  useEffect(() => {
    const unsubInv = invoicesService.subscribe((data) => {
      setInvoices(data);
      setLoading(false);
    }, () => setLoading(false));
    const unsubPat = patientsService.subscribe(setPatients);
    return () => { unsubInv(); unsubPat(); };
  }, []);

  const handleExport = () => {
    const data = invoices.map(i => ({
      'Invoice #': i.invoiceNumber,
      'Patient Name': i.patientName,
      'Issue Date': i.date,
      'Due Date': i.dueDate,
      Status: i.status,
      Subtotal: i.subtotal,
      Tax: i.tax,
      Discount: i.discount,
      Total: i.total,
      'Payment Method': i.paymentMethod || 'N/A',
    }));
    exportToExcel('billing_invoices', data);
  };

  const handlePatientChange = (patId: string) => {
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setForm({ ...form, patientId: pat.id, patientName: pat.name });
    }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const sub = Number(form.subtotal) || 1500;
    const taxVal = Number(form.tax) || 0;
    const discVal = Number(form.discount) || 0;
    const tot = Math.max(0, sub + taxVal - discVal);

    const invNum = `INV-2026-0${Math.floor(850 + Math.random() * 100)}`;

    try {
      await invoicesService.add({
        invoiceNumber: invNum,
        patientId: form.patientId || 'p1',
        patientName: form.patientName || 'Eleanor Whitfield',
        date: form.date || '2026-08-05',
        dueDate: form.dueDate || '2026-09-05',
        services: [
          { description: 'Medical Consultation & Diagnostics', quantity: 1, unitPrice: sub, total: sub }
        ],
        subtotal: sub,
        tax: taxVal,
        discount: discVal,
        total: tot,
        status: form.status,
        paymentMethod: form.paymentMethod,
      });

      setSaving(false);
      setAddOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await invoicesService.delete(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const grandTotal = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${invoices.length} invoices this period`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={handleExport}><Download size={15} />Export</button>
          <button className="btn-primary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => setAddOpen(true)}><Plus size={15} />New Invoice</button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced', value: grandTotal, icon: FileText, color: 'text-heading bg-background' },
          { label: 'Revenue Collected', value: totalRevenue, icon: CheckCircle, color: 'text-success-dark bg-success-light' },
          { label: 'Pending', value: totalPending, icon: Clock, color: 'text-warning-dark bg-warning-light' },
          { label: 'Overdue', value: totalOverdue, icon: AlertCircle, color: 'text-danger-dark bg-danger-light' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider leading-snug break-words flex-1 min-w-0 pr-2">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={15} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-heading break-all">{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Search invoices or patients…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {PAYMENT_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-2 text-sm font-medium rounded-input transition-all ${
              statusFilter === s ? 'bg-primary text-white' : 'bg-white border border-border text-paragraph hover:border-gray-300'
            }`}>
            {s === 'all' ? 'All' : capitalizeStatus(s)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 size={20} className="animate-spin text-primary" />
            <p className="text-sm text-muted">Loading invoices from Firebase…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border bg-background/60">
                  <th className="text-left px-6 py-3.5 table-header">Invoice</th>
                  <th className="text-left px-4 py-3.5 table-header">Patient</th>
                  <th className="text-left px-4 py-3.5 table-header hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3.5 table-header hidden lg:table-cell">Due Date</th>
                  <th className="text-left px-4 py-3.5 table-header hidden lg:table-cell">Services</th>
                  <th className="text-left px-4 py-3.5 table-header">Total</th>
                  <th className="text-left px-4 py-3.5 table-header">Status</th>
                  <th className="text-left px-4 py-3.5 table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filtered.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }} className="hover:bg-background/60 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-semibold text-heading">{inv.invoiceNumber}</p>
                      {inv.paymentMethod && <p className="text-xs text-muted capitalize">{inv.paymentMethod?.replace('-', ' ')}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={inv.patientName} size="sm" />
                        <span className="text-sm font-medium text-heading truncate max-w-[100px] sm:max-w-none">{inv.patientName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted">{formatDate(inv.date)}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={`text-sm ${inv.status === 'overdue' ? 'text-danger font-semibold' : 'text-muted'}`}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted">{inv.services?.length || 1} items</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-heading">{formatCurrency(inv.total)}</p>
                      {inv.discount > 0 && <p className="text-xs text-muted">-{formatCurrency(inv.discount)} disc.</p>}
                    </td>
                    <td className="px-4 py-4"><Badge status={inv.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                          title="Delete Invoice"
                          onClick={() => setDeleteConfirm(inv)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-sm text-muted">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Footer total */}
        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/40">
            <p className="text-sm text-muted">{filtered.length} invoices</p>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted">Subtotal</p>
                <p className="text-sm font-bold text-heading">{formatCurrency(filtered.reduce((s, i) => s + (i.subtotal || 0), 0))}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Total</p>
                <p className="text-sm font-bold text-heading">{formatCurrency(filtered.reduce((s, i) => s + i.total, 0))}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Create New Invoice"
        subtitle="Generate a billing invoice for patient consultation and medical services"
        size="lg"
        footer={
          <>
            <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => setAddOpen(false)} type="button">
              Cancel
            </button>
            <button className="btn-primary text-xs sm:text-sm !py-1.5 !px-3" form="add-invoice-form" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating…
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          </>
        }
      >
        <form id="add-invoice-form" onSubmit={handleAddInvoice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-heading">Patient *</label>
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
              <label className="text-sm font-semibold text-heading">Issue Date *</label>
              <input
                type="date"
                className="input-base"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Due Date *</label>
              <input
                type="date"
                className="input-base"
                required
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Payment Status</label>
              <select
                className="input-base capitalize"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as PaymentStatus })}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Payment Method</label>
              <select
                className="input-base capitalize"
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value as Invoice['paymentMethod'] })}
              >
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="insurance">Insurance</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Subtotal (₹) *</label>
              <input
                type="number"
                min="0"
                className="input-base"
                required
                value={form.subtotal}
                onChange={e => setForm({ ...form, subtotal: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Tax (₹)</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.tax}
                onChange={e => setForm({ ...form, tax: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Discount (₹)</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-heading">Calculated Total (₹)</label>
              <div className="px-3.5 py-2 rounded-input border border-border bg-background/60 font-bold text-base text-primary">
                {formatCurrency(Math.max(0, (Number(form.subtotal) || 0) + (Number(form.tax) || 0) - (Number(form.discount) || 0)))}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Invoice"
        subtitle="Confirm deletion of billing record"
        size="sm"
        footer={
          <>
            <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-input bg-danger text-white hover:bg-danger-dark transition-colors"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
            >
              Delete Invoice
            </button>
          </>
        }
      >
        <p className="text-sm text-paragraph">
          Are you sure you want to permanently delete invoice <strong>{deleteConfirm?.invoiceNumber}</strong> for <strong>{deleteConfirm?.patientName}</strong>?
        </p>
      </Modal>
    </div>
  );
}
