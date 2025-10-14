import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendOrderPlacementEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !('isAdmin' in payload) || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      email,
      name,
      phone,
      shippingAddress,
      note,
      items,
      subtotal,
      discount,
      shipping,
      total
    } = body;

    if (!shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        email: email || null,
        name: name || null,
        phone: phone || null,
        shippingAddress,
        note: note || null,
        subtotal,
        discount,
        shipping,
        total,
        paymentSlipUrl: body.paymentSlipUrl || null,
        placementTokenHash: tokenHash,
        placementTokenExpiresAt: tokenExpiry,
        items: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            name: i.name
          }))
        },
        placedAt: new Date()
      },
      include: {
        items: true
      }
    });
    if (order.email && order.orderNumber) {
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
        confirmLink
      );
    }
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
