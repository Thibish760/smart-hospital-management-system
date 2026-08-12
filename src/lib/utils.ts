import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getCurrentFullDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getCurrentDateShort(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTodayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-success-light text-success-dark',
    admitted: 'bg-info-light text-info-dark',
    discharged: 'bg-border-light text-muted',
    inactive: 'bg-border-light text-muted',
    available: 'bg-success-light text-success-dark',
    busy: 'bg-warning-light text-warning-dark',
    'off-duty': 'bg-border-light text-muted',
    'on-leave': 'bg-danger-light text-danger-dark',
    pending: 'bg-warning-light text-warning-dark',
    completed: 'bg-success-light text-success-dark',
    cancelled: 'bg-danger-light text-danger-dark',
    rescheduled: 'bg-info-light text-info-dark',
    'in-progress': 'bg-primary-light text-primary-700',
    paid: 'bg-success-light text-success-dark',
    overdue: 'bg-danger-light text-danger-dark',
    partial: 'bg-warning-light text-warning-dark',
  };
  return map[status] || 'bg-border-light text-muted';
}

export function getStatusDot(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-success',
    available: 'bg-success',
    admitted: 'bg-info',
    'in-progress': 'bg-primary',
    pending: 'bg-warning',
    busy: 'bg-warning',
    completed: 'bg-success',
    paid: 'bg-success',
    cancelled: 'bg-danger',
    overdue: 'bg-danger',
    'on-leave': 'bg-danger',
    rescheduled: 'bg-info',
    partial: 'bg-warning',
  };
  return map[status] || 'bg-muted';
}

export function capitalizeStatus(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
