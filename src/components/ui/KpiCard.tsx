import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { SparklineChart } from '../charts/SparklineChart';

interface KpiCardProps {
  label: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  isCurrency?: boolean;
  sparkline?: number[];
  suffix?: string;
  className?: string;
}

export function KpiCard({
  label, value, change, changeType, icon,
  isCurrency, sparkline, suffix, className,
}: KpiCardProps) {
  const isPositive = changeType === 'increase';
  const displayValue = isCurrency
    ? formatCurrency(Number(value))
    : `${value}${suffix || ''}`;

  return (
    <div className={cn(
      'card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 hover:shadow-card-hover transition-shadow duration-200',
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider leading-snug break-words">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-heading mt-1.5 tracking-tight break-all">{displayValue}</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className={cn(
          'flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1 flex-1 min-w-0',
          isPositive ? 'text-success-dark bg-success-light' : 'text-danger-dark bg-danger-light'
        )}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span className="truncate">{change > 0 ? '+' : ''}{change}% <span className="hidden sm:inline">vs last month</span></span>
        </div>
        {sparkline && (
          <div className="h-10 w-20 sm:w-24 flex-shrink-0">
            <SparklineChart data={sparkline} positive={isPositive} />
          </div>
        )}
      </div>
    </div>
  );
}
