#!/usr/bin/env node
/**
 * Test script to verify cPanel SMTP email configuration
 * Run: node scripts/test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n=== Testing cPanel SMTP Configuration ===\n');

  // Display current config (masked password)
  console.log('Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  Secure: ${process.env.SMTP_SECURE}`);
  console.log(`  User: ${process.env.EMAIL_USER}`);
  console.log(
    `  Pass: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-3) : 'NOT SET'}`
  );
  console.log(`  From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'agni.secureshieldserver.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    const testRecipient = process.env.TEST_EMAIL_TO || process.env.EMAIL_USER;
    console.log(`Sending test email to: ${testRecipient}`);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: testRecipient,
      subject: `[${process.env.STORE_NAME || 'Test'}] SMTP Test Email`,
      text: `This is a test email sent from your cPanel SMTP configuration.\n\nSMTP Host: ${process.env.SMTP_HOST}\nSent at: ${new Date().toISOString()}\n\nIf you received this, your email configuration is working correctly!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2 style="color: #059669;">✅ SMTP Test Successful</h2>
          <p>This is a test email sent from your cPanel SMTP configuration.</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 4px 8px; font-weight: 600;">SMTP Host:</td><td style="padding: 4px 8px;">${process.env.SMTP_HOST}</td></tr>
            <tr><td style="padding: 4px 8px; font-weight: 600;">Port:</td><td style="padding: 4px 8px;">${process.env.SMTP_PORT}</td></tr>
            <tr><td style="padding: 4px 8px; font-weight: 600;">Sent at:</td><td style="padding: 4px 8px;">${new Date().toISOString()}</td></tr>
          </table>
          <p>If you received this email, your configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
          <p style="font-size: 12px; color: #6b7280;">Sent from ${process.env.STORE_NAME || 'Care & Clean Nepal'}</p>
        </div>
      `
    });

    console.log('\n✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}\n`);

    console.log('🎉 Email configuration is working correctly!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error(error.message);
    if (error.code) console.error(`Error code: ${error.code}`);
    if (error.command) console.error(`Failed command: ${error.command}`);
    console.error('\nTroubleshooting:');
    console.error('1. Verify EMAIL_USER and EMAIL_PASS in .env are correct');
    console.error('2. Check SMTP_HOST is agni.secureshieldserver.com');
    console.error('3. Ensure SMTP_PORT is 465 and SMTP_SECURE=true');
    console.error(
      '4. Verify your cPanel email account is active and not suspended'
    );
    console.error(
      '5. Check if your VPS/hosting allows outbound connections on port 465\n'
    );
    process.exit(1);
  }
}

testEmail();
