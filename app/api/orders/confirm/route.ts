import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getOrigin } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const orderNumber = req.nextUrl.searchParams.get('order');
  const origin = getOrigin();
  if (!token || !orderNumber) {
    return NextResponse.json(
      { error: 'Invalid confirmation request' },
      { status: 400 }
    );
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      placementTokenHash: tokenHash,
      placementTokenExpiresAt: { gt: new Date() },
      status: 'PENDING_CONFIRMATION'
    },
    include: { coupon: true }
  });

  if (!order) {
    return NextResponse.redirect(
      `${origin}/order/confirmation?status=error&message=Invalid+or+expired+link`
    );
  }

  // Update coupon usage here
  if (order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: {
        usedCount: { increment: 1 },
        usageLimit:
          order.coupon?.usageLimit !== null
            ? (order.coupon?.usageLimit ?? 0) - 1
            : null
      }
    });
  }

  // Change order status to confirmed
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PENDING_VERIFICATION',
      verifiedAt: new Date()
    }
  });

  return NextResponse.redirect(
    `${origin}/order/confirmation?status=success&orderNumber=${order.orderNumber}`
  );
}
