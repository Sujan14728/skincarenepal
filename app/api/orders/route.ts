import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendOrderPlacementEmail } from '@/lib/email';
import crypto from 'crypto';

/**
 * Generate a human-friendly order number from the first product name
 * Format: productSlug-randomNumber (e.g., facepack-12345)
 */
async function generateOrderNumber(productName: string): Promise<string> {
  // Sanitize product name to slug-like format
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 20); // Limit length

  // Generate a random 4-5 digit number
  const randomNum = Math.floor(10000 + Math.random() * 90000);

  let orderNumber = `${slug}-${randomNum}`;

  // Ensure uniqueness by checking database and incrementing if needed
  let exists = await prisma.order.findUnique({ where: { orderNumber } });
  let attempts = 0;

  while (exists && attempts < 10) {
    const newNum = Math.floor(10000 + Math.random() * 90000);
    orderNumber = `${slug}-${newNum}`;
    exists = await prisma.order.findUnique({ where: { orderNumber } });
    attempts++;
  }

  return orderNumber;
}

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

    const url = req.nextUrl;
    const qp = url.searchParams;

    const parseNumber = (val: string | null, fallback: number) => {
      if (!val) return fallback;
      const n = parseInt(val, 10);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    };

    const page = parseNumber(qp.get('page'), 1);
    const perPage = Math.min(parseNumber(qp.get('perPage'), 20), 200);
    const skip = (page - 1) * perPage;

    const orderId = qp.get('orderId')?.trim() || null;
    const name = qp.get('name')?.trim() || null;
    const phone = qp.get('phone')?.trim() || null;
    const status = qp.get('status')?.trim() || null;
    const date = qp.get('date')?.trim() || null;
    const paymentMethod = qp.get('paymentMethod')?.trim() || null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (orderId) {
      where.orderNumber = orderId;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const and: any[] = [];

    if (name) {
      and.push({
        OR: [
          { name: { contains: name, mode: 'insensitive' } },
          { user: { name: { contains: name, mode: 'insensitive' } } }
        ]
      });
    }

    if (phone) {
      and.push({ phone: { contains: phone, mode: 'insensitive' } });
    }

    if (status) {
      and.push({ status });
    }

    if (paymentMethod) {
      if (['COD', 'ONLINE'].includes(paymentMethod)) {
        and.push({ paymentMethod });
      }
    }

    if (date) {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        and.push({ placedAt: { gte: start, lte: end } });
      }
    }

    if (and.length > 0) {
      where.AND = and;
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      skip,
      take: perPage,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return NextResponse.json({
      data: orders,
      meta: { page, perPage, total, totalPages }
    });
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
      paymentSlipUrl,
      paymentMethod,
      items,
      subtotal,
      discount,
      shipping,
      total,
      couponCode
    } = body;

    if (!shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let finalDiscount = discount; // default to frontend-provided value

    if (couponCode) {
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

      // Recalculate discount on backend for safety
      finalDiscount =
        coupon.discountType === 'PERCENTAGE'
          ? Math.floor((subtotal * coupon.discountValue) / 100)
          : coupon.discountValue;

      // no need to persist coupon entity on order here
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

    // Generate human-friendly order number from first product name
    const firstProductName = items[0]?.name || 'order';
    const orderNumber = await generateOrderNumber(firstProductName);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        email: email || null,
        name: name || null,
        phone: phone || null,
        shippingAddress,
        note: note || null,
        paymentMethod: (paymentMethod || 'COD') as 'COD' | 'ONLINE',
        subtotal,
        discount: finalDiscount,
        shipping,
        total,
        paymentSlipUrl: paymentSlipUrl || null,
        placementTokenHash: tokenHash,
        placementTokenExpiresAt: tokenExpiry,
        // couponCode not stored on Order model; omit persistence
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

    // Try to send email, but don't fail order creation if email fails
    if (order.email && order.orderNumber) {
      try {
        // Get the actual domain from the request or environment
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        const host =
          req.headers.get('host') || req.headers.get('x-forwarded-host');

        let origin: string;
        if (host && !host.includes('localhost')) {
          // Use the actual request host in production
          origin = `${protocol}://${host}`;
        } else {
          // Fallback to environment variable
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || 'https://careandcleannp.com';
          origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
        }

        const confirmLink = `${origin}/api/orders/confirm?token=${token}&order=${order.orderNumber}`;
        await sendOrderPlacementEmail(
          order.email,
          order.orderNumber,
          confirmLink,
          order
        );
        console.log(
          `Order confirmation email sent to ${order.email} with link: ${confirmLink}`
        );
      } catch (emailError) {
        // Log email error but don't fail the order
        console.error(
          'Failed to send order email, but order was created:',
          emailError
        );
      }
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
