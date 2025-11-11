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
    // Fallback: no orders yet — return latest available products
    const latest = await prisma.product.findMany({
      where: { status: { in: ['IN_STOCK', 'COMING_SOON'] } },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return NextResponse.json({
      data: latest.map(p => ({ product: p, totalOrdered: 0 }))
    });
  }

  // ✅ Fetch both IN_STOCK and COMING_SOON products
  const validProducts = await prisma.product.findMany({
    where: {
      id: { in: allIds },
      status: { in: ['IN_STOCK', 'COMING_SOON'] }
    }
  });

  const productsMap = new Map(validProducts.map(p => [p.id, p]));
  const validIdSet = new Set(validProducts.map(p => p.id));

  const filteredGroups = groups
    .filter(g => g.productId != null && validIdSet.has(g.productId as number))
    .slice(0, limit);

  let result = filteredGroups.map(g => {
    const pid = g.productId;
    return {
      product: pid == null ? null : (productsMap.get(pid) ?? null),
      totalOrdered: g._sum.quantity ?? 0
    };
  });

  // Ensure at least one COMING_SOON appears if available
  const hasComingSoonAlready = result.some(
    r => r.product?.status === 'COMING_SOON'
  );
  if (!hasComingSoonAlready) {
    const presentIds = new Set(
      result
        .map(r => (r.product ? r.product.id : undefined))
        .filter(Boolean) as number[]
    );
    const comingSoonCandidate = await prisma.product.findFirst({
      where: { status: 'COMING_SOON', id: { notIn: Array.from(presentIds) } },
      orderBy: { createdAt: 'desc' }
    });
    if (comingSoonCandidate) {
      if (result.length >= limit && limit > 0) {
        // Replace the lowest-ranked item to include COMING_SOON
        result = [
          ...result.slice(0, limit - 1),
          { product: comingSoonCandidate, totalOrdered: 0 }
        ];
      } else {
        result.push({ product: comingSoonCandidate, totalOrdered: 0 });
      }
    }
  }
  // If we have fewer than `limit`, backfill with latest COMING_SOON first, then IN_STOCK
  if (result.length < limit) {
    const alreadyIds = new Set(
      result
        .map(r => (r.product ? r.product.id : undefined))
        .filter(Boolean) as number[]
    );
    let remaining = limit - result.length;

    // Fetch extra COMING_SOON products
    const extraComingSoon =
      remaining > 0
        ? await prisma.product.findMany({
            where: {
              status: 'COMING_SOON',
              id: { notIn: Array.from(alreadyIds) }
            },
            orderBy: { createdAt: 'desc' },
            take: remaining
          })
        : [];

    for (const p of extraComingSoon) alreadyIds.add(p.id);
    remaining -= extraComingSoon.length;

    // Fetch extra IN_STOCK products if still needed
    const extraInStock =
      remaining > 0
        ? await prisma.product.findMany({
            where: {
              status: 'IN_STOCK',
              id: { notIn: Array.from(alreadyIds) }
            },
            orderBy: { createdAt: 'desc' },
            take: remaining
          })
        : [];

    const extras = [...extraComingSoon, ...extraInStock].map(p => ({
      product: p,
      totalOrdered: 0
    }));

    return NextResponse.json({ data: [...result, ...extras] });
  }

  return NextResponse.json({ data: result });
}
