import cron from 'node-cron';
import prisma from '../config/database';
import { sendReminderEmail } from '../services/email.service';
import { logger } from '../lib/logger';
import { UserSettings } from '../../../shared/types';

export function startReminderScheduler() {
  // Schedule daily check at 06:00 UTC (or hourly check for pending triggers)
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running daily MEMORI reminder scheduler...');
    try {
      await processDueReminders();
    } catch (err: any) {
      logger.error('Error during reminder scheduler execution', { error: err.message });
    }
  });

  logger.info('MEMORI Reminder Scheduler registered (runs daily at 06:00 UTC)');
}

export async function processDueReminders() {
  const todayStr = new Date().toISOString().split('T')[0];

  const dueReminders = await prisma.reminder.findMany({
    where: {
      scheduled_date: { lte: todayStr },
      triggered: false,
    },
    include: {
      user: true,
      item: true,
    },
  });

  logger.info(`Found ${dueReminders.length} due reminders to process.`);

  for (const reminder of dueReminders) {
    try {
      const userSettings: UserSettings = JSON.parse(reminder.user.settings || '{}');

      // Send email if user has email reminders enabled
      if (userSettings.reminder_email && reminder.user.email) {
        await sendReminderEmail(
          reminder.user.email,
          reminder.item.title,
          reminder.item.category,
          reminder.item.expiry_date,
          reminder.type
        );
      }

      // Mark reminder as triggered
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          triggered: true,
          sent_at: new Date(),
        },
      });

      // If this was an expiry reminder, update item status to needs_attention
      if (reminder.type === 'expiry' && reminder.item.status === 'complete') {
        await prisma.item.update({
          where: { id: reminder.item_id },
          data: {
            status: 'needs_attention',
            version: { increment: 1 },
          },
        });
      }
    } catch (err: any) {
      logger.error(`Failed to process reminder ${reminder.id}`, { error: err.message });
    }
  }
}
