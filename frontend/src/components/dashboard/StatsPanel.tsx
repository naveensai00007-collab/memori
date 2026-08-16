import React from 'react';
import { LifeStats } from '../../../../shared/types';
import { CheckCircle2, AlertCircle, AlertTriangle, Bell, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';

export function StatsPanel({ stats }: { stats?: LifeStats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mb-5">
      {/* Completeness Index */}
      <div className="col-span-2 sm:col-span-1 rounded-card border border-memori-border bg-memori-surface p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-memori-secondary uppercase tracking-wider">
          <span>Readiness</span>
          <span className="font-mono text-primary font-bold">
            {stats.completeness_percentage}%
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold text-primary font-mono tracking-tight">
            {stats.complete_count} <span className="text-xs font-normal text-memori-secondary">/ {stats.total_items} records</span>
          </div>
          <div className="w-full bg-memori-subtle h-1.5 rounded-full mt-2 overflow-hidden border border-memori-border/40">
            <div
              className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
              style={{ width: `${stats.completeness_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Complete Verified */}
      <div className="rounded-card border border-memori-border bg-memori-surface p-3.5 shadow-subtle flex items-center gap-3">
        <div className="w-2 h-8 rounded-full bg-emerald-700/80 shrink-0" />
        <div>
          <div className="text-[11px] font-medium text-memori-secondary">Complete</div>
          <div className="text-lg font-bold text-primary font-mono">{stats.complete_count}</div>
        </div>
      </div>

      {/* Missing Records */}
      <div className="rounded-card border border-memori-border bg-memori-surface p-3.5 shadow-subtle flex items-center gap-3">
        <div className="w-2 h-8 rounded-full bg-rose-700/80 shrink-0" />
        <div>
          <div className="text-[11px] font-medium text-memori-secondary">Missing Gaps</div>
          <div className="text-lg font-bold text-primary font-mono">{stats.missing_count}</div>
        </div>
      </div>

      {/* Attention / Expiries */}
      <div className="rounded-card border border-memori-border bg-memori-surface p-3.5 shadow-subtle flex items-center gap-3">
        <div className="w-2 h-8 rounded-full bg-amber-700/80 shrink-0" />
        <div>
          <div className="text-[11px] font-medium text-memori-secondary">Needs Renewal</div>
          <div className="text-lg font-bold text-primary font-mono">{stats.needs_attention_count}</div>
        </div>
      </div>

      {/* Next Alert Strip */}
      <div className="col-span-2 sm:col-span-1 rounded-card border border-memori-border bg-memori-surface p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-memori-secondary">
          <span className="font-semibold uppercase tracking-wider text-memori-secondary flex items-center gap-1">
            <Bell className="w-3 h-3 text-accent" />
            <span>Next Alert</span>
          </span>
          <Link to="/reminders" className="text-accent hover:text-accent-dark text-[10px] font-semibold flex items-center">
            <span>All</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="mt-1 text-xs text-memori-secondary truncate">
          {stats.upcoming_reminders && stats.upcoming_reminders.length > 0 ? (
            <span className="font-medium text-primary truncate block">
              {stats.upcoming_reminders[0].item?.title} ({formatDate(stats.upcoming_reminders[0].scheduled_date)})
            </span>
          ) : (
            <span className="text-emerald-800 text-[11px] font-medium">All schedules current</span>
          )}
        </div>
      </div>
    </div>
  );
}
