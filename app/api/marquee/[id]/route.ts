import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id);
  if (isNaN(id))
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const marquee = await prisma.marquee.findUnique({ where: { id } });
    if (!marquee)
      return NextResponse.json({ error: 'Marquee not found' }, { status: 404 });
    return NextResponse.json(marquee);
  } catch (err) {
    console.error(err);
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
  const id = parseInt((await params).id);
  const { text } = await req.json();

  if (isNaN(id))
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  if (!text)
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });

  try {
    const updated = await prisma.marquee.update({
      where: { id },
      data: { text }
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
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
  const id = parseInt((await params).id);
  if (isNaN(id))
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    await prisma.marquee.delete({ where: { id } });
    return NextResponse.json({ message: 'Marquee deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to delete marquee' },
      { status: 500 }
    );
  }
}
