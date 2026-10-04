import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdmin } from '@/lib/auth';

/** Signed-in admin plus the counts shown as badges in the sidebar. */
export async function GET(req: NextRequest) {
  const admin = await getAdmin(req);
  if (!admin)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, pendingOrders, unreadMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: Number(admin.id) },
      select: { email: true, name: true }
    }),
    prisma.order.count({
      where: {
        status: { in: ['PENDING_CONFIRMATION', 'PENDING_VERIFICATION'] }
      }
    }),
    prisma.contact.count({ where: { status: 'UNREAD' } })
  ]);

  return NextResponse.json({
    email: user?.email ?? admin.email,
    name: user?.name ?? null,
    counts: { pendingOrders, unreadMessages }
  });
}
