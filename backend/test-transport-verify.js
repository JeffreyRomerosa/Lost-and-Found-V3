import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { google } from 'googleapis';

async function run() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

    console.log('Requesting access token...');
    const accessTokenRes = await oauth2Client.getAccessToken();
    const accessToken = (accessTokenRes && accessTokenRes.token) ? accessTokenRes.token : accessTokenRes;
    console.log('Access token obtained. length:', accessToken ? accessToken.length : '<none>');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified OK');

    // Optionally send a small test message
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'OAuth2 transporter test',
      text: 'This is a test sent using OAuth2 transporter',
    });

    console.log('Test email sent, response id:', info.messageId || info.response);
  } catch (err) {
    console.error('Transport verify/send failed:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exitCode = 1;
  }
}

run();
