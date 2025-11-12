'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

type TrendData = {
  date: string;
  totalRevenue: number;
  orderCount: number;
};

type RangeOption = '7d' | '30d' | '90d';

export default function SalesTrendsChart() {
  const [range, setRange] = useState<RangeOption>('7d');
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/admin/sales-trends?range=${range}`)
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: TrendData[]) => {
        if (!mounted) return;
        setData(data);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to load sales trends');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [range]);

  return (
    <Card className='p-4'>
      <CardHeader className='mb-4 flex items-center justify-between p-0'>
        <CardTitle>Sales Trends</CardTitle>
        <Select value={range} onValueChange={(v: RangeOption) => setRange(v)}>
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='Range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='7d'>Last 7 Days</SelectItem>
            <SelectItem value='30d'>Last 30 Days</SelectItem>
            <SelectItem value='90d'>Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      {loading && (
        <div className='flex h-64 items-center justify-center'>
          <Loader2 className='mr-2 animate-spin' /> Loading trends...
        </div>
      )}

      {error && (
        <div className='p-4 text-sm text-red-600'>
          Error loading sales trends: {error}
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <CardContent className='p-2'>
          <div className='h-80 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                className='p-1'
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId='left'
                  orientation='left'
                  tickFormatter={v => `Rs. ${v}`}
                />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip
                  formatter={(value: number | string, name: string) =>
                    name === 'Revenue' ? `Rs. ${value}` : value
                  }
                />
                <Legend />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='totalRevenue'
                  stroke='#0f172a'
                  name='Revenue'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='orderCount'
                  stroke='#2563eb'
                  name='Orders'
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      )}

      {!loading && !error && data.length === 0 && (
        <div className='p-4 text-center text-sm text-muted-foreground'>
          No sales data available for this period.
        </div>
      )}
    </Card>
  );
}
