import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const popup = await prisma.popupContent.findUnique({
      where: { id: Number(params.id) },
      include: { popupdetails: true }
    });

    if (!popup) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

    return NextResponse.json(popup);
  } catch (error) {
    console.error('Error fetching popup:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, popupdetails } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await prisma.popupDetails.deleteMany({
      where: { popupContentId: Number(params.id) }
    });

    const popup = await prisma.popupContent.update({
      where: { id: Number(params.id) },
      data: {
        title,
        description: description || '',
        popupdetails: {
          create: (popupdetails || []).map(
            (d: { name: string; image: string }) => ({
              name: d.name,
              image: d.image
            })
          )
        }
      },
      include: { popupdetails: true }
    });

    return NextResponse.json(popup);
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.popupDetails.deleteMany({
      where: { popupContentId: Number(params.id) }
    });

    await prisma.popupContent.delete({ where: { id: Number(params.id) } });

    return NextResponse.json({ message: 'Popup deleted successfully' });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
