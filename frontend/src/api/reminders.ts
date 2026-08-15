import { apiClient } from './client';
import { Reminder } from '../../../shared/types';

export const remindersApi = {
  async list(upcoming = false): Promise<Reminder[]> {
    const res = await apiClient.get<{ reminders: Reminder[] }>('/reminders', {
      params: { upcoming },
    });
    return res.data.reminders;
  },

  async create(data: { item_id: string; type: string; scheduled_date: string }): Promise<Reminder> {
    const res = await apiClient.post<{ reminder: Reminder }>('/reminders', data);
    return res.data.reminder;
  },

  async acknowledge(id: string): Promise<Reminder> {
    const res = await apiClient.put<{ reminder: Reminder }>(`/reminders/${id}/acknowledge`);
    return res.data.reminder;
  },

  async snooze(id: string, days = 7): Promise<Reminder> {
    const res = await apiClient.put<{ reminder: Reminder }>(`/reminders/${id}/snooze`, { days });
    return res.data.reminder;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/reminders/${id}`);
  },
};
