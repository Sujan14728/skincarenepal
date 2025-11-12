import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalRevenue = await prisma.order
      .aggregate({
        _sum: { total: true },
        where: { status: { in: ['VERIFIED', 'DELIVERED'] } }
      })
      .then(r => r._sum.total ?? 0);

    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING_CONFIRMATION' }
    });
    const deliveredOrders = await prisma.order.count({
      where: { status: 'DELIVERED' }
    });
    const inStockProducts = await prisma.product.count({
      where: { status: 'IN_STOCK' }
    });
    const unreadMessages = await prisma.contact.count({
      where: { status: 'UNREAD' }
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      inStockProducts,
      unreadMessages
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
