import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.max(1, Number(url.searchParams.get('limit')) || 3);
  const period = url.searchParams.get('period'); // e.g. "30d"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (period && period.endsWith('d')) {
    const days = Number(period.slice(0, -1)) || 0;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // filter orderItems by the parent order's placedAt
    where.order = { placedAt: { gte: since } };
  }

  // Group order items by productId and sum quantity (no 'take' here so we can filter out out-of-stock products afterwards)
  const groups = await prisma.orderItem.groupBy({
    by: ['productId'],
    where,
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } }
  });

  const allIds = groups.map(g => g.productId).filter(Boolean) as number[];
  if (allIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Fetch only in-stock products among the grouped ids
  const inStockProducts = await prisma.product.findMany({
    where: {
      id: { in: allIds },
      status: 'IN_STOCK'
    }
  });

  const productsMap = new Map(inStockProducts.map(p => [p.id, p]));
  const inStockIdSet = new Set(inStockProducts.map(p => p.id));

  // Keep only groups whose productId maps to an in-stock product, preserve ordering, then take the requested limit
  const filteredGroups = groups
    .filter(g => g.productId != null && inStockIdSet.has(g.productId as number))
    .slice(0, limit);

  const result = filteredGroups.map(g => {
    const pid = g.productId;
    return {
      product: pid == null ? null : (productsMap.get(pid) ?? null),
      totalOrdered: g._sum.quantity ?? 0
    };
  });

  return NextResponse.json({ data: result });
}
