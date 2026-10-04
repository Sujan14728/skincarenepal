import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaErrorCode } from '@/lib/prisma';
import { getAdmin } from '@/lib/auth';
import {
  parseReviewInput,
  readJsonObject
} from '@/lib/reviews-validation';

export const dynamic = 'force-dynamic';

const productSelect = { select: { id: true, name: true, slug: true } };

// GET /api/reviews            → published reviews (public)
// GET /api/reviews?scope=all  → every review, for the admin panel
export async function GET(req: NextRequest) {
  try {
    const scopeAll = req.nextUrl.searchParams.get('scope') === 'all';

    if (scopeAll && !(await getAdmin(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: scopeAll ? {} : { isPublished: true },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: { product: productSelect }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const parsed = parseReviewInput(body, { partial: false });
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: parsed.data,
      include: { product: productSelect }
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (prismaErrorCode(error) === 'P2003') {
      return NextResponse.json(
        { error: 'Selected product does not exist.' },
        { status: 400 }
      );
    }
    console.error('Review create error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
