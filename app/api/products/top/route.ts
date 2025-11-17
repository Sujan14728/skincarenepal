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

  // Group order items by productId and sum quantity
  const groups = await prisma.orderItem.groupBy({
    by: ['productId'],
    where,
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } }
  });

  const allIds = groups.map(g => g.productId).filter(Boolean) as number[];
  if (allIds.length === 0) {
    // Fallback: no orders yet — return latest IN_STOCK products only
    const latest = await prisma.product.findMany({
      where: { status: 'IN_STOCK' },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return NextResponse.json({
      data: latest.map(p => ({ product: p, totalOrdered: 0 }))
    });
  }

  // ✅ Fetch only IN_STOCK products for featured section
  const validProducts = await prisma.product.findMany({
    where: {
      id: { in: allIds },
      status: 'IN_STOCK'
    }
  });

  const productsMap = new Map(validProducts.map(p => [p.id, p]));
  const validIdSet = new Set(validProducts.map(p => p.id));

  const filteredGroups = groups
    .filter(g => g.productId != null && validIdSet.has(g.productId as number))
    .slice(0, limit);

  const result = filteredGroups.map(g => {
    const pid = g.productId;
    return {
      product: pid == null ? null : (productsMap.get(pid) ?? null),
      totalOrdered: g._sum.quantity ?? 0
    };
  });

  // If we have fewer than `limit`, backfill with latest IN_STOCK products
  if (result.length < limit) {
    const alreadyIds = new Set(
      result
        .map(r => (r.product ? r.product.id : undefined))
        .filter(Boolean) as number[]
    );
    const remaining = limit - result.length;

    // Fetch extra IN_STOCK products only
    const extraInStock = await prisma.product.findMany({
      where: {
        status: 'IN_STOCK',
        id: { notIn: Array.from(alreadyIds) }
      },
      orderBy: { createdAt: 'desc' },
      take: remaining
    });

    const extras = extraInStock.map(p => ({
      product: p,
      totalOrdered: 0
    }));

    return NextResponse.json({ data: [...result, ...extras] });
  }

  return NextResponse.json({ data: result });
}
