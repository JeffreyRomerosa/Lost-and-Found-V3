import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Configure OAuth2 client (reuse configuration from emailService)
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
    const accessToken = await oauth2Client.getAccessToken();
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

/**
 * Send email notification about a matched item
 */
const sendMatchNotificationEmail = async (userEmail, matchDetails) => {
  const {
    itemName,
    itemType,
    itemLocation,
    matchedItemName,
    matchedType,
    matchedLocation,
    category
  } = matchDetails;

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:8080';
  const url = `${frontendBase}/notifications`;

  let htmlContent = `
    <h2>Item Match Found!</h2>
    <p>Good news! We've found a potential match for your item.</p>
    
    <h3>Your Item Details:</h3>
    <ul>
      <li><strong>Item:</strong> ${itemName || 'N/A'}</li>
      <li><strong>Type:</strong> ${itemType}</li>
      <li><strong>Location:</strong> ${itemLocation || 'N/A'}</li>
    </ul>

    <h3>Matched Item Details:</h3>
    <ul>
      <li><strong>Item:</strong> ${matchedItemName || 'N/A'}</li>
      <li><strong>Type:</strong> ${matchedType}</li>
      <li><strong>Location:</strong> ${matchedLocation || 'N/A'}</li>
    </ul>

    <p>Please click the button below to view the match details:</p>
    <p>
      <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Match Details
      </a>
    </p>

    <p style="color: #666; font-size: 0.9em;">
      Note: Please check your in-app notifications for more detailed information and next steps.
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Match Found - Lost & Found System',
    html: htmlContent,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    console.log('Match notification email sent successfully');
  } catch (error) {
    console.error('Error sending match notification email:', error);
    // Log error but don't throw - we don't want email failures to block the main flow
    // The in-app notification will still be created
  }
};

/**
 * Send a notification through email and create an in-app notification
 */
const createMatchNotification = async (pool, {
  userId,
  userEmail,
  itemId,
  matchId,
  category,
  matchDetails
}) => {
  try {
    // 1. Create in-app notification
    await pool.query(
      `INSERT INTO notifications (user_id, item_id, match_id, category, type)
       VALUES ($1, $2, $3, $4, 'match_generated')`,
      [userId, itemId, matchId, category]
    );

    // 2. Send email notification
    await sendMatchNotificationEmail(userEmail, matchDetails);

  } catch (error) {
    console.error('Error creating match notification:', error);
    throw error;
  }
};

export { sendMatchNotificationEmail, createMatchNotification };