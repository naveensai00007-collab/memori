import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { STATUSES, CATEGORIES } from '../../lib/constants';
import { Status } from '../../../../shared/types';
import { cn } from '../../lib/utils';
import { Filter, X } from 'lucide-react';

export function FilterBar({ totalResults }: { totalResults?: number }) {
  const { selectedCategory, selectedStatus, setSelectedStatus, searchQuery, setSearchQuery } = useUIStore();
  const catMeta = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2">
      {/* Category heading & description */}
      <div>
        <h2 className="text-xl font-bold text-primary tracking-tight">
          {catMeta ? catMeta.label : 'All Life Map Items'}
        </h2>
        <p className="text-xs text-memori-secondary mt-0.5">
          {catMeta ? catMeta.description : 'Master inventory of all your personal documents, assets, and credentials.'}
        </p>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSelectedStatus(null)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
            selectedStatus === null
              ? 'bg-primary text-white border-primary'
              : 'bg-memori-surface text-memori-secondary border-memori-border hover:border-primary/40'
          )}
        >
          All {totalResults !== undefined && `(${totalResults})`}
        </button>

        {STATUSES.map((status) => {
          const isSelected = selectedStatus === status.id;
          return (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(isSelected ? null : status.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-memori-surface text-memori-secondary border-memori-border hover:border-primary/40'
              )}
            >
              {status.label}
            </button>
          );
        })}

        {/* Clear search chip if search is active */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1 rounded-full bg-accent/20 text-accent-dark px-2.5 py-1 text-xs font-medium hover:bg-accent/30"
          >
            <span>"{searchQuery}"</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
