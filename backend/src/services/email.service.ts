import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'test@memori.app') {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // In dev / test, log emails directly to console/logger
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }
  return transporter;
}

export async function sendReminderEmail(
  to: string,
  itemTitle: string,
  category: string,
  expiryDate?: string | null,
  reminderType = 'expiry'
) {
  try {
    const transport = getTransporter();
    const subject = `[MEMORI] Reminder: ${itemTitle} requires your attention`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1E1E2A; background-color: #F7F5F0; border-radius: 12px;">
        <h1 style="color: #1A1A2E; margin-bottom: 8px;">MEMORI</h1>
        <p style="color: #4A4A5A; margin-top: 0;">Your life. Organized. Remembered.</p>
        <hr style="border: none; border-top: 1px solid #E4E2DC; margin: 20px 0;" />
        
        <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(26,26,46,0.08);">
          <h2 style="margin-top: 0; color: #1A1A2E;">${itemTitle}</h2>
          <p style="margin: 4px 0;"><strong>Category:</strong> <span style="text-transform: capitalize;">${category}</span></p>
          ${expiryDate ? `<p style="margin: 4px 0;"><strong>Expiry Date:</strong> ${expiryDate}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Type:</strong> <span style="text-transform: capitalize;">${reminderType}</span></p>
          
          <div style="margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #1A1A2E; color: #FFFFFF; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 500;">
              Open MEMORI Life Map
            </a>
          </div>
        </div>

        <p style="font-size: 12px; color: #8A8A9A; margin-top: 24px; text-align: center;">
          You received this email because you enabled smart reminders in MEMORI.
        </p>
      </div>
    `;

    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'MEMORI <notifications@memori.app>',
      to,
      subject,
      html,
    });

    logger.info('Reminder email dispatched', { to, itemTitle, messageId: info.messageId });
    return true;
  } catch (error: any) {
    logger.error('Failed to send reminder email', { error: error.message, to, itemTitle });
    return false;
  }
}
