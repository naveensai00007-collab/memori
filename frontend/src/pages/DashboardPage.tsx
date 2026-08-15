import React, { useState } from 'react';
import { useItems, useLifeStats } from '../hooks/useItems';
import { useUIStore } from '../stores/uiStore';
import { Item } from '../../../shared/types';
import { StatsPanel } from '../components/dashboard/StatsPanel';
import { FilterBar } from '../components/dashboard/FilterBar';
import { ItemCard } from '../components/dashboard/ItemCard';
import { EmptyState } from '../components/dashboard/EmptyState';
import { ItemDetailModal } from '../components/items/ItemDetail';
import { ItemForm } from '../components/items/ItemForm';
import { LifeReviewModal } from '../components/modals/LifeReviewModal';
import { LocationForm } from '../components/locations/LocationForm';
import { Skeleton } from '../components/ui/Skeleton';

export function DashboardPage() {
  const { selectedCategory, selectedStatus, searchQuery, setSelectedStatus, setSearchQuery } = useUIStore();
  
  const { data: itemsData, isLoading, isError, refetch } = useItems({
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
    search: searchQuery || undefined,
  });

  const { data: statsData } = useLifeStats();

  const [inspectingItem, setInspectingItem] = useState<Item | null>(null);

  const items = itemsData?.items || [];
  const hasActiveFilters = !!(selectedStatus || searchQuery);

  return (
    <div className="space-y-6">
      {/* Top Life Map Completeness & Stats */}
      <StatsPanel stats={statsData} />

      {/* Filter & Category Header */}
      <FilterBar totalResults={itemsData?.total} />

      {/* Main Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-card border border-memori-border bg-memori-surface p-5 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="pt-3 border-t border-memori-border/50 flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <p className="text-sm text-memori-error font-medium">Failed to load Life Map items.</p>
          <button
            onClick={() => refetch()}
            className="rounded-btn bg-primary text-white px-4 py-2 text-xs font-semibold hover:bg-primary-light"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={() => {
            setSelectedStatus(null);
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setInspectingItem(item)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ItemDetailModal
        item={inspectingItem}
        open={!!inspectingItem}
        onClose={() => setInspectingItem(null)}
      />
      <ItemForm />
      <LifeReviewModal />
      <LocationForm />
    </div>
  );
}
