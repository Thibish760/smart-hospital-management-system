import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[200]"
            onClick={onClose}
          />

          {/* Centered Compact Dialog Box (Adapted to mobile screen with proper space gap on all sides) */}
          <motion.div
            key="modal-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'relative bg-surface rounded-2xl border border-border shadow-2xl w-full my-auto flex flex-col z-[201]',
              'max-w-[calc(100vw-1.5rem)]', // Enforces clean 0.75rem margin gap on mobile
              sizeClasses[size],
              'max-h-[82dvh] sm:max-h-[85vh]', // Reduced height to fit screen gracefully
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border flex-shrink-0">
              <div className="flex-1 min-w-0 pr-2">
                {title && (
                  <h2 className="text-sm sm:text-base font-bold text-heading leading-snug">{title}</h2>
                )}
                {subtitle && (
                  <p className="text-[11px] sm:text-xs text-muted mt-0.5 leading-snug">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-muted hover:text-heading hover:bg-background transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="px-3.5 py-3 sm:px-5 sm:py-4 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-t border-border bg-background/50 rounded-b-2xl flex-shrink-0">
                <div className="flex flex-row justify-end items-center gap-2">
                  {footer}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
