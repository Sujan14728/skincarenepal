import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { transporter } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    const payload = await verifyToken(token);
    if (!payload || !('isAdmin' in payload) || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    const { orderId, subject, message } = await req.json();
    if (!orderId || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    });
    if (!order || !order.email)
      return NextResponse.json(
        { error: 'Order or email not found' },
        { status: 404 }
      );
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.email,
      subject,
      text: message,
      html: `<p>${message}</p>`
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
