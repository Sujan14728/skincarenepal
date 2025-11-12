'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { formatStatus, orderStatusVariant } from '@/lib/utils';

type Order = {
  id: number;
  orderNumber: string;
  name: string | null;
  email: string | null;
  total: number;
  status: string;
  createdAt: string;
};

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/recent-orders')
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => setError(err.message || 'Failed to fetch orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className='mt-6 flex-1'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-lg font-semibold'>Recent Orders</CardTitle>
        <Button variant='outline' size='sm' asChild>
          <a href='/dashboard/orders'>View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='mr-2 animate-spin' /> Loading orders...
          </div>
        ) : error ? (
          <div className='p-4 text-sm text-red-600'>{error}</div>
        ) : orders.length === 0 ? (
          <div className='p-4 text-sm text-muted-foreground'>
            No recent orders found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className='font-medium'>
                    {o.orderNumber.slice(0, 8)}
                  </TableCell>
                  <TableCell>{o.name || o.email || 'Guest'}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusVariant(o.status)}>
                      {formatStatus(o.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{o.total.toLocaleString()}</TableCell>
                  <TableCell>
                    {dayjs(o.createdAt).format('DD MMM YYYY')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
