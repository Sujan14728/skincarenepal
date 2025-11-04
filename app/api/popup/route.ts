import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let retries = 3;
    let lastError: unknown = null;

    while (retries > 0) {
      try {
        const popups = await prisma.popupContent.findMany({
          include: { popupdetails: true },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ popups });
      } catch (err: unknown) {
        lastError = err;
        retries--;

        // Retry on connection issues/timeouts
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as any).message || '')
            : '';
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? String((err as any).code || '')
            : '';

        if (
          code === 'P2024' ||
          message.toLowerCase().includes('connection') ||
          message.toLowerCase().includes('timeout')
        ) {
          await new Promise(r => setTimeout(r, 1000));
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
        ? String((error as any).code || '')
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
