import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderPlacementEmail } from '@/lib/email';
import crypto from 'crypto';
import { formatOrderNumber, getOrigin } from '@/lib/utils';
import { PaymentMethod } from '@/lib/enum/product';
import { isEmail } from '@/lib/validate';
import { effectivePrice, isPurchasable } from '@/lib/storefront-utils';

type IncomingItem = {
  productId: number;
  quantity: number;
};

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

const MAX_QUANTITY = 50;

const isUploadedSlipUrl = (value: string) => {
  try {
    const url = new URL(value);
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    return (
      url.protocol === 'https:' &&
      ((endpoint && value.startsWith(endpoint)) ||
        url.hostname.endsWith('imagekit.io'))
    );
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      items?: IncomingItem[];
      coupon?: { code?: string } | null;
      couponCode?: string | null;
      shippingAddress?: string | null;
      note?: string | null;
      paymentMethod?: PaymentMethod;
      paymentSlipUrl?: string | null;
      email?: string | null;
      name?: string | null;
      phone?: string | null;
    } | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const {
      items: incomingItems,
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

    // The confirmation link is emailed, so an order without a valid email
    // could never be confirmed.
    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 }
      );
    }
    const method = paymentMethod ?? 'COD';
    if (method !== 'COD' && method !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
    if (
      method === 'ONLINE' &&
      (!paymentSlipUrl || !isUploadedSlipUrl(paymentSlipUrl))
    ) {
      return NextResponse.json(
        { error: 'A payment slip is required for online payment' },
        { status: 400 }
      );
    }

    // Normalize incoming items -> [{ productId, quantity }], merging repeats.
    const quantities = new Map<number, number>();
    for (const it of incomingItems) {
      const productId = Number(it?.productId);
      const quantity = Number(it?.quantity ?? 1);
      if (
        !Number.isInteger(productId) ||
        productId < 1 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return NextResponse.json(
          { error: 'Invalid item in order' },
          { status: 400 }
        );
      }
      quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
    }
    const itemsNormalized = [...quantities].map(([productId, quantity]) => ({
      productId,
      quantity
    }));
    if (itemsNormalized.some(it => it.quantity > MAX_QUANTITY)) {
      return NextResponse.json(
        { error: `You can order at most ${MAX_QUANTITY} of each product` },
        { status: 400 }
      );
    }

    // Fetch products and compute canonical prices + subtotal
    const productIds = itemsNormalized.map(i => i.productId);
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
          { error: `Product not found` },
          { status: 400 }
        );
      }
      if (!isPurchasable(prod)) {
        return NextResponse.json(
          { error: `${prod.name.trim()} is not available to order right now` },
          { status: 400 }
        );
      }
      if (it.quantity > prod.stock) {
        return NextResponse.json(
          { error: `Only ${prod.stock} of ${prod.name.trim()} left in stock` },
          { status: 400 }
        );
      }
      // Same rule the storefront uses to display prices.
      const unitPrice = effectivePrice(prod);
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

      // Product-specific coupons only discount that product's lines.
      const discountBase = coupon.productId
        ? orderItemsData
            .filter(it => it.productId === coupon.productId)
            .reduce((sum, it) => sum + it.price * it.quantity, 0)
        : subtotal;

      const type = (coupon.discountType || '').toUpperCase();
      if (type === 'PERCENTAGE') {
        discount = Math.floor(discountBase * (coupon.discountValue / 100));
      } else {
        discount = Math.floor(coupon.discountValue);
      }

      discount = Math.max(0, Math.min(discount, discountBase));

      appliedCouponId = coupon.id;
    }

    // Delivery is priced from site settings, never from the client.
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    const shipping =
      settings?.freeShippingThreshold && subtotal >= settings.freeShippingThreshold
        ? 0
        : (settings?.deliveryCost ?? 0);

    const total = Math.max(0, subtotal + shipping - discount);

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
            email: email.trim(),
            name: name || null,
            phone: phone || null,
            shippingAddress,
            note: note || null,
            paymentMethod: method,
            paymentSlipUrl: method === 'ONLINE' ? paymentSlipUrl : null,
            subtotal,
            discount,
            shipping,
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
        ).catch(e => console.error('Email error', e));
      }
    } catch (e) {
      console.error('Email send failed', e);
    }

    return NextResponse.json(created, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Place order error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
