import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const popups = await prisma.popupContent.findMany({
      include: { popupdetails: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ popups });
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed', error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, popupdetails } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const popup = await prisma.popupContent.create({
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

    return NextResponse.json(popup, { status: 201 });
  } catch (error) {
    console.error('Error creating popup:', error);
    return NextResponse.json(
      { error: 'Failed to create popup' },
      { status: 500 }
    );
  }
}
