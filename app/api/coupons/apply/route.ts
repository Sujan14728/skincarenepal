import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { couponCode } = await req.json();
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
      status: 'PENDING_CONFIRMATION',
      placementTokenExpiresAt: { gt: new Date() }
    },
    include: { items: true }
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
      isActive: true,
      validFrom: { lte: new Date() },
      OR: [{ validUntil: { gte: new Date() } }, { validUntil: null }]
    }
  });

  if (!coupon) {
    return NextResponse.json(
      { error: 'Invalid or expired coupon' },
      { status: 400 }
    );
  }

  // Validate coupon has discount value
  if (!coupon.discountValue || coupon.discountValue <= 0) {
    return NextResponse.json(
      { error: 'Invalid coupon configuration' },
      { status: 400 }
    );
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    return NextResponse.json(
      { error: 'This coupon is not active' },
      { status: 400 }
    );
  }

  // Check usage limit if set
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json(
      { error: 'Coupon usage limit reached' },
      { status: 400 }
    );
  }

  // Compute subtotal from draft items
  const draftSubtotal = order.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // Check minimum purchase if set (against full cart subtotal)
  if (coupon.minPurchase && draftSubtotal < coupon.minPurchase) {
    return NextResponse.json(
      { error: `Minimum purchase of Rs. ${coupon.minPurchase} required` },
      { status: 400 }
    );
  }

  // If coupon targets a specific product, only discount that portion
  const eligibleSubtotal = coupon.productId
    ? order.items
        .filter(i => i.productId === coupon.productId)
        .reduce((sum, i) => sum + i.price * i.quantity, 0)
    : draftSubtotal;

  console.log('📊 Subtotal calculation:', {
    draftSubtotal,
    eligibleSubtotal,
    hasProductId: !!coupon.productId,
    targetProductId: coupon.productId,
    orderItemsCount: order.items.length,
    orderItems: order.items.map(i => ({
      productId: i.productId,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity
    }))
  });

  // Calculate discount based on type
  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = Math.floor((eligibleSubtotal * coupon.discountValue) / 100);
  } else if (coupon.discountType === 'FIXED') {
    discount = coupon.discountValue;
  }

  // Ensure discount is a valid number
  if (isNaN(discount) || discount < 0) {
    discount = 0;
  }

  console.log('Coupon details:', {
    code: coupon.code,
    type: coupon.discountType,
    value: coupon.discountValue,
    calculatedDiscount: discount,
    subtotal: draftSubtotal
  });

  // Update order with discount
  await prisma.order.update({
    where: { id: order.id },
    data: { discount: Math.floor(discount) }
  });

  return NextResponse.json({
    discountAmount: discount,
    isPercentage: coupon.discountType === 'PERCENTAGE',
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    code: coupon.code,
    couponId: coupon.id,
    applied: true
  });
}
