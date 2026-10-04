import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaErrorCode } from '@/lib/prisma';
import { getAdmin } from '@/lib/auth';
import {
  parseReviewInput,
  readJsonObject,
  reviewConsistencyError
} from '@/lib/reviews-validation';

const productSelect = { select: { id: true, name: true, slug: true } };

const parseId = async (params: Promise<{ id: string }>) => {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = await parseId(params);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const parsed = parseReviewInput(body, { partial: true });
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({
      where: { id },
      select: { type: true, content: true, mediaUrl: true }
    });
    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    const error = reviewConsistencyError({ ...existing, ...parsed.data });
    if (error) return NextResponse.json({ error }, { status: 400 });

    const review = await prisma.review.update({
      where: { id },
      data: parsed.data,
      include: { product: productSelect }
    });
    return NextResponse.json({ review });
  } catch (err) {
    const code = prismaErrorCode(err);
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'Selected product does not exist.' },
        { status: 400 }
      );
    }
    console.error(`Review update error for ID ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = await parseId(params);
  if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (prismaErrorCode(err) === 'P2025') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    console.error(`Review delete error for ID ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
