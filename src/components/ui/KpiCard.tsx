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
      'card p-6 flex flex-col gap-4 hover:shadow-card-hover transition-shadow duration-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-heading mt-1.5 tracking-tight">{displayValue}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className={cn(
          'flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1',
          isPositive ? 'text-success-dark bg-success-light' : 'text-danger-dark bg-danger-light'
        )}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change > 0 ? '+' : ''}{change}% vs last month
        </div>
        {sparkline && (
          <div className="h-10 w-24 flex-shrink-0">
            <SparklineChart data={sparkline} positive={isPositive} />
          </div>
        )}
      </div>
    </div>
  );
}
