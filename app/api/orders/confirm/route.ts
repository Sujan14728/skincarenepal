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
    }
  });

  if (!order) {
    return NextResponse.redirect(
      `${origin}/order/confirmation?status=error&message=Invalid+or+expired+link`
    );
  }

  // NOTE: Coupon usage increment removed because Order model has no coupon relation.
  // If tracking usage per order is desired, add `couponId Int?` with relation to Coupon
  // and set it when applying a coupon.

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
