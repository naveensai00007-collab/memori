import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ReminderType } from '../../../shared/types';

export class ReminderService {
  static async listReminders(userId: string, upcomingOnly = false) {
    const where: any = { user_id: userId };
    
    if (upcomingOnly) {
      const todayStr = new Date().toISOString().split('T')[0];
      where.scheduled_date = { gte: todayStr };
      where.acknowledged = false;
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { scheduled_date: 'asc' },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            expiry_date: true,
          },
        },
      },
    });

    return reminders.map(r => ({
      ...r,
      type: r.type as ReminderType,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
  }

  static async createReminder(userId: string, data: any) {
    const item = await prisma.item.findFirst({
      where: { id: data.item_id, user_id: userId },
    });

    if (!item) {
      throw new AppError('Associated item not found.', 404, 'ITEM_NOT_FOUND');
    }

    const reminder = await prisma.reminder.create({
      data: {
        user_id: userId,
        item_id: data.item_id,
        type: data.type,
        scheduled_date: data.scheduled_date,
      },
      include: { item: true },
    });

    return {
      ...reminder,
      type: reminder.type as ReminderType,
      created_at: reminder.created_at.toISOString(),
      updated_at: reminder.updated_at.toISOString(),
    };
  }

  static async acknowledgeReminder(userId: string, reminderId: string) {
    const reminder = await prisma.reminder.findFirst({
      where: { id: reminderId, user_id: userId },
    });

    if (!reminder) {
      throw new AppError('Reminder not found.', 404, 'REMINDER_NOT_FOUND');
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        acknowledged: true,
      },
      include: { item: true },
    });

    return {
      ...updated,
      type: updated.type as ReminderType,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    };
  }

  static async snoozeReminder(userId: string, reminderId: string, days = 7) {
    const reminder = await prisma.reminder.findFirst({
      where: { id: reminderId, user_id: userId },
    });

    if (!reminder) {
      throw new AppError('Reminder not found.', 404, 'REMINDER_NOT_FOUND');
    }

    const currentScheduled = new Date(reminder.scheduled_date);
    const newDate = new Date(currentScheduled);
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().split('T')[0];

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        scheduled_date: newDateStr,
        triggered: false,
        acknowledged: false,
      },
      include: { item: true },
    });

    return {
      ...updated,
      type: updated.type as ReminderType,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    };
  }

  static async deleteReminder(userId: string, reminderId: string) {
    const reminder = await prisma.reminder.findFirst({
      where: { id: reminderId, user_id: userId },
    });

    if (!reminder) {
      throw new AppError('Reminder not found.', 404, 'REMINDER_NOT_FOUND');
    }

    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    return { success: true };
  }
}
