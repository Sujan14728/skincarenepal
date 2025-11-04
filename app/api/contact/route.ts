import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, ContactStatus } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { isEmail, isNonEmptyString } from '@/lib/validate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body ?? {};

    if (!isNonEmptyString(name))
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!isEmail(email))
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    if (!isNonEmptyString(subject))
      return NextResponse.json(
        { error: 'Subject is required.' },
        { status: 400 }
      );
    if (!isNonEmptyString(message))
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? String(phone).trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        updatedAt: new Date()
      }
    });
    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'unauthorized access required' },
        { status: 401 }
      );
    }

    const url = req.nextUrl;
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 100);
    const skip = (page - 1) * limit;

    const status = url.searchParams.get('status');
    const q = url.searchParams.get('q');

    const where: Prisma.ContactWhereInput = {};

    // ✅ FIX: Use ContactStatus directly
    if (
      status &&
      Object.values(ContactStatus).includes(status as ContactStatus)
    ) {
      where.status = status as ContactStatus;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [total, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return NextResponse.json({
      total,
      page,
      limit,
      contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
