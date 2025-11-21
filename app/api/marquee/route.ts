import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

// Utility for query timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ]);

export async function GET() {
  try {
    const marquees = await withTimeout(
      prisma.marquee.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      3000
    );
    return NextResponse.json({ marquees });
  } catch (err) {
    console.error('Marquee fetch error:', err);
    return NextResponse.json({ marquees: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;
    // Validate text: required, string, and reasonable length
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
    // Create marquee (include updatedAt since it's required)
    const newMarquee = await prisma.marquee.create({
      data: { text: text.trim(), updatedAt: new Date() }
    });
    return NextResponse.json(newMarquee);
  } catch (err) {
    console.error('Marquee creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create marquee' },
      { status: 500 }
    );
  }
}
