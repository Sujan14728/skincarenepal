import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { couponCode, subtotal } = await req.json();
  const token = req.cookies.get('placementToken')?.value;

  if (!token || !couponCode) {
    return NextResponse.json(
      { error: 'Missing token or couponCode' },
      { status: 400 }
    );
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const order = await prisma.order.findFirst({
    where: {
      placementTokenHash: tokenHash,
      
      placementTokenExpiresAt: { gt: new Date() }
    }
  });

  if (!order) {
    return NextResponse.json(
      { error: 'Invalid or expired order token' },
      { status: 400 }
    );
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      active: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
      usageLimit: { gte: 1 }
    }
  });

  if (!coupon) {
    return NextResponse.json(
      { error: 'Invalid or expired coupon' },
      { status: 400 }
    );
  }

  let discount = coupon.discountAmount;
  if (coupon.isPercentage) {
    discount = Math.floor((subtotal * discount) / 100);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { couponId: coupon.id }
  });

  return NextResponse.json({
    discountAmount: discount,
    isPercentage: coupon.isPercentage,
    code: coupon.code,
    couponId: coupon.id,
    applied: true
  });
}
