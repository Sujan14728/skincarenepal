import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '7d';

  const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
  const startDate = dayjs()
    .subtract(days - 1, 'day')
    .startOf('day')
    .toDate();

  const orders = await prisma.order.findMany({
    where: {
      placedAt: { gte: startDate },
      status: { in: ['VERIFIED', 'DELIVERED'] }
    },
    select: {
      placedAt: true,
      total: true
    },
    orderBy: { placedAt: 'asc' }
  });

  const aggregated: Record<
    string,
    { totalRevenue: number; orderCount: number }
  > = {};

  for (const o of orders) {
    const date = dayjs(o.placedAt).format('YYYY-MM-DD');
    if (!aggregated[date])
      aggregated[date] = { totalRevenue: 0, orderCount: 0 };
    aggregated[date].totalRevenue += o.total;
    aggregated[date].orderCount += 1;
  }

  const result: { date: string; totalRevenue: number; orderCount: number }[] =
    [];

  for (let i = 0; i < days; i++) {
    const date = dayjs()
      .subtract(days - 1 - i, 'day')
      .format('YYYY-MM-DD');
    const data = aggregated[date] || { totalRevenue: 0, orderCount: 0 };
    result.push({ date, ...data });
  }

  return NextResponse.json(result);
}
