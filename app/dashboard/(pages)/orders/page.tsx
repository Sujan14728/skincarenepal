'use client';

import OrdersTable, {
  OrderWithRelations,
  PAYMENT_METHOD_LABEL,
  PaymentMethodBadge,
  itemCount
} from '@/components/dashboard/orders/OrdersTable';
import { OrderDetailActions } from '@/components/dashboard/orders/OrderActions';
import OrderStatusBadge from '@/components/dashboard/orders/OrderStatusBadge';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import FormSheet from '@/components/dashboard/FormSheet';
import {
  Field,
  FormBody,
  FormFooter,
  FormSection
} from '@/components/dashboard/form';
import {
  formatDateTime,
  formatNPR,
  formatNumber
} from '@/components/dashboard/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  ImageOff,
  Loader2,
  PackageCheck,
  Search,
  ShoppingBag,
  Truck,
  X
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { OrderStatus } from '@prisma/client';
import { cn } from '@/lib/utils';
import { refreshAdminCounts } from '@/components/dashboard/AdminContext';

type SearchField = 'orderId' | 'name' | 'phone';

const SEARCH_FIELDS: { value: SearchField; label: string; placeholder: string }[] =
  [
    {
      value: 'name',
      label: 'Customer',
      placeholder: 'Search by customer name'
    },
    {
      value: 'orderId',
      label: 'Order #',
      placeholder: 'Exact order number, e.g. facepack-12345'
    },
    { value: 'phone', label: 'Phone', placeholder: 'Search by phone number' }
  ];

// The list API filters on a single status, so each tab maps to one status.
const STATUS_TABS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING_CONFIRMATION', label: 'To confirm' },
  { value: 'PENDING_VERIFICATION', label: 'To verify' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' }
];

type Counts = Record<OrderStatus | 'ALL', number>;

const ALL_STATUSES = STATUS_TABS.filter(t => t.value !== '').map(
  t => t.value as OrderStatus
);

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [counts, setCounts] = useState<Counts | null>(null);
  const requestId = useRef(0);

  // Filters: text inputs are debounced, status tabs apply immediately.
  const [searchField, setSearchField] = useState<SearchField>('name');
  const [searchText, setSearchText] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [debounced, setDebounced] = useState({
    field: 'name' as SearchField,
    text: '',
    date: ''
  });

  useEffect(() => {
    const next = {
      field: searchField,
      text: searchText.trim(),
      date: filterDate.trim()
    };
    if (
      next.text === debounced.text &&
      next.date === debounced.date &&
      (next.field === debounced.field || !next.text)
    ) {
      return;
    }
    const t = setTimeout(() => {
      setDebounced(next);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchField, searchText, filterDate, debounced]);

  const fetchOrders = useCallback(async () => {
    const id = ++requestId.current;
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('perPage', String(perPage));
      if (debounced.text) qs.set(debounced.field, debounced.text);
      if (debounced.date) qs.set('date', debounced.date);
      if (filterStatus) qs.set('status', filterStatus);
      const res = await fetch(`/api/orders?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const payload: {
        data: OrderWithRelations[];
        meta: {
          page: number;
          perPage: number;
          total: number;
          totalPages: number;
        };
      } = await res.json();
      if (id !== requestId.current) return;
      setOrders(payload.data);
      setTotal(payload.meta.total);
      setTotalPages(payload.meta.totalPages);
    } catch (err) {
      console.error(err);
      if (id === requestId.current) toast.error('Failed to load orders');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, perPage, debounced, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Per-status totals from the paginated endpoint's meta.total.
  const fetchCounts = useCallback(async () => {
    const countFor = async (status?: OrderStatus) => {
      try {
        const qs = status
          ? `status=${encodeURIComponent(status)}&page=1&perPage=1`
          : 'page=1&perPage=1';
        const res = await fetch(`/api/orders?${qs}`);
        if (!res.ok) return 0;
        const payload = await res.json();
        return (payload.meta?.total ?? 0) as number;
      } catch {
        return 0;
      }
    };
    const [all, ...byStatus] = await Promise.all([
      countFor(),
      ...ALL_STATUSES.map(s => countFor(s))
    ]);
    const next = { ALL: all } as Counts;
    ALL_STATUSES.forEach((s, i) => (next[s] = byStatus[i]));
    setCounts(next);
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // ---- Detail drawer ----
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<OrderWithRelations | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrderDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDetail(prev => (prev === null || prev.id === id ? data : prev));
    } catch {
      toast.error('Failed to load order details');
    }
  }, []);

  const handleView = (orderId: number) => {
    // Show what the list already has, then refresh from the detail endpoint.
    setDetail(orders.find(o => o.id === orderId) ?? null);
    setDetailOpen(true);
    fetchOrderDetail(orderId);
  };

  const handleDelete = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Order deleted');
      refreshAdminCounts();
      if (detail?.id === orderId) setDetailOpen(false);
      fetchOrders();
      fetchCounts();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    // optimistic update
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    setDetail(prev => (prev?.id === orderId ? { ...prev, status } : prev));
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Order status updated');
      refreshAdminCounts();
    } catch {
      toast.error('Failed to update status');
      // revert by refetching
      fetchOrders();
      if (detail?.id === orderId) fetchOrderDetail(orderId);
    } finally {
      setUpdatingStatus(false);
      fetchCounts();
    }
  };

  // ---- Custom email ----
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailOrderId, setEmailOrderId] = useState<number | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const emailOrder =
    (detail?.id === emailOrderId ? detail : null) ??
    orders.find(o => o.id === emailOrderId) ??
    null;
  const emailRecipient = emailOrder?.email ?? emailOrder?.user?.email;

  const openEmailDialog = (orderId: number) => {
    setEmailOrderId(orderId);
    setEmailSubject('');
    setEmailMessage('');
    setEmailOpen(true);
  };

  const sendCustomEmail = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!emailOrderId || !emailSubject || !emailMessage) return;
    setEmailSending(true);
    try {
      const res = await fetch('/api/orders/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: emailOrderId,
          subject: emailSubject,
          message: emailMessage
        })
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Email sent');
      setEmailOpen(false);
    } catch {
      toast.error('Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const hasFilters = Boolean(searchText || filterDate || filterStatus);
  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
    setFilterStatus('');
    setPage(1);
  };

  const activeSearch = SEARCH_FIELDS.find(f => f.value === searchField)!;
  const firstRow = total === 0 ? 0 : (page - 1) * perPage + 1;
  const lastRow = Math.min(page * perPage, total);
  const inProgress = counts
    ? counts.VERIFIED + counts.PROCESSING + counts.SHIPPED
    : 0;

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Orders'
        description='Verify payments, update statuses and track deliveries.'
      />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {counts ? (
          <>
            <StatCard
              label='Awaiting confirmation'
              value={formatNumber(counts.PENDING_CONFIRMATION)}
              icon={ClipboardCheck}
              hint='Customer has not confirmed by email yet'
            />
            <StatCard
              label='To verify'
              value={formatNumber(counts.PENDING_VERIFICATION)}
              icon={Banknote}
              hint='Confirmed orders waiting on your check'
            />
            <StatCard
              label='In progress'
              value={formatNumber(inProgress)}
              icon={Truck}
              hint='Verified, processing or shipped'
            />
            <StatCard
              label='Delivered'
              value={formatNumber(counts.DELIVERED)}
              icon={PackageCheck}
              hint={`Out of ${formatNumber(counts.ALL)} orders in total`}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-[132px] rounded-xl' />
          ))
        )}
      </div>

      <section className='rounded-xl border bg-card shadow-xs'>
        <div className='flex flex-col gap-3 border-b p-4'>
          <div className='-mx-1 overflow-x-auto px-1 pb-0.5'>
            <Tabs
              value={filterStatus || 'ALL'}
              onValueChange={value => {
                setFilterStatus(value === 'ALL' ? '' : (value as OrderStatus));
                setPage(1);
              }}
            >
              <TabsList>
                {STATUS_TABS.map(tab => {
                  const count = counts?.[tab.value || 'ALL'];
                  return (
                    <TabsTrigger
                      key={tab.value || 'ALL'}
                      value={tab.value || 'ALL'}
                      className='group px-3'
                    >
                      {tab.label}
                      {count !== undefined && (
                        <span className='rounded-full bg-foreground/5 px-1.5 text-xs tabular-nums text-muted-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary'>
                          {formatNumber(count)}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className='flex flex-col gap-2 md:flex-row md:items-center'>
            <div className='flex min-w-0 flex-1 md:max-w-xl'>
              <Select
                value={searchField}
                onValueChange={value => setSearchField(value as SearchField)}
              >
                <SelectTrigger
                  className='w-[124px] shrink-0 rounded-r-none border-r-0 bg-muted/40'
                  aria-label='Search by'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SEARCH_FIELDS.map(f => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className='relative min-w-0 flex-1'>
                <Search
                  className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  type='search'
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder={activeSearch.placeholder}
                  aria-label={`Search orders by ${activeSearch.label.toLowerCase()}`}
                  className='rounded-l-none pl-9'
                />
              </div>
            </div>
            <Input
              type='date'
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              aria-label='Placed on date'
              className='md:w-44'
            />
            {hasFilters && (
              <Button
                variant='ghost'
                onClick={clearFilters}
                className='text-muted-foreground md:ml-auto'
              >
                <X />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {!loading && orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={hasFilters ? 'No orders match these filters' : 'No orders yet'}
            description={
              hasFilters
                ? 'Try another status, search term or date.'
                : 'Orders placed on the storefront will show up here.'
            }
            action={
              hasFilters ? (
                <Button variant='outline' size='sm' onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <OrdersTable
            orders={orders}
            loading={loading}
            skeletonRows={Math.min(perPage, 10)}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
            onEmail={openEmailDialog}
          />
        )}

        <div className='flex flex-col gap-3 border-t px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p className='tabular-nums'>
            {total === 0
              ? 'No orders'
              : `Showing ${formatNumber(firstRow)}–${formatNumber(lastRow)} of ${formatNumber(total)} orders`}
          </p>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span>Rows per page</span>
              <Select
                value={String(perPage)}
                onValueChange={value => {
                  setPerPage(parseInt(value, 10));
                  setPage(1);
                }}
              >
                <SelectTrigger size='sm' className='w-[72px]' aria-label='Rows per page'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[10, 20, 50, 100].map(n => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <span className='tabular-nums'>
              Page {page} of {totalPages}
            </span>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='icon-sm'
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                aria-label='Previous page'
              >
                <ChevronLeft />
              </Button>
              <Button
                variant='outline'
                size='icon-sm'
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                aria-label='Next page'
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FormSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        size='lg'
        title={detail ? `Order ${detail.orderNumber}` : 'Order details'}
        description={
          detail?.placedAt
            ? `Placed ${formatDateTime(detail.placedAt)}`
            : undefined
        }
      >
        {detail ? (
          <div className='flex min-h-0 flex-1 flex-col'>
            <OrderDetailBody order={detail} />
            <FormFooter>
              <OrderDetailActions
                orderNumber={detail.orderNumber}
                status={detail.status}
                updating={updatingStatus}
                onStatusChange={status =>
                  handleStatusChange(detail.id, status)
                }
                onEmail={() => openEmailDialog(detail.id)}
              />
            </FormFooter>
          </div>
        ) : (
          <FormBody>
            <Skeleton className='h-20 rounded-xl' />
            <Skeleton className='h-40 rounded-xl' />
            <Skeleton className='h-56 rounded-xl' />
          </FormBody>
        )}
      </FormSheet>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <form onSubmit={sendCustomEmail} className='flex flex-col gap-6'>
            <DialogHeader>
              <DialogTitle>Send email</DialogTitle>
              <DialogDescription>
                {emailRecipient
                  ? `To ${emailRecipient}${emailOrder ? ` about order ${emailOrder.orderNumber}` : ''}.`
                  : 'Write a message to the customer about this order.'}
              </DialogDescription>
            </DialogHeader>
            <div className='flex flex-col gap-5'>
              <Field label='Subject' htmlFor='email-subject' required>
                <Input
                  id='email-subject'
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder='e.g. Your order is on its way'
                />
              </Field>
              <Field label='Message' htmlFor='email-message' required>
                <Textarea
                  id='email-message'
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  rows={6}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEmailOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={emailSending || !emailSubject || !emailMessage}
              >
                {emailSending && <Loader2 className='animate-spin' />}
                {emailSending ? 'Sending…' : 'Send email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;

function InfoItem({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
      <dd className='break-words text-sm text-foreground'>{children}</dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        strong
          ? 'border-t pt-3 text-base font-semibold text-foreground'
          : 'text-muted-foreground'
      )}
    >
      <dt>{label}</dt>
      <dd className='tabular-nums text-foreground'>{value}</dd>
    </div>
  );
}

function OrderDetailBody({ order }: { order: OrderWithRelations }) {
  const customer = order.name ?? order.user?.name ?? 'Guest';
  const email = order.email ?? order.user?.email;
  const count = itemCount(order);
  const timeline = [
    { label: 'Placed', at: order.placedAt ?? order.createdAt },
    { label: 'Verified', at: order.verifiedAt },
    { label: 'Last updated', at: order.updatedAt }
  ];

  return (
    <FormBody>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-muted/30 px-4 py-3'>
        <OrderStatusBadge status={order.status} />
        <PaymentMethodBadge method={order.paymentMethod} />
        <span className='ml-auto text-lg font-semibold tabular-nums text-foreground'>
          {formatNPR(order.total)}
        </span>
      </div>

      <FormSection title='Customer & shipping'>
        <dl className='grid gap-x-6 gap-y-4 sm:grid-cols-2'>
          <InfoItem label='Name'>
            {customer}
            {order.user && (
              <span className='ml-1.5 text-xs text-muted-foreground'>
                (registered customer)
              </span>
            )}
          </InfoItem>
          <InfoItem label='Phone'>
            {order.phone ? (
              <a
                href={`tel:${order.phone}`}
                className='hover:text-primary hover:underline'
              >
                {order.phone}
              </a>
            ) : (
              '—'
            )}
          </InfoItem>
          <InfoItem label='Email' className='sm:col-span-2'>
            {email ? (
              <a
                href={`mailto:${email}`}
                className='hover:text-primary hover:underline'
              >
                {email}
              </a>
            ) : (
              '—'
            )}
          </InfoItem>
          <InfoItem label='Shipping address' className='sm:col-span-2'>
            <span className='whitespace-pre-wrap'>
              {order.shippingAddress || '—'}
            </span>
          </InfoItem>
        </dl>
      </FormSection>

      <FormSection
        title='Items'
        description={
          count !== undefined
            ? `${count} ${count === 1 ? 'item' : 'items'}`
            : undefined
        }
      >
        {order.items && order.items.length > 0 ? (
          <ul className='flex flex-col divide-y rounded-xl border'>
            {order.items.map(item => {
              const image = item.product?.images?.[0];
              return (
                <li key={item.id} className='flex items-center gap-3 px-4 py-3'>
                  <span className='relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted'>
                    {image && (
                      <Image
                        src={image}
                        alt=''
                        fill
                        sizes='40px'
                        className='object-cover'
                      />
                    )}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-foreground'>
                      {item.name}
                    </p>
                    <p className='text-sm tabular-nums text-muted-foreground'>
                      {item.quantity} × {formatNPR(item.price)}
                    </p>
                  </div>
                  <p className='text-sm font-medium tabular-nums text-foreground'>
                    {formatNPR(item.quantity * item.price)}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='text-sm text-muted-foreground'>
            No line items on this order.
          </p>
        )}
        <dl className='ml-auto flex w-full max-w-xs flex-col gap-2 text-sm'>
          <SummaryRow label='Subtotal' value={formatNPR(order.subtotal)} />
          {order.discount > 0 && (
            <SummaryRow
              label='Discount'
              value={`− ${formatNPR(order.discount)}`}
            />
          )}
          <SummaryRow
            label='Shipping'
            value={order.shipping > 0 ? formatNPR(order.shipping) : 'Free'}
          />
          <SummaryRow label='Total' value={formatNPR(order.total)} strong />
        </dl>
      </FormSection>

      <FormSection
        title='Payment'
        description={PAYMENT_METHOD_LABEL[order.paymentMethod]}
      >
        {order.paymentSlipUrl ? (
          <div className='flex flex-col gap-2'>
            <a
              href={order.paymentSlipUrl}
              target='_blank'
              rel='noreferrer'
              className='group relative block aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
            >
              <Image
                src={order.paymentSlipUrl}
                alt={`Payment slip for order ${order.orderNumber}`}
                fill
                sizes='384px'
                className='object-contain transition-opacity group-hover:opacity-90'
              />
            </a>
            <a
              href={order.paymentSlipUrl}
              target='_blank'
              rel='noreferrer'
              className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline'
            >
              <ExternalLink className='size-3.5' aria-hidden />
              Open full size
            </a>
          </div>
        ) : (
          <div className='flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground'>
            <ImageOff className='size-4 shrink-0' aria-hidden />
            {order.paymentMethod === 'ONLINE'
              ? 'No payment slip was uploaded with this order.'
              : 'Cash on delivery — no payment slip needed.'}
          </div>
        )}
      </FormSection>

      {order.note && (
        <FormSection title='Customer note'>
          <p className='whitespace-pre-wrap rounded-xl bg-muted/40 px-4 py-3 text-sm text-foreground'>
            {order.note}
          </p>
        </FormSection>
      )}

      <FormSection title='Timeline'>
        <ol className='flex flex-col gap-3'>
          {timeline.map(step => (
            <li key={step.label} className='flex items-center gap-3 text-sm'>
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  step.at ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                aria-hidden
              />
              <span className='w-28 shrink-0 text-muted-foreground'>
                {step.label}
              </span>
              <span
                className={step.at ? 'text-foreground' : 'text-muted-foreground'}
              >
                {step.at ? formatDateTime(step.at) : 'Not yet'}
              </span>
            </li>
          ))}
        </ol>
      </FormSection>
    </FormBody>
  );
}
