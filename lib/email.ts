import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string
) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Order Confirmation',
    text: `Thank you for your order. Your order number is ${orderNumber}.`,
    html: `<h2>Thank you for your order!</h2>
           <p>Your order number is <b>${orderNumber}</b>.</p>
           <p>We will notify you when your order is shipped.</p>`
  });
}
