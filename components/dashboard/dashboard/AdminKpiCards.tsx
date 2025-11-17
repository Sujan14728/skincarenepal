'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import {
  Loader2,
  Box,
  ShoppingCart,
  MessageSquare,
  Package
} from 'lucide-react';
import { Kpis } from '@/lib/types/dashboard';
import { formatKpiValue } from '@/lib/utils';

export default function AdminKpiCards() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/admin/kpis')
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: Kpis) => {
        if (!mounted) return;
        setKpis(data);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to load KPIs');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const cards: { key: keyof Kpis; title: string; icon: React.ReactNode }[] = [
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      icon: <Box className='h-5 w-5' />
    },
    {
      key: 'totalOrders',
      title: 'Total Orders',
      icon: <ShoppingCart className='h-5 w-5' />
    },
    {
      key: 'pendingOrders',
      title: 'Pending Orders',
      icon: <Package className='h-5 w-5' />
    },
    {
      key: 'deliveredOrders',
      title: 'Delivered Orders',
      icon: <Package className='h-5 w-5' />
    },
    {
      key: 'inStockProducts',
      title: 'Products In Stock',
      icon: <Box className='h-5 w-5' />
    },
    {
      key: 'unreadMessages',
      title: 'Unread Messages',
      icon: <MessageSquare className='h-5 w-5' />
    }
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {loading && (
        <div className='col-span-full flex items-center justify-center p-6'>
          <Loader2 className='mr-2 animate-spin' /> Loading KPIs...
        </div>
      )}

      {error && (
        <div className='col-span-full p-4 text-sm text-red-600'>
          Error loading KPIs: {error}
        </div>
      )}

      {!loading &&
        !error &&
        kpis &&
        cards.map(c => (
          <Card key={c.key} className='flex items-center justify-between p-4'>
            <div>
              <CardHeader className='flex items-center gap-2 p-0'>
                <div className='text-muted-foreground'>{c.icon}</div>
                <CardTitle className='text-sm'>{c.title}</CardTitle>
              </CardHeader>
              <CardContent className='mt-2 flex justify-center p-0'>
                <div className='flex items-baseline gap-3'>
                  <div className='text-2xl font-semibold'>
                    {formatKpiValue(kpis[c.key])}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
    </div>
  );
}
