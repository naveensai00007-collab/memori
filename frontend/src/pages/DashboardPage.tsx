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
import { Skeleton } from '../components/ui/Skeleton';

export function DashboardPage() {
  const { selectedCategory, searchQuery, selectedStatus } = useUIStore();
  const { data: itemsData, isLoading } = useItems({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    status: selectedStatus || undefined,
  });
  const { data: stats } = useLifeStats();

  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const items = itemsData?.items || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Aggregated Completeness & Urgency Index */}
      <StatsPanel stats={stats} />

      {/* Filter and Density Toolbar */}
      <FilterBar />

      {/* Item Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-card border border-memori-border bg-memori-surface p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: Item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setActiveItem(item)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ItemDetailModal
        item={activeItem}
        isOpen={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
      />
      <ItemForm />
      <LifeReviewModal />
    </div>
  );
}
