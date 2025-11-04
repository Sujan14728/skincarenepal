import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { ContactStatus, Prisma } from '@prisma/client';

// GET /api/contact/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (contact.status === ContactStatus.UNREAD) {
      await prisma.contact.update({
        where: { id },
        data: { status: ContactStatus.READ }
      });
      contact.status = ContactStatus.READ;
    }

    return NextResponse.json({ contact });
  } catch (err) {
    console.error('Get contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/contact/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status, replyMessage } = body ?? {};

    const data: Prisma.ContactUpdateInput = {};

    if (status && Object.values(ContactStatus).includes(status)) {
      data.status = status as ContactStatus;
    }

    if (replyMessage) {
      const existingContact = await prisma.contact.findUnique({
        where: { id }
      });
      if (!existingContact) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      data.message = `${existingContact.message}\n\n---\nReply:\n${replyMessage}`;
      if (!status) data.status = ContactStatus.REPLIED;
    }

    const updated = await prisma.contact.update({ where: { id }, data });
    return NextResponse.json({ success: true, contact: updated });
  } catch (err) {
    console.error('Update contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/contact/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
