import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma, prismaErrorCode } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const marquee = await prisma.marquee.findUnique({ where: { id } });
    if (!marquee) {
      return NextResponse.json({ error: 'Marquee not found' }, { status: 404 });
    }
    return NextResponse.json(marquee);
  } catch (err) {
    console.error(`Marquee fetch error for ID ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch marquee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const id = parseInt((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { text } = body;

    // Validate text
    if (
      !text ||
      typeof text !== 'string' ||
      text.trim().length === 0 ||
      text.length > 500
    ) {
      return NextResponse.json(
        {
          error:
            'Text is required, must be a non-empty string, and under 500 characters'
        },
        { status: 400 }
      );
    }

    const updated = await prisma.marquee.update({
      where: { id },
      data: { text: text.trim() } // Trim and update (updatedAt auto-handles if @updatedAt is in schema)
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (prismaErrorCode(err) === 'P2025') {
      return NextResponse.json({ error: 'Marquee not found' }, { status: 404 });
    }
    console.error(`Marquee update error for ID ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to update marquee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const id = parseInt((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.marquee.delete({ where: { id } });
    return NextResponse.json({ message: 'Marquee deleted successfully' });
  } catch (err) {
    if (prismaErrorCode(err) === 'P2025') {
      return NextResponse.json({ error: 'Marquee not found' }, { status: 404 });
    }
    console.error(`Marquee delete error for ID ${id}:`, err);
    return NextResponse.json(
      { error: 'Failed to delete marquee' },
      { status: 500 }
    );
  }
}
