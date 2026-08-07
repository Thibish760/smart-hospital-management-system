import { cn } from '../../lib/utils';
import { getStatusColor, capitalizeStatus } from '../../lib/utils';

interface BadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status, variant, children, className }: BadgeProps) {
  if (status) {
    return (
      <span className={cn('badge', getStatusColor(status), className)}>
        {children || capitalizeStatus(status)}
      </span>
    );
  }

  const variantClasses = {
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    danger: 'bg-danger-light text-danger-dark',
    info: 'bg-info-light text-info-dark',
    default: 'bg-border-light text-paragraph',
  };

  return (
    <span className={cn('badge', variantClasses[variant || 'default'], className)}>
      {children}
    </span>
  );
}
