import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { OrderStatus } from '@prisma/client';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const EMAIL_CONFIGURED = Boolean(
  process.env.EMAIL_USER && process.env.EMAIL_PASS
);

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
  const logoUrl = `${getOrigin()}/images/logo.jpg`;
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
  confirmLink: string
) {
  if (!EMAIL_CONFIGURED) return;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `[${STORE_NAME}] Action required: confirm order ${orderNumber}`,
    text: `Thanks for your order!

Store: ${STORE_NAME}
Order number: ${orderNumber}

To continue processing, please confirm your order by opening this link:
${confirmLink}

If you did not place this order, you can ignore this email.`,
    html: `<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #111827;">
            ${brandedHeaderHtml()}
            <h2 style="margin: 0 0 12px;">Thanks for your order</h2>
            <p style="margin: 0 0 12px;">Your order number is <b>${orderNumber}</b>.</p>
            <p style="margin: 0 0 16px;">To continue processing your order, please confirm it using the button below.</p>
            <p style="margin: 0 0 20px;"><a href="${confirmLink}" style="display:inline-block; background:#111827; color:#ffffff; padding:10px 16px; text-decoration:none; border-radius:6px;">Confirm my order</a></p>
            <p style="margin: 0 0 8px;">If the button doesn’t work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color:#374151;">${confirmLink}</p>
            ${brandedFooterHtml()}
            <p style="font-size:12px; color:#6b7280; margin-top:12px;">If you didn’t place this order, you can safely ignore this email.</p>
          </div>`
  });
}

export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: OrderStatus
) {
  if (!EMAIL_CONFIGURED) return;
  const human = status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `[${STORE_NAME}] Order ${orderNumber} status: ${human}`,
    text: `Update on your order ${orderNumber} at ${STORE_NAME}: Status is now ${human}. If you have any questions, contact us at ${SUPPORT_EMAIL}.`,
    html: `<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #111827;">
            ${brandedHeaderHtml()}
            <p style="margin: 0 0 12px;">Update on your order <b>${orderNumber}</b>:</p>
            <p style="margin: 0 0 12px;">Current status: <b>${human}</b>.</p>
            <p style="margin: 0 0 12px;">We'll keep you informed of any changes. You can reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#111827; text-decoration:none;">${SUPPORT_EMAIL}</a>.</p>
            ${brandedFooterHtml()}
          </div>`
  });
}
