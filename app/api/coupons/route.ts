import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountAmount,
      isPercentage,
      active,
      usageLimit,
      validFrom,
      validUntil
    } = body ?? {};

    // Basic validation
    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Coupon code is required.' },
        { status: 400 }
      );
    }
    if (discountAmount == null || isNaN(discountAmount)) {
      return NextResponse.json(
        { error: 'Discount amount is required.' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim(),
        discountAmount,
        isPercentage: !!isPercentage,
        active: active !== false, // default true
        usageLimit: usageLimit ?? null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null
      }
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
    const skip = (page - 1) * limit;

    const q = url.searchParams.get('q');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (q) {
      where.OR = [{ code: { contains: q, mode: 'insensitive' } }];
    }

    const [total, coupons] = await Promise.all([
      prisma.coupon.count({ where }),
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return NextResponse.json({ total, page, limit, coupons });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body ?? {};

    if (!id)
      return NextResponse.json(
        { error: 'Coupon ID is required.' },
        { status: 400 }
      );

    const updated = await prisma.coupon.update({
      where: { id: Number(id) },
      data: {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null
      }
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const idParam = url.searchParams.get('id');

    if (!idParam)
      return NextResponse.json(
        { error: 'Coupon ID is required.' },
        { status: 400 }
      );

    const deleted = await prisma.coupon.delete({
      where: { id: Number(idParam) }
    });

    return NextResponse.json({ success: true, coupon: deleted });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
