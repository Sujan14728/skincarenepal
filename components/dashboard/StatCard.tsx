import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { percentChange } from './format';

type StatCardProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Shows a signed % change against `previous` when both are given. */
  current?: number;
  previous?: number;
  comparisonLabel?: string;
  hint?: string;
  href?: string;
};

/** Stat tile: small label, large value, optional delta vs a named period. */
export default function StatCard({
  label,
  value,
  icon: Icon,
  current,
  previous,
  comparisonLabel = 'vs previous period',
  hint,
  href
}: StatCardProps) {
  const change =
    current !== undefined && previous !== undefined
      ? percentChange(current, previous)
      : undefined;

  const body = (
    <div className='flex h-full flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs transition-colors'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm font-medium text-muted-foreground'>{label}</p>
        {Icon && (
          <span className='grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground'>
            <Icon className='size-4' aria-hidden />
          </span>
        )}
      </div>
      <p className='font-display text-[28px] font-semibold leading-none tracking-tight text-foreground'>
        {value}
      </p>
      {change !== undefined ? (
        <p className='flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
          {change === null ? (
            <span>No data for the previous period</span>
          ) : (
            <>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium',
                  change >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                {change >= 0 ? (
                  <ArrowUpRight className='size-3' aria-hidden />
                ) : (
                  <ArrowDownRight className='size-3' aria-hidden />
                )}
                {change >= 0 ? '+' : ''}
                {Math.abs(change) >= 100
                  ? Math.round(change)
                  : change.toFixed(1)}
                %
              </span>
              <span>{comparisonLabel}</span>
            </>
          )}
        </p>
      ) : (
        hint && <p className='text-xs text-muted-foreground'>{hint}</p>
      )}
    </div>
  );

  return href ? (
    <Link
      href={href}
      className='block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>div]:hover:border-primary/40'
    >
      {body}
    </Link>
  ) : (
    body
  );
}
