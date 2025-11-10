import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP verified OK');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'SMTP test from LostAndFoundAiPowered',
      text: 'This is a test message to verify SMTP credentials.',
    });

    console.log('Sent:', info.response || info.messageId);
  } catch (err) {
    console.error('SMTP test failed:', err);
    process.exitCode = 1;
  }
}

if (require.main === module) test();
