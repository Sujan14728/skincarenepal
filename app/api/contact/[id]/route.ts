// app/api/dashboard/contacts/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);
    if (!user || !user.isAdmin)
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );

    const id = Number(params.id);
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Optionally mark as READ when admin views
    if (contact.status === 'UNREAD') {
      await prisma.contact.update({ where: { id }, data: { status: 'READ' } });
      contact.status = 'READ';
    }

    return NextResponse.json({ contact });
  } catch (err) {
    console.error('Get contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);
    if (!user || !user.isAdmin)
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );

    const id = Number(params.id);
    const body = await req.json();
    const { status, replyMessage } = body ?? {}; // status should be one of enum values

    const data: any = {};
    if (status) data.status = status;
    if (replyMessage)
      data.message = `${(await prisma.contact.findUnique({ where: { id } })).message}\n\n---\nReply:\n${replyMessage}`;

    // If replying, you might want to send an email via your mailer here and set status to REPLIED
    if (replyMessage && !status) data.status = 'REPLIED';

    const updated = await prisma.contact.update({ where: { id }, data });
    return NextResponse.json({ success: true, contact: updated });
  } catch (err) {
    console.error('Update contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);
    if (!user || !user.isAdmin)
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );

    const id = Number(params.id);

    // Permanently delete the contact
    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
