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

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: OrderWithRelations[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const pending = orders.filter(
      o => o.status === 'PENDING_CONFIRMATION' || o.status === 'PROCESSING'
    ).length;
    return { total, delivered, pending };
  }, [orders]);

  const handleDelete = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Order deleted');
      fetchOrders();
    } catch (e) {
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
          product?: any;
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
    } catch (e) {
      toast.error('Failed to update status');
      // revert by refetching
      fetchOrders();
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
            <Package className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Delivered</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <ShoppingCart className='text-muted-foreground h-4 w-4' />
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
          {loading ? (
            <div className='flex justify-center py-8'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
            </div>
          ) : (
            <OrdersTable
              orders={orders}
              onDelete={handleDelete}
              onView={handleView}
              onStatusChange={handleStatusChange}
              onEmail={id => openEmailDialog(id)}
            />
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
                  <div className='font-medium whitespace-pre-wrap'>
                    {detail.shippingAddress || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Note</div>
                  <div className='font-medium whitespace-pre-wrap'>
                    {detail.note || '-'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground py-6 text-center text-sm'>
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
