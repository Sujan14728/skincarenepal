import { NextRequest, NextResponse } from 'next/server';
import type { Dayjs } from 'dayjs';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdmin } from '@/lib/auth';
import { storeTime } from '@/lib/nepal-time';
import type {
  AnalyticsRange,
  AnalyticsResponse,
  TrendPoint
} from '@/lib/types/dashboard';

/** Statuses that count as money earned (payment confirmed or goods moving). */
const EARNED: OrderStatus[] = ['VERIFIED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STATUS_ORDER: OrderStatus[] = [
  'PENDING_CONFIRMATION',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REJECTED'
];

const LOW_STOCK_THRESHOLD = 20;

const RANGES: Record<
  AnalyticsRange,
  { days: number; bucket: 'day' | 'week' | 'month' }
> = {
  '7d': { days: 7, bucket: 'day' },
  '30d': { days: 30, bucket: 'day' },
  '90d': { days: 90, bucket: 'week' },
  '12m': { days: 365, bucket: 'month' }
};

const bucketStart = (d: Dayjs, bucket: 'day' | 'week' | 'month') =>
  bucket === 'month'
    ? d.startOf('month')
    : bucket === 'week'
      ? d.startOf('day').subtract((d.day() + 6) % 7, 'day') // Monday
      : d.startOf('day');

const bucketLabel = (d: Dayjs, bucket: 'day' | 'week' | 'month') =>
  bucket === 'month' ? d.format('MMM YY') : d.format('D MMM');

export async function GET(req: NextRequest) {
  if (!(await getAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const param = req.nextUrl.searchParams.get('range') as AnalyticsRange;
  const range: AnalyticsRange = Object.hasOwn(RANGES, param ?? '')
    ? param
    : '30d';
  const { days, bucket } = RANGES[range];

  const now = storeTime();
  const start = now.subtract(days - 1, 'day').startOf('day');
  const prevStart = start.subtract(days, 'day');

  try {
    const [orders, prevOrders, statusRows, products, pending, unread, recent] =
      await Promise.all([
        prisma.order.findMany({
          where: { placedAt: { gte: start.toDate() } },
          select: {
            placedAt: true,
            total: true,
            status: true,
            items: { select: { productId: true, name: true, price: true, quantity: true } }
          }
        }),
        prisma.order.findMany({
          where: {
            placedAt: { gte: prevStart.toDate(), lt: start.toDate() }
          },
          select: { total: true, status: true }
        }),
        prisma.order.groupBy({
          by: ['status'],
          where: { placedAt: { gte: start.toDate() } },
          _count: { _all: true }
        }),
        prisma.product.findMany({
          select: { id: true, name: true, stock: true, status: true, images: true }
        }),
        prisma.order.groupBy({
          by: ['status'],
          where: {
            status: { in: ['PENDING_CONFIRMATION', 'PENDING_VERIFICATION'] }
          },
          _count: { _all: true }
        }),
        prisma.contact.count({ where: { status: 'UNREAD' } }),
        prisma.order.findMany({
          where: { placedAt: { not: null } },
          orderBy: { placedAt: 'desc' },
          take: 6,
          select: {
            id: true,
            orderNumber: true,
            name: true,
            email: true,
            total: true,
            status: true,
            placedAt: true
          }
        })
      ]);

    const summarise = (list: { total: number; status: OrderStatus }[]) => {
      const earned = list.filter(o => EARNED.includes(o.status));
      const revenue = earned.reduce((sum, o) => sum + o.total, 0);
      return {
        revenue,
        orders: list.length,
        paidOrders: earned.length,
        aov: earned.length ? Math.round(revenue / earned.length) : 0
      };
    };
    const current = summarise(orders);
    const previous = summarise(prevOrders);

    // Pre-fill every bucket so the chart has a continuous x-axis.
    const buckets = new Map<string, TrendPoint>();
    for (
      let cursor = bucketStart(start, bucket);
      !cursor.isAfter(now);
      cursor = cursor.add(1, bucket)
    ) {
      buckets.set(cursor.format('YYYY-MM-DD'), {
        date: cursor.format('YYYY-MM-DD'),
        label: bucketLabel(cursor, bucket),
        revenue: 0,
        orders: 0
      });
    }
    for (const o of orders) {
      const key = bucketStart(storeTime(o.placedAt), bucket).format('YYYY-MM-DD');
      const point = buckets.get(key);
      if (!point) continue;
      point.orders += 1;
      if (EARNED.includes(o.status)) point.revenue += o.total;
    }

    const productSales = new Map<
      string,
      { name: string; revenue: number; units: number }
    >();
    for (const o of orders) {
      if (!EARNED.includes(o.status)) continue;
      for (const item of o.items) {
        const key = item.productId ? `id:${item.productId}` : `name:${item.name}`;
        const entry = productSales.get(key) ?? {
          name: item.name,
          revenue: 0,
          units: 0
        };
        entry.revenue += item.price * item.quantity;
        entry.units += item.quantity;
        productSales.set(key, entry);
      }
    }
    // Prefer the live product name over the snapshot stored on the order item.
    const nameById = new Map(products.map(p => [`id:${p.id}`, p.name.trim()]));
    const topProducts = [...productSales.entries()]
      .map(([key, v]) => ({ ...v, name: nameById.get(key) ?? v.name.trim() }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const statusCounts = new Map(
      statusRows.map(r => [r.status, r._count._all])
    );
    const pendingCounts = new Map(pending.map(r => [r.status, r._count._all]));

    const body: AnalyticsResponse = {
      range,
      bucket,
      kpis: {
        revenue: { value: current.revenue, previous: previous.revenue },
        orders: { value: current.orders, previous: previous.orders },
        aov: { value: current.aov, previous: previous.aov },
        paidOrders: { value: current.paidOrders, previous: previous.paidOrders }
      },
      attention: {
        pendingConfirmation: pendingCounts.get('PENDING_CONFIRMATION') ?? 0,
        pendingVerification: pendingCounts.get('PENDING_VERIFICATION') ?? 0,
        unreadMessages: unread,
        lowStock: products.filter(
          p => p.status !== 'DISCONTINUED' && p.stock <= LOW_STOCK_THRESHOLD
        ).length
      },
      trend: [...buckets.values()],
      statusBreakdown: STATUS_ORDER.map(status => ({
        status,
        count: statusCounts.get(status) ?? 0
      })),
      topProducts,
      lowStock: products
        .filter(p => p.status !== 'DISCONTINUED')
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name.trim(),
          stock: p.stock,
          status: p.status,
          image: p.images[0] ?? null
        })),
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      recentOrders: recent.map(o => ({
        ...o,
        placedAt: o.placedAt!.toISOString()
      }))
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}
