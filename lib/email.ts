import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { OrderStatus } from '@prisma/client';
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const EMAIL_CONFIGURED = Boolean(
  process.env.EMAIL_USER && process.env.EMAIL_PASS
);

// Log email configuration status on module load
if (!EMAIL_CONFIGURED) {
  console.warn(
    '⚠️  Email is NOT configured - missing EMAIL_USER or EMAIL_PASS environment variables'
  );
} else {
  console.log('✅ Email configured for:', process.env.EMAIL_USER);
}

const STORE_NAME = process.env.STORE_NAME || 'Skincare Nepal';
const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL ||
  process.env.EMAIL_USER ||
  'support@skincarenepal.com';

function getOrigin() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';
  return base.startsWith('http') ? base : `https://${base}`;
}

function brandedHeaderHtml() {
  const logoUrl = `${getOrigin()}/logo.jpg`;
  return `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
      <img src="${logoUrl}" alt="${STORE_NAME} logo" width="36" height="36" style="border-radius:6px; object-fit:cover;" />
      <div style="font-size:16px; font-weight:600; color:#111827;">${STORE_NAME}</div>
    </div>
  `;
}

function brandedFooterHtml() {
  return `
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />
    <div style="font-size:12px; color:#6b7280;">
      <div style="margin-bottom:4px;">Thank you for shopping with ${STORE_NAME}.</div>
      <div>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#111827; text-decoration:none;">${SUPPORT_EMAIL}</a>.</div>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string
) {
  if (!EMAIL_CONFIGURED) return;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `[${STORE_NAME}] Order Confirmation`,
    text: `Thank you for your order at ${STORE_NAME}. Your order number is ${orderNumber}. We will notify you when your order is shipped.`,
    html: `<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #111827;">
            ${brandedHeaderHtml()}
            <h2 style="margin: 0 0 12px;">Thank you for your order!</h2>
            <p style="margin: 0 0 12px;">Your order number is <b>${orderNumber}</b>.</p>
            <p style="margin: 0 0 12px;">We will notify you when your order is shipped.</p>
            ${brandedFooterHtml()}
          </div>`
  });
}

export async function sendOrderPlacementEmail(
  to: string,
  orderNumber: string,
  confirmLink: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order?: any
) {
  if (!EMAIL_CONFIGURED) {
    console.warn(
      '⚠️  Email not configured - cannot send order placement email to:',
      to
    );
    return;
  }

  console.log('📧 Preparing order placement email:', {
    to,
    orderNumber,
    hasOrderData: !!order,
    itemCount: order?.items?.length || 0
  });

  try {
    const items = order?.items || [];
    const itemsHtml = items
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (i: any) =>
          `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:center">${i.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price * i.quantity}</td></tr>`
      )
      .join('');

    const totalsHtml = order
      ? `<div style="margin-top:12px; font-size:14px;"><div>Subtotal: Rs. ${order.subtotal || 0}</div><div>Shipping: ${order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping || 0}`}</div><div style="font-weight:600; margin-top:6px">Total: Rs. ${order.total || 0}</div></div>`
      : '';

    const addressHtml = order?.shippingAddress
      ? `<div style="margin-top:12px;"><div style="font-weight:600">Shipping address</div><div style="white-space:pre-wrap">${order.shippingAddress}</div></div>`
      : '';

    const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #111827;">
      ${brandedHeaderHtml()}
      <h2 style="margin: 0 0 12px;">Thanks for your order</h2>
      <p style="margin: 0 0 12px;">Your order number is <b>${orderNumber}</b>.</p>
      ${addressHtml}
      ${itemsHtml ? `<h4 style="margin-top:12px">Items</h4><table style="width:100%; border-collapse:collapse; margin-top:8px"><thead><tr><th style="text-align:left; padding:6px 8px; border-bottom:1px solid #ddd">Item</th><th style="text-align:center; padding:6px 8px; border-bottom:1px solid #ddd">Qty</th><th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Price</th><th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Line</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ''}
      ${totalsHtml}
      <p style="margin: 0 0 16px;">To continue processing your order, please confirm it using the button below.</p>
      <p style="margin: 0 0 20px;"><a href="${confirmLink}" style="display:inline-block; background:#111827; color:#ffffff; padding:10px 16px; text-decoration:none; border-radius:6px;">Confirm my order</a></p>
      <p style="margin: 0 0 8px;">If the button doesn’t work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color:#374151;">${confirmLink}</p>
      ${brandedFooterHtml()}
      <p style="font-size:12px; color:#6b7280; margin-top:12px;">If you didn’t place this order, you can safely ignore this email.</p>
    </div>
  `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `[${STORE_NAME}] Action required: confirm order ${orderNumber}`,
      text: `Thanks for your order!\n\nStore: ${STORE_NAME}\nOrder number: ${orderNumber}\n\nTo continue processing, please confirm your order by opening this link:\n${confirmLink}\n\nIf you did not place this order, you can ignore this email.`,
      html
    });
  } catch (error) {
    console.error('Error sending order placement email:', error);
    throw error; // Re-throw so caller can handle
  }
}

export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: OrderStatus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order?: any
) {
  if (!EMAIL_CONFIGURED) return;
  const human = status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  // if order provided, include items and totals
  const items = order?.items || [];
  const itemsHtml = items
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:center">${i.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price * i.quantity}</td></tr>`
    )
    .join('');

  const totalsHtml = order
    ? `<div style="margin-top:12px; font-size:14px;"><div>Subtotal: Rs. ${order.subtotal || 0}</div><div>Shipping: ${order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping || 0}`}</div><div style="font-weight:600; margin-top:6px">Total: Rs. ${order.total || 0}</div></div>`
    : '';

  const addressHtml = order?.shippingAddress
    ? `<div style="margin-top:12px;"><div style="font-weight:600">Shipping address</div><div style="white-space:pre-wrap">${order.shippingAddress}</div></div>`
    : '';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #111827;">
      ${brandedHeaderHtml()}
      <p style="margin: 0 0 12px;">Update on your order <b>${orderNumber}</b>:</p>
      <p style="margin: 0 0 12px;">Current status: <b>${human}</b>.</p>
      ${addressHtml}
      ${itemsHtml ? `<h4 style="margin-top:12px">Items</h4><table style="width:100%; border-collapse:collapse; margin-top:8px"><thead><tr><th style="text-align:left; padding:6px 8px; border-bottom:1px solid #ddd">Item</th><th style="text-align:center; padding:6px 8px; border-bottom:1px solid #ddd">Qty</th><th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Price</th><th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Line</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ''}
      ${totalsHtml}
      <p style="margin: 0 0 12px;">We'll keep you informed of any changes. You can reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#111827; text-decoration:none;">${SUPPORT_EMAIL}</a>.</p>
      ${brandedFooterHtml()}
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `[${STORE_NAME}] Order ${orderNumber} status: ${human}`,
    text: `Update on your order ${orderNumber} at ${STORE_NAME}: Status is now ${human}. If you have any questions, contact us at ${SUPPORT_EMAIL}.`,
    html
  });
}

export async function sendCustomOrderEmail(
  to: string,
  subject: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order?: any
) {
  if (!EMAIL_CONFIGURED) return;

  const items = order?.items || [];
  const itemsText = items
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) =>
        `- ${i.name} x${i.quantity} @ Rs. ${i.price} = Rs. ${i.price * i.quantity}`
    )
    .join('\n');

  const itemsHtml = items
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:center">${i.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price}</td><td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right">Rs. ${i.price * i.quantity}</td></tr>`
    )
    .join('');

  const totalsText = `\nSubtotal: Rs. ${order?.subtotal || 0}\nShipping: ${order?.shipping === 0 ? 'FREE' : `Rs. ${order?.shipping || 0}`}\nTotal: Rs. ${order?.total || 0}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color:#111827; line-height:1.4;">
      ${brandedHeaderHtml()}
      <p>${message}</p>
      ${order?.orderNumber ? `<h4 style="margin-top:12px">Order ${order.orderNumber} items</h4>` : ''}
      ${itemsHtml ? `<table style="width:100%; border-collapse:collapse; margin-top:8px"><thead><tr><th style="text-align:left; padding:6px 8px; border-bottom:1px solid #ddd">Item</th><th style="text-align:center; padding:6px 8px; border-bottom:1px solid #ddd">Qty</th><th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Price</th><th style="text-align:right; padding:6px 8px; border-bottom:1px solid #ddd">Line</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ''}
      ${order ? `<div style="margin-top:12px; font-size:14px;"><div>Subtotal: Rs. ${order.subtotal || 0}</div><div>Shipping: ${order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping || 0}`}</div><div style="font-weight:600; margin-top:6px">Total: Rs. ${order.total || 0}</div></div>` : ''}
      ${brandedFooterHtml()}
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `[${STORE_NAME}] ${subject}`,
    text: `${message}\n\n${order?.orderNumber ? `Order ${order.orderNumber} items:\n${itemsText}` : ''}${order ? totalsText : ''}`,
    html
  });
}
