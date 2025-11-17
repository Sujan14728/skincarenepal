import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    // Add timeout to prevent hanging connections
    const marquees = await Promise.race([
      prisma.marquee.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit results
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 3000)
      )
    ]);
    return NextResponse.json({ marquees });
  } catch (err) {
    console.error('Marquee fetch error:', err);
    // Return empty array on error to prevent UI breaking
    return NextResponse.json({ marquees: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text)
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });

    const newMarquee = await prisma.marquee.create({
      data: { text, updatedAt: new Date() }
    });
    return NextResponse.json(newMarquee);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create marquee' },
      { status: 500 }
    );
  }
}
