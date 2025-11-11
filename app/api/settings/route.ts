import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 1 }
  });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  try {
    const { deliveryCost, freeShippingThreshold, qrImageUrl } =
      await req.json();

    const updated = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: { deliveryCost, freeShippingThreshold, qrImageUrl },
      create: { deliveryCost, freeShippingThreshold, qrImageUrl }
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
