import React, { useState } from 'react';
import { useReminders, useAcknowledgeReminder, useSnoozeReminder, useDeleteReminder } from '../hooks/useReminders';
import { Reminder } from '../../../shared/types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';
import { Bell, Check, Clock, Trash2, Calendar, Sparkles } from 'lucide-react';

export function RemindersPage() {
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming');
  const { data: reminders, isLoading } = useReminders(filter === 'upcoming');
  const ackMutation = useAcknowledgeReminder();
  const snoozeMutation = useSnoozeReminder();
  const deleteMutation = useDeleteReminder();

  const handleAcknowledge = async (id: string) => {
    await ackMutation.mutateAsync(id);
  };

  const handleSnooze = async (id: string) => {
    await snoozeMutation.mutateAsync({ id, days: 7 });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-memori-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Smart Reminders
          </h1>
          <p className="text-xs text-memori-secondary mt-1">
            Automated alerts for passport expiries, policy renewals, and guided life reviews.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex rounded-btn bg-memori-surface p-1 border border-memori-border">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${
              filter === 'upcoming'
                ? 'bg-primary text-white shadow-xs'
                : 'text-memori-secondary hover:text-primary'
            }`}
          >
            Upcoming Alerts
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-memori-secondary hover:text-primary'
            }`}
          >
            All Reminders
          </button>
        </div>
      </div>

      {/* Reminder Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-card border border-memori-border bg-memori-surface p-4 flex justify-between items-center">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : !reminders || reminders.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-memori-border bg-memori-surface/50 p-12 text-center my-8">
          <div className="rounded-full bg-emerald-50 p-4 text-emerald-700 mx-auto w-fit mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-primary">All Caught Up! 🎉</h3>
          <p className="text-xs text-memori-secondary max-w-sm mx-auto mt-1">
            You have no pending alerts or expired responsibilities. MEMORI is keeping track in the background.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder: any) => {
            const isAcknowledged = reminder.acknowledged;
            return (
              <Card
                key={reminder.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 ${
                  isAcknowledged ? 'opacity-60 bg-memori-bg/50' : 'bg-memori-surface'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="rounded-full bg-amber-50 p-2.5 text-amber-700 border border-amber-200 shrink-0 mt-1 sm:mt-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      {reminder.item?.title || 'Life Item Reminder'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-memori-secondary mt-0.5">
                      <span className="capitalize bg-memori-bg px-2 py-0.5 rounded border border-memori-border/50 text-[11px]">
                        {reminder.type} Alert
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-accent-dark" />
                        <span>Due: {formatDate(reminder.scheduled_date)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!isAcknowledged && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSnooze(reminder.id)}
                        isLoading={snoozeMutation.isPending}
                        className="gap-1 text-xs h-8"
                        title="Snooze 7 Days"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Snooze +7d</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcknowledge(reminder.id)}
                        isLoading={ackMutation.isPending}
                        className="gap-1 text-xs h-8"
                      >
                        <Check className="w-3 h-3" />
                        <span>Acknowledge</span>
                      </Button>
                    </>
                  )}

                  {isAcknowledged && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Acknowledged
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-1.5 text-memori-tertiary hover:text-memori-error rounded transition-colors ml-1"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
