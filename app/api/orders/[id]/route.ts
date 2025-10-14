import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';
import { sendOrderStatusEmail } from '@/lib/email';

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  const payload = await verifyToken(token);
  if (!payload || !('isAdmin' in payload) || !payload.isAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const id = Number((await params).id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });
    if (!order)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

type UpdatePayload = {
  status?: OrderStatus;
  note?: string | null;
  paymentSlipUrl?: string | null;
  verifiedAt?: string | null;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const id = Number((await params).id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body: UpdatePayload = await req.json();

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: body.status,
        note: body.note,
        paymentSlipUrl: body.paymentSlipUrl,
        verifiedAt: body.verifiedAt ? new Date(body.verifiedAt) : undefined
      }
    });
    if (body.status && updated.email) {
      await sendOrderStatusEmail(
        updated.email,
        updated.orderNumber,
        body.status
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const id = Number((await params).id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } })
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
