'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  ClipboardCheck,
  Mail,
  PackageX,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Wallet
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AnalyticsRange,
  AnalyticsResponse
} from '@/lib/types/dashboard';
import { cn, formatStatus } from '@/lib/utils';
import StatCard from '../StatCard';
import EmptyState from '../EmptyState';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import { formatDate, formatNPR, formatNumber } from '../format';
import { useAdmin } from '../AdminContext';
import { HorizontalBars, OrdersChart, RevenueChart } from './charts';

const RANGES: { value: AnalyticsRange; label: string; period: string }[] = [
  { value: '7d', label: '7 days', period: 'previous 7 days' },
  { value: '30d', label: '30 days', period: 'previous 30 days' },
  { value: '90d', label: '90 days', period: 'previous 90 days' },
  { value: '12m', label: '12 months', period: 'previous 12 months' }
];

function Panel({
  title,
  description,
  action,
  className,
  children
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-xl border bg-card shadow-xs',
        className
      )}
    >
      <header className='flex items-start justify-between gap-4 px-5 pb-2 pt-5'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-base font-semibold text-foreground'>{title}</h2>
          {description && (
            <p className='text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
        {action}
      </header>
      <div className='flex-1 px-5 pb-5 pt-3'>{children}</div>
    </section>
  );
}

/** Greeting in Nepal time, e.g. "Good afternoon" + "Saturday, 3 October". */
function useNepalGreeting() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  if (!now) return { greeting: 'Welcome back', date: '' };
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kathmandu'
    }).format(now)
  );
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Kathmandu'
  }).format(now);
  return { greeting, date };
}

function QueueItem({
  href,
  icon: Icon,
  label,
  count
}: {
  href: string;
  icon: typeof Mail;
  label: string;
  count: number;
}) {
  const active = count > 0;
  return (
    <Link
      href={href}
      className='group flex items-center gap-3 rounded-xl border border-pine-line bg-pine-raised/70 px-4 py-3 outline-none transition-colors hover:bg-pine-raised focus-visible:ring-2 focus-visible:ring-pine-accent'
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-lg',
          active ? 'bg-pine-accent text-pine' : 'bg-white/5 text-pine-muted'
        )}
      >
        <Icon className='size-4' aria-hidden />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block font-display text-xl font-semibold leading-tight text-white'>
          {count}
        </span>
        <span className='block truncate text-xs text-pine-muted'>{label}</span>
      </span>
      <ArrowRight
        className='size-4 text-pine-muted transition-transform group-hover:translate-x-0.5 group-hover:text-pine-foreground'
        aria-hidden
      />
    </Link>
  );
}

function WelcomeBand({
  attention,
  lowStockThreshold
}: {
  attention: AnalyticsResponse['attention'];
  lowStockThreshold: number;
}) {
  const admin = useAdmin();
  const { greeting, date } = useNepalGreeting();
  const firstName = admin?.name?.split(' ')[0];
  const total =
    attention.pendingConfirmation +
    attention.pendingVerification +
    attention.unreadMessages +
    attention.lowStock;

  return (
    <section className='admin-contours relative overflow-hidden rounded-2xl bg-pine px-6 py-6 text-pine-foreground shadow-[0_1px_2px_rgba(15,42,29,0.2),0_12px_32px_-12px_rgba(15,42,29,0.45)] sm:px-8 sm:py-7'>
      <div className='flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
        <div className='flex flex-col gap-2'>
          <p className='text-xs font-medium uppercase tracking-[0.12em] text-pine-accent'>
            {date || 'Today'}
          </p>
          <h2 className='font-display text-[28px] font-semibold leading-tight tracking-tight text-white sm:text-[32px]'>
            {greeting}
            {firstName ? `, ${firstName}` : ''}.
          </h2>
          <p className='max-w-md text-sm text-pine-foreground/70'>
            {total === 0
              ? 'Nothing is waiting on you. Orders, payments and messages are all handled.'
              : `${total} ${total === 1 ? 'item needs' : 'items need'} your attention across orders, messages and stock.`}
          </p>
        </div>
      </div>
      <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <QueueItem
          href='/dashboard/orders'
          icon={ClipboardCheck}
          label='Orders to confirm'
          count={attention.pendingConfirmation}
        />
        <QueueItem
          href='/dashboard/orders'
          icon={Banknote}
          label='Payments to verify'
          count={attention.pendingVerification}
        />
        <QueueItem
          href='/dashboard/contact'
          icon={Mail}
          label='Unread messages'
          count={attention.unreadMessages}
        />
        <QueueItem
          href='/dashboard/products'
          icon={PackageX}
          label={`Low stock (${lowStockThreshold} or fewer)`}
          count={attention.lowStock}
        />
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-32 rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-96 rounded-xl' />
      <div className='grid gap-6 lg:grid-cols-2'>
        <Skeleton className='h-72 rounded-xl' />
        <Skeleton className='h-72 rounded-xl' />
      </div>
    </div>
  );
}

export default function DashboardMain() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
        return res.json() as Promise<AnalyticsResponse>;
      })
      .then(json => {
        setData(json);
        setError(null);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        // Drop the previous range's numbers so the error state is shown.
        setError(err.message);
        setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [range, reloadKey]);

  const period = RANGES.find(r => r.value === range)!;
  const bucketWord =
    data?.bucket === 'month' ? 'month' : data?.bucket === 'week' ? 'week' : 'day';

  const filters = (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <Tabs
        value={range}
        onValueChange={v => setRange(v as AnalyticsRange)}
        aria-label='Reporting period'
      >
        <TabsList>
          {RANGES.map(r => (
            <TabsTrigger key={r.value} value={r.value} className='px-3'>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className='text-xs text-muted-foreground'>
        Revenue counts verified, processing, shipped and delivered orders.
      </p>
    </div>
  );

  if (error && !data) {
    return (
      <div className='flex flex-col gap-6'>
        {filters}
        <div className='rounded-xl border bg-card'>
          <EmptyState
            icon={AlertTriangle}
            title='Analytics could not be loaded'
            description={error}
            action={
              <Button variant='outline' size='sm' onClick={() => setReloadKey(k => k + 1)}>
                <RefreshCw />
                Try again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='flex flex-col gap-6'>
        {filters}
        <DashboardSkeleton />
      </div>
    );
  }

  const { kpis, attention } = data;
  const hasRevenue = data.trend.some(p => p.revenue > 0);
  const hasOrders = data.trend.some(p => p.orders > 0);
  const statusData = data.statusBreakdown
    .filter(s => s.count > 0)
    .map(s => ({ name: formatStatus(s.status), value: s.count }));
  const comparison = `vs ${period.period}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-6 transition-opacity',
        loading && 'pointer-events-none opacity-60'
      )}
      aria-busy={loading}
    >
      <WelcomeBand
        attention={attention}
        lowStockThreshold={data.lowStockThreshold}
      />

      {filters}

      {/* Headline numbers for the selected period */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Revenue'
          value={formatNPR(kpis.revenue.value)}
          icon={Wallet}
          current={kpis.revenue.value}
          previous={kpis.revenue.previous}
          comparisonLabel={comparison}
        />
        <StatCard
          label='Orders placed'
          value={formatNumber(kpis.orders.value)}
          icon={ShoppingBag}
          current={kpis.orders.value}
          previous={kpis.orders.previous}
          comparisonLabel={comparison}
        />
        <StatCard
          label='Paid orders'
          value={formatNumber(kpis.paidOrders.value)}
          icon={BadgeCheck}
          current={kpis.paidOrders.value}
          previous={kpis.paidOrders.previous}
          comparisonLabel={comparison}
        />
        <StatCard
          label='Average order value'
          value={formatNPR(kpis.aov.value)}
          icon={Receipt}
          current={kpis.aov.value}
          previous={kpis.aov.previous}
          comparisonLabel={comparison}
        />
      </div>

      <Panel
        title='Revenue'
        description={`Earned revenue per ${bucketWord}, last ${period.label}.`}
        action={
          <div className='hidden text-right sm:block'>
            <p className='text-xs text-muted-foreground'>Total</p>
            <p className='text-lg font-semibold text-foreground'>
              {formatNPR(kpis.revenue.value)}
            </p>
          </div>
        }
      >
        {hasRevenue ? (
          <RevenueChart data={data.trend} />
        ) : (
          <EmptyState
            icon={Wallet}
            title='No revenue in this period'
            description='Try a longer period to see past sales.'
          />
        )}
      </Panel>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Panel
          title='Orders'
          description={`Orders placed per ${bucketWord}, any status.`}
        >
          {hasOrders ? (
            <OrdersChart data={data.trend} />
          ) : (
            <EmptyState icon={ShoppingBag} title='No orders in this period' />
          )}
        </Panel>

        <Panel
          title='Order status'
          description='Where this period’s orders are now.'
        >
          {statusData.length ? (
            <HorizontalBars
              data={statusData}
              valueFormatter={formatNumber}
              caption='Orders by status'
              valueLabel='Orders'
            />
          ) : (
            <EmptyState icon={ClipboardCheck} title='No orders in this period' />
          )}
        </Panel>
      </div>

      <div className='grid gap-6 lg:grid-cols-5'>
        <Panel
          className='lg:col-span-3'
          title='Top products'
          description='Ranked by earned revenue in this period.'
        >
          {data.topProducts.length ? (
            <HorizontalBars
              data={data.topProducts.map(p => ({ name: p.name, value: p.revenue }))}
              valueFormatter={formatNPR}
              caption='Revenue by product'
              valueLabel='Revenue'
            />
          ) : (
            <EmptyState icon={Receipt} title='No product sales in this period' />
          )}
        </Panel>

        <Panel
          className='lg:col-span-2'
          title='Stock levels'
          description='Lowest stock first.'
          action={
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/products'>Manage</Link>
            </Button>
          }
        >
          <ul className='flex flex-col divide-y'>
            {data.lowStock.map(p => {
              const low = p.stock <= data.lowStockThreshold;
              return (
                <li key={p.id} className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'>
                  <span className='relative size-9 shrink-0 overflow-hidden rounded-md border bg-muted'>
                    {p.image && (
                      <Image src={p.image} alt='' fill sizes='36px' className='object-cover' />
                    )}
                  </span>
                  <span className='min-w-0 flex-1 truncate text-sm font-medium text-foreground'>
                    {p.name}
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-sm tabular-nums',
                      low ? 'font-semibold text-red-700' : 'text-muted-foreground'
                    )}
                  >
                    {low && <AlertTriangle className='size-3.5' aria-label='Low stock' />}
                    {formatNumber(p.stock)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel
        title='Recent orders'
        description='The latest orders placed, newest first.'
        action={
          <Button variant='outline' size='sm' asChild>
            <Link href='/dashboard/orders'>
              View all
              <ArrowRight />
            </Link>
          </Button>
        }
      >
        {data.recentOrders.length ? (
          <div className='-mx-5 overflow-x-auto'>
            <table className='w-full min-w-[560px] text-sm'>
              <thead>
                <tr className='border-y bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  <th className='px-5 py-2.5 font-medium'>Order</th>
                  <th className='px-5 py-2.5 font-medium'>Customer</th>
                  <th className='px-5 py-2.5 font-medium'>Status</th>
                  <th className='px-5 py-2.5 font-medium'>Date</th>
                  <th className='px-5 py-2.5 text-right font-medium'>Total</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {data.recentOrders.map(o => (
                  <tr key={o.id} className='hover:bg-muted/30'>
                    <td className='px-5 py-3 font-mono text-xs text-muted-foreground'>
                      {o.orderNumber}
                    </td>
                    <td className='px-5 py-3 font-medium text-foreground'>
                      {o.name || o.email || 'Guest'}
                    </td>
                    <td className='px-5 py-3'>
                      <OrderStatusBadge status={o.status as OrderStatus} />
                    </td>
                    <td className='px-5 py-3 text-muted-foreground'>
                      {formatDate(o.placedAt)}
                    </td>
                    <td className='px-5 py-3 text-right font-medium tabular-nums text-foreground'>
                      {formatNPR(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ShoppingBag} title='No orders yet' />
        )}
      </Panel>
    </div>
  );
}
