'use client';

import OrdersTable, {
  OrderWithRelations
} from '@/components/dashboard/orders/OrdersTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, ShoppingCart } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { OrderStatus } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/lib/types/product';

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  // totalFiltered is used for pagination/meta; globalTotal is used for the dashboard stat
  const [globalTotal, setGlobalTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [deliveredCount, setDeliveredCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchOrders = useCallback(
    async (
      p: number,
      pp: number,
      filters?: {
        orderId?: string;
        name?: string;
        phone?: string;
        date?: string;
        status?: string;
      }
    ) => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set('page', String(p));
        qs.set('perPage', String(pp));
        if (filters) {
          if (filters.orderId) qs.set('orderId', filters.orderId);
          if (filters.name) qs.set('name', filters.name);
          if (filters.phone) qs.set('phone', filters.phone);
          if (filters.date) qs.set('date', filters.date);
          if (filters.status) qs.set('status', filters.status);
        }
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
        setOrders(payload.data);
        setTotal(payload.meta.total);
        setTotalPages(payload.meta.totalPages);
        setPage(payload.meta.page);
        setPerPage(payload.meta.perPage);
        setInitialLoad(false);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load orders');
        setInitialLoad(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Filters state (controlled inputs)
  const [filterOrderId, setFilterOrderId] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');
  const [filterPhone, setFilterPhone] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // debouncedFilters to avoid firing on every keystroke
  const [debouncedFilters, setDebouncedFilters] = useState({
    orderId: '',
    name: '',
    phone: '',
    date: '',
    status: ''
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters({
        orderId: filterOrderId.trim(),
        name: filterName.trim(),
        phone: filterPhone.trim(),
        date: filterDate.trim(),
        status: filterStatus.trim()
      });
    }, 400);
    return () => clearTimeout(t);
  }, [filterOrderId, filterName, filterPhone, filterDate, filterStatus]);

  // When page/perPage or filters change, fetch orders
  useEffect(() => {
    fetchOrders(page, perPage, debouncedFilters);
  }, [fetchOrders, page, perPage, debouncedFilters]);

  // When filters change, reset to first page (so useEffect above will fetch)
  useEffect(() => {
    setPage(1);
  }, [
    debouncedFilters.orderId,
    debouncedFilters.name,
    debouncedFilters.phone,
    debouncedFilters.date,
    debouncedFilters.status
  ]);

  // helper to fetch counts by status using the paginated endpoint's meta.total
  const fetchCountByStatus = useCallback(async (status: string) => {
    try {
      const res = await fetch(
        `/api/orders?status=${encodeURIComponent(status)}&page=1&perPage=1`
      );
      if (!res.ok) return 0;
      const payload = await res.json();
      return payload.meta?.total ?? 0;
    } catch {
      return 0;
    }
  }, []);

  const fetchGlobalTotal = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?page=1&perPage=1');
      if (!res.ok) return;
      const payload = await res.json();
      setGlobalTotal(payload.meta?.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch global total', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [delivered, pendingA] = await Promise.all([
        fetchCountByStatus('DELIVERED'),
        fetchCountByStatus('PENDING_CONFIRMATION')
      ]);
      const pendingB = await fetchCountByStatus('PROCESSING');
      if (!mounted) return;
      setDeliveredCount(delivered);
      setPendingCount((pendingA ?? 0) + (pendingB ?? 0));
    })();
    fetchGlobalTotal();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCountByStatus, page, perPage]);

  const stats = useMemo(() => {
    return {
      total: globalTotal,
      delivered: deliveredCount,
      pending: pendingCount
    };
  }, [globalTotal, deliveredCount, pendingCount]);

  const handleDelete = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Order deleted');
      fetchOrders(page, perPage, debouncedFilters);
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const handleView = (orderId: number) => {
    setDetailOpen(true);
    fetchOrderDetail(orderId);
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<
    | (OrderWithRelations & {
        items: Array<{
          id: number;
          name: string;
          quantity: number;
          price: number;
          product?: Product;
        }>;
      })
    | null
  >(null);

  const fetchOrderDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDetail(data);
    } catch {
      toast.error('Failed to load order details');
    }
  }, []);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    // optimistic update
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
      // revert by refetching
      fetchOrders(page, perPage, debouncedFilters);
    }
  };

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailOrderId, setEmailOrderId] = useState<number | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const openEmailDialog = (orderId: number) => {
    setEmailOrderId(orderId);
    setEmailSubject('');
    setEmailMessage('');
    setEmailOpen(true);
  };

  const sendCustomEmail = async () => {
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

  return (
    <div className='space-y-6 p-6'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Delivered</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoad ? (
            <div className='flex justify-center py-8'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
            </div>
          ) : (
            <div>
              <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-5'>
                <Input
                  placeholder='Order #'
                  value={filterOrderId}
                  onChange={e => setFilterOrderId(e.target.value)}
                />
                <Input
                  placeholder='Customer name'
                  value={filterName}
                  onChange={e => setFilterName(e.target.value)}
                />
                <Input
                  placeholder='Phone'
                  value={filterPhone}
                  onChange={e => setFilterPhone(e.target.value)}
                />
                <Input
                  type='date'
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
                <div className='flex items-center gap-2'>
                  <select
                    className='w-full rounded border px-2 py-1 text-sm'
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value=''>All statuses</option>
                    <option value='PENDING_CONFIRMATION'>
                      Pending Confirmation
                    </option>
                    <option value='PENDING_VERIFICATION'>
                      Pending Verification
                    </option>
                    <option value='VERIFIED'>Verified</option>
                    <option value='REJECTED'>Rejected</option>
                    <option value='PROCESSING'>Processing</option>
                    <option value='SHIPPED'>Shipped</option>
                    <option value='DELIVERED'>Delivered</option>
                    <option value='CANCELLED'>Cancelled</option>
                  </select>
                  <button
                    className='rounded border px-3 py-1 text-sm'
                    onClick={() => {
                      setFilterOrderId('');
                      setFilterName('');
                      setFilterPhone('');
                      setFilterDate('');
                      setFilterStatus('');
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <OrdersTable
                orders={orders}
                loading={loading}
                skeletonRows={perPage}
                onDelete={handleDelete}
                onView={handleView}
                onStatusChange={handleStatusChange}
                onEmail={id => openEmailDialog(id)}
              />

              <div className='mt-4 flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  Showing page {page} of {totalPages} — {total} orders
                </div>
                <div className='flex items-center gap-2'>
                  <select
                    className='rounded border px-2 py-1 text-sm'
                    value={perPage}
                    onChange={e => setPerPage(parseInt(e.target.value, 10))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className='flex items-center gap-2'>
                    <button
                      className='rounded border px-3 py-1 text-sm'
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className='rounded border px-3 py-1 text-sm'
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <div className='text-muted-foreground'>Order #</div>
                  <div className='font-medium'>{detail.orderNumber}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Customer</div>
                  <div className='font-medium'>
                    {detail.name ?? detail.user?.name ?? '-'}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Email</div>
                  <div className='font-medium'>
                    {detail.email ?? detail.user?.email ?? '-'}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Phone</div>
                  <div className='font-medium'>{detail.phone ?? '-'}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Total</div>
                  <div className='font-medium'>Rs. {detail.total}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Delivery Cost:</div>
                  <div className='font-medium'>Rs. {detail.shipping}</div>
                </div>
              </div>

              <div>
                <div className='mb-2 text-sm font-semibold'>Items</div>
                <div className='space-y-2'>
                  {detail.items?.map(it => (
                    <div
                      key={it.id}
                      className='flex items-center justify-between rounded border p-2 text-sm'
                    >
                      <div className='flex-1'>
                        <div className='font-medium'>{it.name}</div>
                        <div className='text-muted-foreground'>
                          Qty: {it.quantity}
                        </div>
                      </div>
                      <div className='w-24 text-right'>Rs. {it.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <div className='text-muted-foreground'>Shipping Address</div>
                  <div className='whitespace-pre-wrap font-medium'>
                    {detail.shippingAddress || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Note</div>
                  <div className='whitespace-pre-wrap font-medium'>
                    {detail.note || '-'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              Loading...
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <Input
              placeholder='Subject'
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
            />
            <Textarea
              placeholder='Message'
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
            />
            <div className='flex justify-end gap-2'>
              <Button variant='secondary' onClick={() => setEmailOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendCustomEmail} disabled={emailSending}>
                {emailSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
