import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      usageLimit,
      productId,
      validFrom,
      validUntil,
      isActive
    } = body ?? {};

    // Basic validation
    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Coupon code is required.' },
        { status: 400 }
      );
    }
    if (!discountType || !['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Discount type must be PERCENTAGE or FIXED.' },
        { status: 400 }
      );
    }
    if (discountValue == null || isNaN(discountValue)) {
      return NextResponse.json(
        { error: 'Discount value is required.' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim(),
        discountType,
        discountValue: Number(discountValue),
        minPurchase: minPurchase ? Number(minPurchase) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        productId: productId ? Number(productId) : null,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        isActive: isActive !== false
      }
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
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
        take: limit,
        include: { product: { select: { id: true, name: true } } }
      })
    ]);

    return NextResponse.json({ total, page, limit, coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
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

    console.log('PUT request body:', body);
    console.log('Coupon ID:', id);

    if (!id) {
      console.log('coupon id is required while updating the coupon');
      return NextResponse.json(
        { error: 'Coupon ID is required.' },
        { status: 400 }
      );
    }

    const updated = await prisma.coupon.update({
      where: { id: Number(id) },
      data: {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null
      }
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    console.error('Error updating coupon:', error);
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
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
