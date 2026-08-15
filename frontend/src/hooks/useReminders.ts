import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '../api/reminders';
import { Reminder } from '../../../shared/types';
import { db } from '../lib/db';

export function useReminders(upcoming = false) {
  return useQuery({
    queryKey: ['reminders', { upcoming }],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          const reminders = await remindersApi.list(upcoming);
          await db.reminders.bulkPut(reminders);
          return reminders;
        } catch (err) {
          console.warn('API error fetching reminders, falling back to IndexedDB', err);
        }
      }
      const all = await db.reminders.toArray();
      if (upcoming) {
        const today = new Date().toISOString().split('T')[0];
        return all.filter(r => !r.acknowledged && r.scheduled_date >= today);
      }
      return all;
    },
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { item_id: string; type: string; scheduled_date: string }) => {
      return await remindersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}

export function useAcknowledgeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await remindersApi.acknowledge(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, days }: { id: string; days?: number }) => {
      return await remindersApi.snooze(id, days);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await remindersApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}
