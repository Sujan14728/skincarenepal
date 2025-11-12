import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendOrderStatusEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    // Detect the origin from request headers
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const BASE_URL = host
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3002';

    console.log('Confirmation redirect BASE_URL:', BASE_URL);

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const orderNumber = searchParams.get('order');

    if (!token || !orderNumber) {
      return NextResponse.redirect(`${BASE_URL}/order-confirmed?order=invalid`);
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const order = await prisma.order.findUnique({ where: { orderNumber } });

    if (!order || order.placementTokenHash !== hash) {
      return NextResponse.redirect(`${BASE_URL}/order-confirmed?order=invalid`);
    }

    if (
      order.placementTokenExpiresAt &&
      order.placementTokenExpiresAt < new Date()
    ) {
      return NextResponse.redirect(`${BASE_URL}/order-confirmed?order=expired`);
    }

    // Fetch order items to decrease stock
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true }
    });

    // Update order status and decrease product stock in a transaction
    const updated = await prisma.$transaction(async tx => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PENDING_VERIFICATION',
          placementTokenHash: null,
          placementTokenExpiresAt: null
        }
      });

      // Decrease stock for each product in the order
      if (orderWithItems?.items) {
        for (const item of orderWithItems.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            });
          }
        }
      }

      return updatedOrder;
    });

    if (updated.email) {
      const full = await prisma.order.findUnique({
        where: { id: updated.id },
        include: { items: true }
      });
      await sendOrderStatusEmail(
        updated.email,
        updated.orderNumber,
        updated.status,
        full || undefined
      );
    }

    return NextResponse.redirect(`${BASE_URL}/order-confirmed?order=confirmed`);
  } catch (error) {
    console.error('Order confirmation error:', error);
    return NextResponse.redirect(`${BASE_URL}/order-confirmed?order=error`);
  }
}
