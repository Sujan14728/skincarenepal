'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarX,
  Copy,
  Pencil,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Coupon } from '@/lib/types/coupon';
import CouponForm from '@/components/dashboard/coupons/CouponForm';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';
import FormSheet from '@/components/dashboard/FormSheet';
import {
  formatDate,
  formatNPR,
  formatNumber
} from '@/components/dashboard/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type CouponRow = Coupon & {
  product?: { id: number; name: string } | null;
};

type CouponStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

const STATUS_META: Record<
  CouponStatus,
  { label: string; variant: 'success' | 'blue' | 'secondary' | 'outline' }
> = {
  active: { label: 'Active', variant: 'success' },
  scheduled: { label: 'Scheduled', variant: 'blue' },
  expired: { label: 'Expired', variant: 'secondary' },
  disabled: { label: 'Disabled', variant: 'outline' }
};

const FILTERS = ['all', 'active', 'scheduled', 'expired', 'disabled'] as const;
type Filter = (typeof FILTERS)[number];

/** Mirrors the checkout rule: active flag, started, and not past validUntil. */
function getStatus(c: Coupon, now = Date.now()): CouponStatus {
  if (!c.isActive) return 'disabled';
  if (c.validUntil && new Date(c.validUntil).getTime() < now) return 'expired';
  if (c.validFrom && new Date(c.validFrom).getTime() > now) return 'scheduled';
  return 'active';
}

const formatDiscount = (c: Coupon) =>
  c.discountType === 'PERCENTAGE'
    ? `${c.discountValue}% off`
    : `${formatNPR(Number(c.discountValue))} off`;

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Failed to load coupons');
        setCoupons([]);
        return;
      }
      const list = Array.isArray(data?.coupons)
        ? data.coupons
        : Array.isArray(data)
          ? data
          : [];
      setCoupons(list);
    } catch (err) {
      console.error('Load coupons failed:', err);
      toast.error('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Could not delete the coupon. Please try again.');
      return;
    }
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast.success('Coupon deleted');
  };

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleFormSubmit = () => {
    fetchCoupons();
    handleFormClose();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied');
    } catch {
      toast.error('Could not copy the code. Select it and copy manually.');
    }
  };

  const withStatus = useMemo(
    () => coupons.map(c => ({ coupon: c, status: getStatus(c) })),
    [coupons]
  );

  const stats = useMemo(
    () => ({
      active: withStatus.filter(r => r.status === 'active').length,
      scheduled: withStatus.filter(r => r.status === 'scheduled').length,
      expired: withStatus.filter(r => r.status === 'expired').length,
      redemptions: coupons.reduce((sum, c) => sum + (c.usedCount ?? 0), 0)
    }),
    [withStatus, coupons]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withStatus.filter(
      ({ coupon, status }) =>
        (filter === 'all' || status === filter) &&
        (!q || coupon.code.toLowerCase().includes(q))
    );
  }, [withStatus, filter, query]);

  const filtered = filter !== 'all' || query.trim() !== '';

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Coupons'
        description='Create discount codes customers can apply at checkout.'
        actions={
          <Button onClick={handleCreate}>
            <Plus />
            Create coupon
          </Button>
        }
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-[126px] rounded-xl' />
          ))
        ) : (
          <>
            <StatCard
              label='Active coupons'
              value={formatNumber(stats.active)}
              icon={TicketPercent}
              hint={
                stats.scheduled
                  ? `${stats.scheduled} scheduled to start`
                  : 'Usable at checkout right now'
              }
            />
            <StatCard
              label='Expired'
              value={formatNumber(stats.expired)}
              icon={CalendarX}
              hint='Past their end date'
            />
            <StatCard
              label='Total redemptions'
              value={formatNumber(stats.redemptions)}
              icon={TrendingUp}
              hint='Across all coupons'
            />
          </>
        )}
      </div>

      <section className='overflow-hidden rounded-xl border bg-card shadow-xs'>
        <div className='flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:max-w-xs'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search by code'
              aria-label='Search coupons'
              className='pl-9'
            />
          </div>
          <Tabs value={filter} onValueChange={v => setFilter(v as Filter)}>
            <TabsList className='max-w-full overflow-x-auto'>
              {FILTERS.map(f => (
                <TabsTrigger key={f} value={f} className='px-3'>
                  {f === 'all' ? 'All' : STATUS_META[f].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className='flex flex-col divide-y'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-6 px-5 py-4'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='hidden h-4 w-32 md:block' />
                <Skeleton className='hidden h-2 w-24 md:block' />
                <Skeleton className='ml-auto h-5 w-16 rounded-md' />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          filtered && coupons.length > 0 ? (
            <EmptyState
              icon={Search}
              title='No coupons match your filters'
              description='Try a different status or search term.'
              action={
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={TicketPercent}
              title='No coupons yet'
              description='Create a discount code to share with customers or run a promotion.'
              action={
                <Button size='sm' onClick={handleCreate}>
                  <Plus />
                  Create coupon
                </Button>
              }
            />
          )
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[920px] text-sm'>
              <thead>
                <tr className='border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  <th className='px-5 py-2.5 font-medium'>Code</th>
                  <th className='px-5 py-2.5 font-medium'>Discount</th>
                  <th className='px-5 py-2.5 font-medium'>Conditions</th>
                  <th className='px-5 py-2.5 font-medium'>Usage</th>
                  <th className='px-5 py-2.5 font-medium'>Validity</th>
                  <th className='px-5 py-2.5 font-medium'>Status</th>
                  <th className='px-5 py-2.5 text-right font-medium'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {visible.map(({ coupon: c, status }) => (
                  <tr key={c.id} className='hover:bg-muted/30'>
                    <td className='px-5 py-3'>
                      <div className='flex items-center gap-1'>
                        <span className='font-mono text-sm font-medium tracking-wide text-foreground'>
                          {c.code}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          className='size-7 text-muted-foreground'
                          onClick={() => copyCode(c.code)}
                          aria-label={`Copy code ${c.code}`}
                        >
                          <Copy className='size-3.5' />
                        </Button>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-5 py-3 font-medium tabular-nums text-foreground'>
                      {formatDiscount(c)}
                    </td>
                    <td className='px-5 py-3 text-sm text-muted-foreground'>
                      <Conditions coupon={c} />
                    </td>
                    <td className='px-5 py-3'>
                      <Usage used={c.usedCount ?? 0} limit={c.usageLimit} />
                    </td>
                    <td className='whitespace-nowrap px-5 py-3 text-sm text-muted-foreground'>
                      {c.validFrom ? formatDate(c.validFrom) : 'Now'}
                      {' – '}
                      {c.validUntil ? formatDate(c.validUntil) : 'No end date'}
                    </td>
                    <td className='px-5 py-3'>
                      <Badge variant={STATUS_META[status].variant}>
                        {STATUS_META[status].label}
                      </Badge>
                    </td>
                    <td className='px-5 py-3'>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => handleEdit(c)}
                          aria-label={`Edit coupon ${c.code}`}
                        >
                          <Pencil />
                        </Button>
                        <ConfirmDelete
                          title={`Delete coupon ${c.code}?`}
                          description='Customers will no longer be able to use this code. This can’t be undone — disable it instead if you might need it again.'
                          confirmLabel='Delete coupon'
                          onConfirm={() => handleDelete(c.id!)}
                        >
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`Delete coupon ${c.code}`}
                            className='text-muted-foreground hover:text-destructive'
                          >
                            <Trash2 />
                          </Button>
                        </ConfirmDelete>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <FormSheet
        open={showForm}
        onOpenChange={o => !o && handleFormClose()}
        title={editing ? 'Edit coupon' : 'Create coupon'}
        description='Discount codes are checked at checkout against the dates, usage limit and product below.'
      >
        {showForm && (
          <CouponForm
            key={editing?.id ?? 'new'}
            coupon={editing}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormSheet>
    </div>
  );
}

function Conditions({ coupon }: { coupon: CouponRow }) {
  const parts: string[] = [];
  if (coupon.minPurchase)
    parts.push(`Min. spend ${formatNPR(Number(coupon.minPurchase))}`);
  if (coupon.product?.name) parts.push(coupon.product.name);
  else if (coupon.productId) parts.push('One product');

  if (!parts.length) return <span>All orders</span>;
  return (
    <div className='flex max-w-[220px] flex-col gap-0.5'>
      {parts.map(p => (
        <span key={p} className='truncate'>
          {p}
        </span>
      ))}
    </div>
  );
}

function Usage({ used, limit }: { used: number; limit?: number | '' }) {
  const max = typeof limit === 'number' && limit > 0 ? limit : null;
  const pct = max ? Math.min(100, (used / max) * 100) : 0;
  return (
    <div className='flex w-28 flex-col gap-1.5'>
      <span className='text-sm tabular-nums text-foreground'>
        {formatNumber(used)}
        <span className='text-muted-foreground'>
          {' / '}
          {max ? formatNumber(max) : 'Unlimited'}
        </span>
      </span>
      {max && (
        <div
          className='h-1 w-full overflow-hidden rounded-full bg-muted'
          role='progressbar'
          aria-label='Usage'
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={used}
        >
          <div
            className={cn(
              'h-full rounded-full',
              pct >= 100 ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
