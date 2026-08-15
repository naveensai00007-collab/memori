import React from 'react';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores/uiStore';
import { CATEGORIES } from '../../lib/constants';
import { Layers, Plus, Compass } from 'lucide-react';

export function EmptyState({
  hasFilters = false,
  onResetFilters,
}: {
  hasFilters?: boolean;
  onResetFilters?: () => void;
}) {
  const { selectedCategory, openCreateItemModal } = useUIStore();
  const catMeta = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="flex flex-col items-center justify-center rounded-card border-2 border-dashed border-memori-border bg-memori-surface/50 p-12 text-center my-8">
      <div className="rounded-full bg-accent/20 p-4 text-accent-dark mb-4">
        <Compass className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-primary tracking-tight">
        {hasFilters
          ? 'No matching documents or records found'
          : selectedCategory
          ? `No items in ${catMeta?.label || selectedCategory}`
          : 'Your Life Map is empty'}
      </h3>

      <p className="text-sm text-memori-secondary max-w-md mt-1.5 mb-6">
        {hasFilters
          ? 'Try adjusting your search query or status filters.'
          : selectedCategory
          ? `Catalog your ${catMeta?.label.toLowerCase()} documents, credentials, and records to eliminate unknown unknowns.`
          : 'Add your first document, ID, insurance policy, or property deed to begin externalizing your memory.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasFilters ? (
          <Button variant="secondary" onClick={onResetFilters}>
            Clear Filters
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => openCreateItemModal(selectedCategory || undefined)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add {selectedCategory ? catMeta?.label : 'First Document'}</span>
          </Button>
        )}
      </div>

      {/* Suggested Quick Add Chips */}
      {selectedCategory && catMeta && !hasFilters && (
        <div className="mt-8 pt-6 border-t border-memori-border/60 max-w-lg w-full">
          <div className="text-xs font-semibold text-memori-secondary uppercase tracking-wider mb-3">
            Suggested to add:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {catMeta.suggestedSubcategories.map((sub, idx) => (
              <button
                key={idx}
                onClick={() => openCreateItemModal(selectedCategory)}
                className="rounded-full border border-memori-border bg-memori-surface px-3 py-1 text-xs text-memori-text hover:border-accent hover:text-accent-dark transition-colors"
              >
                + {sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
