import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Expect client to send a minimal items list; server will validate and
  // recompute prices/totals from the database to avoid client tampering.
  const body = await req.json();
  type IncomingItem = {
    productId?: number;
    quantity?: number;
    price?: number;
    name?: string;
  };
  const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
  const shipping = Number(body.shipping || 0);

  if (!items.length) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 });
  }

  // Fetch products to determine canonical prices (prefer salePrice)
  const productIds = items.map(i => i.productId).filter(Boolean) as number[];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  type ProductMin = {
    id: number;
    name: string;
    price: number;
    salePrice: number | null;
  };
  const productMap = new Map<number, ProductMin>();
  for (const p of products) productMap.set(p.id, p);

  // Build order items using server-side prices where possible
  const itemsToCreate: Array<{
    productId: number;
    quantity: number;
    price: number;
    name: string;
  }> = [];
  let subtotal = 0;
  for (const it of items) {
    const pid = Number(it.productId);
    const qty = Math.max(0, Number(it.quantity || 0));
    if (!pid || qty <= 0) continue;
    const prod = productMap.get(pid);
    const price = prod ? (prod.salePrice ?? prod.price) : Number(it.price || 0);
    const name = prod ? prod.name : String(it.name || '');
    const line = Math.floor(price * qty);
    subtotal += line;
    itemsToCreate.push({ productId: pid, quantity: qty, price, name });
  }

  if (!itemsToCreate.length) {
    return NextResponse.json(
      { error: 'No valid items provided' },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

  const total = Math.max(0, subtotal + shipping);

  const draftOrder = await prisma.order.create({
    data: {
      placementTokenHash: tokenHash,
      placementTokenExpiresAt: tokenExpiry,
      // minimal contact fields left empty for draft
      shippingAddress: String(body.shippingAddress || ''),
      subtotal,
      discount: 0,
      shipping,
      total,
      status: 'PENDING_CONFIRMATION',
      items: {
        create: itemsToCreate
      }
    },
    include: { items: true }
  });

  return NextResponse.json(
    { placementToken: token, orderId: draftOrder.id },
    {
      headers: {
        'Set-Cookie': `placementToken=${token}; Path=/; HttpOnly; Max-Age=7200`
      }
    }
  );
}
