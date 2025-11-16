import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

  const draftOrder = await prisma.order.create({
    data: {
      placementTokenHash: tokenHash,
      placementTokenExpiresAt: tokenExpiry,
      // adjust these to match your schema types:
      shippingAddress: '', // or {} if it's Json
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      status: 'DRAFT'
    }
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
