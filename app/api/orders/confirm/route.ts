import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendOrderStatusEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const orderNumber = searchParams.get('order');
    if (!token || !orderNumber) {
      return NextResponse.redirect(
        new URL('/order-confirmed?order=invalid', req.url)
      );
    }
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order || order.placementTokenHash !== hash) {
      return NextResponse.redirect(
        new URL('/order-confirmed?order=invalid', req.url)
      );
    }
    if (
      order.placementTokenExpiresAt &&
      order.placementTokenExpiresAt < new Date()
    ) {
      return NextResponse.redirect(
        new URL('/order-confirmed?order=expired', req.url)
      );
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PENDING_VERIFICATION',
        placementTokenHash: null,
        placementTokenExpiresAt: null
      }
    });
    if (updated.email) {
      await sendOrderStatusEmail(
        updated.email,
        updated.orderNumber,
        updated.status
      );
    }
    return NextResponse.redirect(
      new URL('/order-confirmed?order=confirmed', req.url)
    );
  } catch (e) {
    return NextResponse.redirect(
      new URL('/order-confirmed?order=error', req.url)
    );
  }
}
