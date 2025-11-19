import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const couponCode = (body.couponCode || '').toString().trim();
  const productId = body.productId ? Number(body.productId) : undefined;
  const quantity = Math.max(1, Number(body.quantity || 1));
  const clientSubtotal =
    body.subtotal !== undefined ? Number(body.subtotal) : undefined;
  const shipping = Number(body.shipping || 0);

  if (!couponCode) {
    return NextResponse.json(
      { valid: false, error: 'couponCode required' },
      { status: 400 }
    );
  }

  // Fetch coupon
  const now = new Date();
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      isActive: true,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gte: now } }]
    }
  });

  if (!coupon) {
    return NextResponse.json(
      { valid: false, error: 'Invalid or expired coupon' },
      { status: 400 }
    );
  }

  // Compute canonical subtotal when productId provided, otherwise use client subtotal if present
  let subtotal = 0;
  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return NextResponse.json(
        { valid: false, error: 'Product not found' },
        { status: 400 }
      );
    }
    const unitPrice = product.salePrice ?? product.price;
    subtotal = Math.floor(unitPrice * quantity);
  } else if (typeof clientSubtotal === 'number') {
    subtotal = Math.floor(clientSubtotal);
  } else {
    return NextResponse.json(
      { valid: false, error: 'Either productId or subtotal must be provided' },
      { status: 400 }
    );
  }

  // Product-specific coupon check
  if (coupon.productId && productId && coupon.productId !== productId) {
    return NextResponse.json(
      { valid: false, error: 'Coupon not valid for this product' },
      { status: 400 }
    );
  }
  if (coupon.productId && !productId) {
    // Coupon requires product context
    return NextResponse.json(
      { valid: false, error: 'Coupon requires a specific product' },
      { status: 400 }
    );
  }

  // min purchase check
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return NextResponse.json(
      {
        valid: false,
        error: `Minimum purchase of ${coupon.minPurchase} required`
      },
      { status: 400 }
    );
  }

  // Compute discount
  let discount = 0;
  const type = (coupon.discountType || '').toUpperCase();
  if (type === 'PERCENTAGE') {
    discount = Math.floor(subtotal * (coupon.discountValue / 100));
  } else {
    // treat as FIXED
    discount = Math.floor(coupon.discountValue);
  }

  // Cap discount so total can't go below zero
  discount = Math.max(0, Math.min(discount, subtotal + shipping));

  const totalAfter = Math.max(0, subtotal + shipping - discount);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountAmount: discount,
    isPercentage: type === 'PERCENTAGE',
    subtotal,
    shipping,
    totalAfter
  });
}
