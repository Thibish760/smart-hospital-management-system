import { Bell, AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { notifications } from '../data/mockData';
import { cn } from '../lib/utils';

const TYPE_CONFIG = {
  danger: { icon: AlertOctagon, color: 'text-danger', bg: 'bg-danger-light', border: 'border-danger/20' },
  warning: { icon: AlertTriangle, color: 'text-warning-dark', bg: 'bg-warning-light', border: 'border-warning/20' },
  success: { icon: CheckCircle, color: 'text-success-dark', bg: 'bg-success-light', border: 'border-success/20' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary-light', border: 'border-primary/20' },
};

export function NotificationsPage() {
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm text-muted mt-1">{unread.length} unread notifications</p>
        </div>
        <button className="btn-secondary text-sm">Mark all as read</button>
      </div>

      {unread.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Unread</p>
          {unread.map((n, i) => {
            const { icon: Icon, color, bg, border } = TYPE_CONFIG[n.type];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn('card p-4 flex items-start gap-4 border', border)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-heading">{n.title}</p>
                  <p className="text-sm text-paragraph mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted mt-1.5">{n.time}</p>
                </div>
                <button className="text-xs text-primary font-semibold hover:underline flex-shrink-0">Dismiss</button>
              </motion.div>
            );
          })}
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Earlier</p>
          {read.map((n, i) => {
            const { icon: Icon, color, bg } = TYPE_CONFIG[n.type];
            return (
              <div key={n.id} className="card p-4 flex items-start gap-4 opacity-70">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-heading">{n.title}</p>
                  <p className="text-sm text-paragraph mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted mt-1.5">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
