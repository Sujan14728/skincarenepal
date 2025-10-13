import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

type Context = { params: Promise<{ id: string }> };

// GET /api/orders/[id] - Get a single order
export async function GET(req: NextRequest, context: Context) {
  const { id } = await context.params;
  try {
    const orderId = parseInt(id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(req: NextRequest, context: Context) {
  const { id } = await context.params;
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

    const orderId = parseInt(id);
    const body = await req.json();
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: body
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(req: NextRequest, context: Context) {
  const { id } = await context.params;
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

    const orderId = parseInt(id);

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!existingOrder)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId } }),
      prisma.order.delete({ where: { id: orderId } })
    ]);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
