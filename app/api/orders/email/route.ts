import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendCustomOrderEmail } from '@/lib/email';

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
      where: { id: Number(orderId) },
      include: { items: true }
    });
    if (!order || !order.email)
      return NextResponse.json(
        { error: 'Order or email not found' },
        { status: 404 }
      );
    // build items summary for text and html
    const itemsText = (order.items || [])
      .map(
        i =>
          `- ${i.name} x${i.quantity} @ Rs. ${i.price} = Rs. ${i.price * i.quantity}`
      )
      .join('\n');
    const itemsHtml = (order.items || [])
      .map(
        i =>
          `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:center">${i.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price * i.quantity}</td></tr>`
      )
      .join('');

    const totalsText = `\nSubtotal: Rs. ${order.subtotal || 0}\nShipping: Rs. ${order.shipping || 0}\nDiscount: Rs. ${order.discount || 0}\nTotal: Rs. ${order.total || 0}`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#111827; line-height:1.4;">
        <p>${message}</p>
        <h4 style="margin-top:12px">Order ${order.orderNumber} items</h4>
        <table style="width:100%; border-collapse:collapse; margin-top:8px">
          <thead>
            <tr>
              <th style="text-align:left; padding:6px 8px; border-bottom:1px solid #ddd">Item</th>
              <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #ddd">Qty</th>
              <th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Price</th>
              <th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Line</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="margin-top:12px; font-size:14px;">
          <div>Subtotal: Rs. ${order.subtotal || 0}</div>
          <div>Shipping: Rs. ${order.shipping || 0}</div>
          <div>Discount: Rs. ${order.discount || 0}</div>
          <div style="font-weight:600; margin-top:6px">Total: Rs. ${order.total || 0}</div>
        </div>
      </div>
    `;

    await sendCustomOrderEmail(order.email, subject, message, order);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
