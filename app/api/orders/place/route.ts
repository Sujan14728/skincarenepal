import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderPlacementEmail } from '@/lib/email';
import crypto from 'crypto';
import { formatOrderNumber, getOrigin } from '@/lib/utils';

async function withRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 100) {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = (err as Error).message || '';
      if (
        (msg.includes('P2024') ||
          msg.includes('connection') ||
          msg.includes('ConnectionReset')) &&
        i < retries
      ) {
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items: incomingItems,
      shipping = 0,
      coupon: couponPayload,
      couponCode: couponCodeFallback,
      shippingAddress,
      note,
      paymentMethod,
      paymentSlipUrl,
      email,
      name,
      phone
    } = body;

    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }
    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Missing shippingAddress' },
        { status: 400 }
      );
    }

    // Normalize incoming items -> expect [{ productId, quantity }]
    const itemsNormalized = incomingItems
      .map((it: any) => ({
        productId: Number(it.productId),
        quantity: Math.max(1, Number(it.quantity || 1))
      }))
      .filter((it: any) => it.productId && it.quantity > 0);

    if (!itemsNormalized.length) {
      return NextResponse.json(
        { error: 'No valid items provided' },
        { status: 400 }
      );
    }

    // Fetch products and compute canonical prices + subtotal
    const productIds = itemsNormalized.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map<number, (typeof products)[0]>();
    for (const p of products) productMap.set(p.id, p);

    const orderItemsData: {
      productId: number;
      name: string;
      price: number;
      quantity: number;
    }[] = [];
    let subtotal = 0;
    for (const it of itemsNormalized) {
      const prod = productMap.get(it.productId);
      if (!prod) {
        return NextResponse.json(
          { error: `Product ${it.productId} not found` },
          { status: 400 }
        );
      }
      const unitPrice = prod.salePrice ?? prod.price;
      const line = Math.floor(unitPrice * it.quantity);
      subtotal += line;
      orderItemsData.push({
        productId: prod.id,
        name: prod.name,
        price: Math.floor(unitPrice),
        quantity: it.quantity
      });
    }

    // Coupon validation (re-validate server-side). couponPayload may be object or null; prefer explicit code passed.
    const couponCode =
      (couponPayload && couponPayload.code) || couponCodeFallback || null;
    let discount = 0;
    let appliedCouponId: number | null = null;
    if (couponCode) {
      const now = new Date();
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          validFrom: { lte: now },
          OR: [{ validUntil: null }, { validUntil: { gte: now } }]
        }
      });
      if (!coupon)
        return NextResponse.json(
          { error: 'Invalid or expired coupon' },
          { status: 400 }
        );

      // product-specific coupon: ensure a matching product is in the order
      if (coupon.productId) {
        const hasProduct = orderItemsData.some(
          it => it.productId === coupon.productId
        );
        if (!hasProduct) {
          return NextResponse.json(
            { error: 'Coupon not valid for selected products' },
            { status: 400 }
          );
        }
      }

      // min purchase check
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return NextResponse.json(
          { error: `Minimum purchase of ${coupon.minPurchase} required` },
          { status: 400 }
        );
      }

      const type = (coupon.discountType || '').toUpperCase();
      if (type === 'PERCENTAGE') {
        discount = Math.floor(subtotal * (coupon.discountValue / 100));
      } else {
        discount = Math.floor(coupon.discountValue);
      }

      // cap discount
      discount = Math.max(0, Math.min(discount, subtotal + Number(shipping)));

      appliedCouponId = coupon.id;
    }

    const total = Math.max(0, subtotal + Number(shipping) - discount);

    // generate placement token for confirmation link and save hash in order
    const placementToken = crypto.randomBytes(32).toString('hex');
    const placementTokenHash = crypto
      .createHash('sha256')
      .update(placementToken)
      .digest('hex');
    const placementTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

    // Create order and increment coupon usedCount atomically
    const created = await withRetry(() =>
      prisma.$transaction(async tx => {
        // If coupon present and has usageLimit, try conditional increment via updateMany to avoid race where limit reached
        if (appliedCouponId) {
          const couponRec = await tx.coupon.findUnique({
            where: { id: appliedCouponId }
          });
          if (!couponRec) throw new Error('Coupon not found during placement');

          if (couponRec.usageLimit && couponRec.usageLimit > 0) {
            const updated = await tx.coupon.updateMany({
              where: {
                id: appliedCouponId,
                usedCount: { lt: couponRec.usageLimit }
              },
              data: { usedCount: { increment: 1 } }
            });
            if (updated.count === 0) {
              throw new Error('Coupon usage limit reached');
            }
          } else {
            await tx.coupon.update({
              where: { id: appliedCouponId },
              data: { usedCount: { increment: 1 } }
            });
          }
        }

        const order = await tx.order.create({
          data: {
            email: email || null,
            name: name || null,
            phone: phone || null,
            shippingAddress,
            note: note || null,
            paymentMethod: paymentMethod || 'COD',
            paymentSlipUrl: paymentSlipUrl || null,
            subtotal,
            discount,
            shipping: Number(shipping),
            total,
            status: 'PENDING_CONFIRMATION',
            placedAt: new Date(),
            placementTokenHash,
            placementTokenExpiresAt: placementTokenExpiry,
            items: {
              create: orderItemsData.map(it => ({
                productId: it.productId,
                name: it.name,
                price: it.price,
                quantity: it.quantity
              }))
            }
          },
          include: { items: true }
        });

        const orderNumber = formatOrderNumber(order.id, 'ORDER-', 6);
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { orderNumber },
          include: { items: true }
        });

        return updatedOrder;
      })
    );

    // Fire-and-forget email
    try {
      const origin = getOrigin();
      const confirmUrl = `${origin}/api/orders/confirm?token=${encodeURIComponent(placementToken)}&order=${encodeURIComponent(created.orderNumber)}`;
      if (created.email) {
        sendOrderPlacementEmail(
          created.email,
          created.orderNumber,
          confirmUrl,
          created
        )
          .then(() => console.log('Email sent'))
          .catch(e => console.error('Email error', e));
      }
    } catch (e) {
      console.error('Email send failed', e);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('Place order error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
