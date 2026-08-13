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
      'card p-3.5 sm:p-4 lg:p-5 flex flex-col gap-2.5 sm:gap-3 hover:shadow-card-hover transition-shadow duration-200',
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Label: tighter on mobile */}
          <p className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wider leading-snug break-words">
            {label}
          </p>
          {/* Value: smaller on mobile to prevent overflow */}
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-heading mt-1 tracking-tight leading-tight break-all">
            {displayValue}
          </p>
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-background flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className={cn(
          'flex items-center gap-1 text-[10px] sm:text-xs font-semibold rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 flex-1 min-w-0',
          isPositive ? 'text-success-dark bg-success-light' : 'text-danger bg-danger-light'
        )}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          <span className="truncate">{change > 0 ? '+' : ''}{change}% <span className="hidden sm:inline">vs last month</span></span>
        </div>
        {sparkline && (
          <div className="h-8 sm:h-10 w-16 sm:w-20 lg:w-24 flex-shrink-0">
            <SparklineChart data={sparkline} positive={isPositive} />
          </div>
        )}
      </div>
    </div>
  );
}
