import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useLifeStats } from '../../hooks/useItems';
import { useAuthStore } from '../../stores/authStore';
import { CATEGORIES } from '../../lib/constants';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

export function LifeReviewModal() {
  const { isLifeReviewOpen, setLifeReviewOpen, openCreateItemModal } = useUIStore();
  const { user, updateSettings } = useAuthStore();
  const { data: stats } = useLifeStats();

  const handleMarkReviewDone = async () => {
    await updateSettings({
      last_review_prompt: new Date().toISOString(),
    });
    setLifeReviewOpen(false);
  };

  return (
    <Modal
      open={isLifeReviewOpen}
      onOpenChange={setLifeReviewOpen}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pt-1">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-memori-border pb-4">
          <div className="rounded-full bg-accent/20 p-3 text-accent-dark">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight">
              Periodic Life Review
            </h2>
            <p className="text-xs text-memori-secondary">
              Review your life completeness, eliminate unknown unknowns, and update missing records.
            </p>
          </div>
        </div>

        {/* Completeness Summary Banner */}
        <div className="rounded-card border border-memori-border bg-memori-bg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-memori-secondary block">
              Overall Life Map Health
            </span>
            <div className="text-2xl font-bold text-primary font-mono mt-0.5">
              {stats?.completeness_percentage || 0}% Complete
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>{stats?.complete_count || 0} Complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-800">
              <AlertCircle className="w-4 h-4" />
              <span>{stats?.missing_count || 0} Missing</span>
            </div>
          </div>
        </div>

        {/* Category Completeness Progress Bars */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-memori-secondary">
            Category Breakdown & Completeness
          </h4>

          <div className="space-y-2.5">
            {CATEGORIES.map((cat) => {
              const catStat = stats?.category_breakdown?.[cat.id] || { total: 0, complete: 0, missing: 0 };
              const percent = catStat.total > 0 ? Math.round((catStat.complete / catStat.total) * 100) : 0;

              return (
                <div key={cat.id} className="rounded-btn border border-memori-border bg-memori-surface p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{cat.label}</span>
                      <span className="text-memori-tertiary font-mono">({catStat.complete}/{catStat.total} items)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary font-mono">{percent}%</span>
                      <button
                        onClick={() => {
                          setLifeReviewOpen(false);
                          openCreateItemModal(cat.id);
                        }}
                        className="rounded-full bg-memori-bg p-1 text-memori-secondary hover:text-accent-dark hover:bg-accent/15 transition-colors"
                        title={`Add item to ${cat.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-memori-border/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-status-complete h-full transition-all duration-300 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guided prompt */}
        <div className="rounded-card border border-accent/40 bg-accent/10 p-4 text-xs text-primary leading-relaxed">
          <strong>Reflection Prompt:</strong> Have you renewed any insurance, opened a bank account, purchased property/appliances, or obtained identity proofs in the last month?
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-memori-border/60">
          <Button
            variant="primary"
            onClick={handleMarkReviewDone}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I'm All Caught Up</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
