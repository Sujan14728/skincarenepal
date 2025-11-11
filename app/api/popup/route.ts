import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let retries = 2; // Reduced from 3 to 2
    let lastError: unknown = null;

    while (retries > 0) {
      try {
        const popups = await prisma.popupContent.findMany({
          include: { PopupDetails: true },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ popups });
      } catch (err: unknown) {
        lastError = err;
        retries--;

        // Retry on connection issues/timeouts
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              String((err as any).message || '')
            : '';
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              String((err as any).code || '')
            : '';

        if (
          code === 'P2024' ||
          message.toLowerCase().includes('connection') ||
          message.toLowerCase().includes('timeout')
        ) {
          await new Promise(r => setTimeout(r, 500)); // Reduced from 1000ms to 500ms
          continue;
        }
        break;
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Error fetching popups:', error);
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          String((error as any).code || '')
        : '';
    if (code === 'P2024') {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Database connection failed' },
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
        PopupDetails: {
          create: (popupdetails || []).map(
            (d: { name: string; image: string }) => ({
              name: d.name,
              image: d.image
            })
          )
        },
        updatedAt: new Date()
      },
      include: { PopupDetails: true }
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
