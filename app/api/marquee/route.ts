import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // your prisma client
// import { errorMonitor } from 'nodemailer/lib/xoauth2';

export async function GET() {
  try {
    const marquees = await prisma.marquee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ marquees });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch marquees' },
      { status: 500 }
    );
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
