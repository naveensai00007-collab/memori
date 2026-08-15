import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { Item, ItemFilterParams } from '../../../shared/types';
import { SyncManager } from '../lib/sync';
import { db } from '../lib/db';

export function useItems(params: ItemFilterParams) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          const res = await itemsApi.list(params);
          // Update local IndexedDB cache
          await db.items.bulkPut(res.items);
          return res;
        } catch (err) {
          console.warn('API error, falling back to local IndexedDB', err);
        }
      }
      
      // Offline fallback: Query Dexie IndexedDB
      let collection = db.items.toCollection();
      if (params.category) {
        collection = db.items.where('category').equals(params.category);
      }
      let items = await collection.toArray();
      if (params.status) {
        items = items.filter(i => i.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(i => 
          i.title.toLowerCase().includes(q) || 
          (i.description && i.description.toLowerCase().includes(q))
        );
      }
      return {
        items,
        total: items.length,
        limit: params.limit || 50,
        offset: params.offset || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          const item = await itemsApi.getById(id);
          await db.items.put(item);
          return item;
        } catch (err) {
          console.warn('API error fetching item, falling back to IndexedDB', err);
        }
      }
      const local = await db.items.get(id);
      if (!local) throw new Error('Item not found locally');
      return local;
    },
    enabled: !!id,
  });
}

export function useLifeStats() {
  return useQuery({
    queryKey: ['life-stats'],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          return await itemsApi.getStats();
        } catch (err) {
          console.warn('Failed to fetch stats online', err);
        }
      }
      // Calculate local stats
      const items = await db.items.toArray();
      const total_items = items.length;
      let complete_count = 0;
      let missing_count = 0;
      let needs_attention_count = 0;
      let not_applicable_count = 0;

      const breakdown: any = {
        identity: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
        education: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
        money: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
        digital: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
        assets: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
        government: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
        other: { total: 0, complete: 0, missing: 0, needs_attention: 0 },
      };

      items.forEach(i => {
        if (breakdown[i.category]) {
          breakdown[i.category].total += 1;
          if (i.status === 'complete') {
            complete_count += 1;
            breakdown[i.category].complete += 1;
          } else if (i.status === 'missing') {
            missing_count += 1;
            breakdown[i.category].missing += 1;
          } else if (i.status === 'needs_attention') {
            needs_attention_count += 1;
            breakdown[i.category].needs_attention += 1;
          } else if (i.status === 'not_applicable') {
            not_applicable_count += 1;
          }
        }
      });

      const activeTotal = total_items - not_applicable_count;
      return {
        total_items,
        complete_count,
        missing_count,
        needs_attention_count,
        not_applicable_count,
        completeness_percentage: activeTotal > 0 ? Math.round((complete_count / activeTotal) * 100) : 0,
        category_breakdown: breakdown,
        upcoming_reminders: [],
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<Item>) => {
      if (navigator.onLine) {
        return await itemsApi.create(newItem);
      } else {
        const localItem: Item = {
          id: crypto.randomUUID(),
          user_id: 'local',
          title: newItem.title!,
          category: newItem.category!,
          subcategory: newItem.subcategory || null,
          status: newItem.status || 'missing',
          description: newItem.description || null,
          notes: newItem.notes || null,
          tags: newItem.tags || [],
          physical_location: newItem.physical_location || null,
          digital_copy_uri: newItem.digital_copy_uri || null,
          location_id: newItem.location_id || null,
          expiry_date: newItem.expiry_date || null,
          reminder_date: newItem.reminder_date || null,
          sensitive_data: newItem.sensitive_data || null,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _pending: true,
        };
        await db.items.put(localItem);
        await SyncManager.queueOperation('item', 'create', localItem, 1);
        return localItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Item> }) => {
      if (navigator.onLine) {
        return await itemsApi.update(id, data);
      } else {
        const existing = await db.items.get(id);
        const updated: Item = {
          ...existing!,
          ...data,
          version: (existing?.version || 1) + 1,
          updated_at: new Date().toISOString(),
          _pending: true,
        };
        await db.items.put(updated);
        await SyncManager.queueOperation('item', 'update', updated, updated.version);
        return updated;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (navigator.onLine) {
        await itemsApi.delete(id);
      } else {
        await db.items.delete(id);
        await SyncManager.queueOperation('item', 'delete', { id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['life-stats'] });
    },
  });
}

export function useMarkReviewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await itemsApi.markReviewed(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
    },
  });
}
