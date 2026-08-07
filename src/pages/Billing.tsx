import { useState, useEffect } from 'react';
import { Download, Plus, Search, FileText, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { invoicesService } from '../lib/firebaseService';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { formatDate, formatCurrency, capitalizeStatus } from '../lib/utils';
import type { Invoice } from '../types';

const PAYMENT_STATUSES = ['all', 'paid', 'pending', 'overdue', 'partial'];

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const unsub = invoicesService.subscribe((data) => {
      setInvoices(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${invoices.length} invoices this period`}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary"><Download size={15} />Export</button>
          <button className="btn-primary"><Plus size={15} />New Invoice</button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced', value: grandTotal, icon: FileText, color: 'text-heading bg-background' },
          { label: 'Revenue Collected', value: totalRevenue, icon: CheckCircle, color: 'text-success-dark bg-success-light' },
          { label: 'Pending', value: totalPending, icon: Clock, color: 'text-warning-dark bg-warning-light' },
          { label: 'Overdue', value: totalOverdue, icon: AlertCircle, color: 'text-danger-dark bg-danger-light' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={15} />
              </div>
            </div>
            <p className="text-2xl font-bold text-heading">{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
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
            <table className="w-full">
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
                      <div className="flex items-center gap-2.5">
                        <Avatar name={inv.patientName} size="sm" />
                        <span className="text-sm font-medium text-heading">{inv.patientName}</span>
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
                      <span className="text-sm text-muted">{inv.services?.length || 0} items</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-heading">{formatCurrency(inv.total)}</p>
                      {inv.discount > 0 && <p className="text-xs text-muted">-{formatCurrency(inv.discount)} disc.</p>}
                    </td>
                    <td className="px-4 py-4"><Badge status={inv.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn-icon w-7 h-7" title="Download PDF"><Download size={13} /></button>
                        <button className="btn-icon w-7 h-7" title="View"><FileText size={13} /></button>
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
    </div>
  );
}
