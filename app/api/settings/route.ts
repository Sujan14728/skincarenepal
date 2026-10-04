import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 1 }
  });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Partial update: only fields present in the body change, so the QR
    // upload can save just the URL.
    const data: {
      deliveryCost?: number;
      freeShippingThreshold?: number;
      qrImageUrl?: string | null;
    } = {};
    for (const key of ['deliveryCost', 'freeShippingThreshold'] as const) {
      if (body[key] === undefined) continue;
      // Number(null) and Number('') are 0, so reject them explicitly.
      const raw = body[key];
      const value = raw === null || raw === '' ? NaN : Number(raw);
      if (!Number.isInteger(value) || value < 0) {
        return NextResponse.json(
          { error: 'Amounts must be whole numbers of 0 or more.' },
          { status: 400 }
        );
      }
      data[key] = value;
    }
    if (body.qrImageUrl !== undefined) {
      data.qrImageUrl = body.qrImageUrl ? String(body.qrImageUrl) : null;
    }

    const updated = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
