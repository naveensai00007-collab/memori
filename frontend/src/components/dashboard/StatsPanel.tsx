import React from 'react';
import { LifeStats } from '../../../../shared/types';
import { CheckCircle2, AlertCircle, AlertTriangle, Layers, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';

export function StatsPanel({ stats }: { stats?: LifeStats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {/* Completeness Card */}
      <div className="col-span-2 sm:col-span-1 rounded-card border border-memori-border bg-memori-surface p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-memori-secondary uppercase tracking-wider">Completeness</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {stats.completeness_percentage}%
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-primary font-mono">
            {stats.complete_count} <span className="text-xs font-normal text-memori-secondary">/ {stats.total_items} items</span>
          </div>
          <div className="w-full bg-memori-border/50 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-status-complete h-full transition-all duration-500 rounded-full"
              style={{ width: `${stats.completeness_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Complete Count */}
      <div className="rounded-card border border-memori-border bg-memori-surface p-4 shadow-card flex items-center gap-3">
        <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-memori-secondary">Complete</div>
          <div className="text-xl font-bold text-primary font-mono">{stats.complete_count}</div>
        </div>
      </div>

      {/* Missing Count */}
      <div className="rounded-card border border-memori-border bg-memori-surface p-4 shadow-card flex items-center gap-3">
        <div className="rounded-full bg-rose-50 p-2.5 text-rose-700 border border-rose-200">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-memori-secondary">Missing</div>
          <div className="text-xl font-bold text-primary font-mono">{stats.missing_count}</div>
        </div>
      </div>

      {/* Needs Attention */}
      <div className="rounded-card border border-memori-border bg-memori-surface p-4 shadow-card flex items-center gap-3">
        <div className="rounded-full bg-amber-50 p-2.5 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-medium text-memori-secondary">Needs Attention</div>
          <div className="text-xl font-bold text-primary font-mono">{stats.needs_attention_count}</div>
        </div>
      </div>

      {/* Upcoming Reminders Preview */}
      <div className="col-span-2 sm:col-span-1 rounded-card border border-memori-border bg-memori-surface p-4 shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-memori-secondary">
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <Bell className="w-4 h-4 text-accent-dark" />
            <span>Reminders</span>
          </div>
          <Link to="/reminders" className="text-accent-dark font-medium hover:underline text-[11px]">
            View all
          </Link>
        </div>
        <div className="mt-2 text-xs text-memori-secondary">
          {stats.upcoming_reminders && stats.upcoming_reminders.length > 0 ? (
            <div className="truncate font-medium text-primary">
              Next: {stats.upcoming_reminders[0].item?.title || 'Reminder'} ({formatDate(stats.upcoming_reminders[0].scheduled_date)})
            </div>
          ) : (
            <div className="text-emerald-700">All caught up! 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
}
