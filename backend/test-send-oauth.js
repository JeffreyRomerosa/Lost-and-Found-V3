import dotenv from 'dotenv';
dotenv.config();

import sendVerificationEmail from './services/emailService.js';

async function test() {
  console.log('Starting OAuth test-send (will not print secrets).');
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER ? process.env.EMAIL_USER : '<missing>');
  try {
    // sendVerificationEmail expects (userEmail, verificationToken)
    await sendVerificationEmail(process.env.EMAIL_USER, 'TEST_TOKEN_OAUTH');
    console.log('OAuth test email sent (check inbox).');
  } catch (err) {
    console.error('OAuth test send failed. Error name/message: ', err && err.name, err && err.message);
    if (err && err.stack) console.error('Stack:', err.stack);
    process.exitCode = 1;
  }
  console.log('Finished OAuth test-send.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  test();
}
