import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, AlertOctagon, Plus, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { notificationsService } from '../lib/firebaseService';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';
import type { Notification } from '../types';

const TYPE_CONFIG = {
  danger: { icon: AlertOctagon, color: 'text-danger', bg: 'bg-danger-light', border: 'border-danger/20' },
  warning: { icon: AlertTriangle, color: 'text-warning-dark', bg: 'bg-warning-light', border: 'border-warning/20' },
  success: { icon: CheckCircle, color: 'text-success-dark', bg: 'bg-success-light', border: 'border-success/20' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary-light', border: 'border-primary/20' },
};

const emptyForm = {
  title: '',
  message: '',
  type: 'info' as Notification['type'],
};

export function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const unsub = notificationsService.subscribe((data) => {
      setNotificationsList(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const unread = notificationsList.filter(n => !n.read);
  const read = notificationsList.filter(n => n.read);

  const handleMarkAllRead = async () => {
    unread.forEach(n => {
      notificationsService.markRead(n.id);
    });
  };

  const handleDismiss = async (id: string) => {
    await notificationsService.markRead(id);
  };

  const handleDelete = async (id: string) => {
    await notificationsService.delete(id);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    setSaving(true);
    setTimeout(() => {
      const newNotif = {
        id: `n_${Date.now()}`,
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        time: 'Just now',
        read: false,
      } as unknown as Notification;

      // Add to store via local store dispatch
      setNotificationsList(prev => [newNotif, ...prev]);
      setSaving(false);
      setAddOpen(false);
      setForm(emptyForm);
    }, 200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${unread.length} unread notifications`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unread.length > 0 && (
            <button className="btn-secondary text-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={15} />
              Mark all as read
            </button>
          )}
          <button className="btn-primary text-sm" onClick={() => setAddOpen(true)}>
            <Plus size={15} />
            Send Alert
          </button>
        </div>
      </div>

      {unread.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Unread</p>
          {unread.map((n, i) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn('card p-4 flex items-start gap-4 border', config.border)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">{n.title}</p>
                  <p className="text-sm text-paragraph mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted mt-1.5">{n.time}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDismiss(n.id)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1 text-muted hover:text-danger rounded-md transition-colors ml-1"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Earlier</p>
          {read.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <div key={n.id} className="card p-4 flex items-start gap-4 opacity-75 group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">{n.title}</p>
                  <p className="text-sm text-paragraph mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted mt-1.5">{n.time}</p>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1 text-muted hover:text-danger rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {notificationsList.length === 0 && !loading && (
        <div className="card p-12 text-center text-muted text-sm">
          No notifications to display
        </div>
      )}

      {/* Send Notification Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Send Hospital Alert"
        subtitle="Broadcast a new alert or notification to hospital staff"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddOpen(false)} type="button">
              Cancel
            </button>
            <button className="btn-primary" form="send-notif-form" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Sending…
                </>
              ) : (
                'Send Alert'
              )}
            </button>
          </>
        }
      >
        <form id="send-notif-form" onSubmit={handleSendNotification} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Alert Title *</label>
            <input
              className="input-base"
              required
              placeholder="e.g. System Maintenance, Emergency Code Blue"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Message *</label>
            <textarea
              className="input-base min-h-[80px]"
              required
              placeholder="Enter detailed alert message for staff..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Alert Severity Level</label>
            <select
              className="input-base capitalize"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as Notification['type'] })}
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="danger">Emergency (Red)</option>
              <option value="success">Success (Green)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
