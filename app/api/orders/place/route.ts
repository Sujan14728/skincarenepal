import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderPlacementEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      shippingAddress,
      note,
      paymentMethod,
      paymentSlipUrl,
      email,
      name,
      phone
    } = body;
    console.log(token, shippingAddress);
    if (!token || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Fetch draft order
    const draft = await prisma.order.findFirst({
      where: {
        placementTokenHash: tokenHash,
        status: 'DRAFT',
        placementTokenExpiresAt: { gt: new Date() }
      },
      include: { items: true, coupon: true }
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Invalid or expired draft token' },
        { status: 400 }
      );
    }

    // Compute discount again just in case
    let discount = draft.discount || 0;
    if (draft.coupon) {
      if (draft.coupon.isPercentage) {
        const subtotal = draft.items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        discount = Math.floor((subtotal * draft.coupon.discountAmount) / 100);
      } else {
        discount = draft.coupon.discountAmount;
      }
    }

    // Finalize the draft
    const order = await prisma.order.update({
      where: { id: draft.id },
      data: {
        // save customer contact details if provided (or keep existing)
        email: email || draft.email || null,
        name: name || draft.name || null,
        phone: phone || draft.phone || null,
        shippingAddress,
        note: note || draft.note,
        paymentMethod: (paymentMethod || draft.paymentMethod) as
          | 'COD'
          | 'ONLINE',
        paymentSlipUrl: paymentSlipUrl || draft.paymentSlipUrl,
        discount,
        status: 'PENDING_CONFIRMATION',
        placedAt: new Date()
      },
      include: { items: true, coupon: true }
    });

    // Send confirmation email
    if (order.email && order.orderNumber) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.VERCEL_URL ||
          'http://localhost:3000';
        const origin = baseUrl.startsWith('http')
          ? baseUrl
          : `https://${baseUrl}`;
        const confirmLink = `${origin}/api/orders/confirm?token=${token}&order=${order.orderNumber}`;

        await sendOrderPlacementEmail(
          order.email,
          order.orderNumber,
          confirmLink,
          order
        );
      } catch (err) {
        console.error('Email failed but order placed:', err);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error finalizing order:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
