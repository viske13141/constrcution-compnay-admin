import React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface StatTileProps {
  label: string;
  value: string | number;
  comparison: string;
  trend?: 'up' | 'down' | 'neutral';
  trendTone?: 'positive' | 'negative' | 'neutral' | 'warning';
  onClick?: () => void;
  className?: string;
}

export function StatTile({
  label,
  value,
  comparison,
  trend = 'neutral',
  trendTone = 'neutral',
  onClick,
  className,
}: StatTileProps) {
  const toneColor =
    trendTone === 'positive'
      ? 'text-[#16A34A]'
      : trendTone === 'negative'
      ? 'text-[#DC2626]'
      : trendTone === 'warning'
      ? 'text-[#D97706]'
      : 'text-[#64748B]';

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : ArrowRight;

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'text-left bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 transition-colors duration-150 w-full',
        onClick && 'hover:border-[#2563EB]/50 hover:bg-slate-50/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#64748B] truncate">{label}</span>
        {onClick && (
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        )}
      </div>
      <div className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight text-[#172B4D] tabular-nums">
        {value}
      </div>
      <div className={cn('mt-1 flex items-center gap-1 text-xs tabular-nums', toneColor)}>
        <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{comparison}</span>
      </div>
    </Comp>
  );
}
