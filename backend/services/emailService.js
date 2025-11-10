// services/emailService.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const createTransporter = async () => {
  try {
    // Get access token
    const accessToken = await oauth2Client.getAccessToken();

    // Create transporter
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    throw error;
  }
};

// Function to send verification email
const sendVerificationEmail = async (userEmail, verificationToken) => {
  // Attempt to decode token to determine the type of verification
  let verificationType = 'registration';
  try {
    const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
    if (decoded.type === 'email-change') {
      verificationType = 'email-change';
    } else if (decoded.type === 'role-update') {
      verificationType = 'role-update';
    }
  } catch (err) {
    // If token decode fails, assume it's a registration verification
    console.warn('Unable to decode verification token:', err);
  }
  
  const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
  const url = (() => {
    switch (verificationType) {
      case 'email-change':
        return `${backendBase}/api/user/verify-email-change?token=${verificationToken}`;
      case 'role-update':
        return `${backendBase}/api/user/verify-role-update?token=${verificationToken}`;
      default:
        return `${backendBase}/api/auth/verify-email?token=${verificationToken}`;
    }
  })();
  
  const subject = (() => {
    switch (verificationType) {
      case 'email-change':
        return 'Confirm Email Change - Lost & Found System';
      case 'role-update':
        return 'Confirm Role Update - Lost & Found System';
      default:
        return 'Email Verification - Lost & Found System';
    }
  })();

  const htmlContent = (() => {
    switch (verificationType) {
      case 'email-change':
        return `
          <h2>Email Change Confirmation</h2>
          <p>You have requested to change your admin email address in the Lost & Found System.</p>
          <p>Please click the link below to confirm this change:</p>
          <p><a href="${url}">Confirm Email Change</a></p>
          <p>For security, this link will expire in 1 hour.</p>
          <p>If you did not request this change, please ignore this email or contact support.</p>
        `;
      case 'role-update':
        return `
          <h2>Role Update Confirmation</h2>
          <p>Your role in the Lost & Found System is being updated to Security Staff.</p>
          <p>Please click the link below to confirm this change:</p>
          <p><a href="${url}">Confirm Role Update</a></p>
          <p>For security, this link will expire in 1 hour.</p>
          <p>If you did not expect this change, please ignore this email or contact support.</p>
        `;
      default:
        return `<h2>Email Verification</h2>
          <p>Please click the link below to verify your email address:</p>
          <p><a href="${url}">Verify Email Address</a></p>
          <p>For security, this link will expire in 1 hour.</p>`;
    }
  })();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject,
    html: htmlContent,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Throw so callers (routes) can detect failure and retry/rollback as needed
    throw error;
  }
};

export default sendVerificationEmail;
