import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../api/locations';
import { Location } from '../../../shared/types';
import { db } from '../lib/db';
import { SyncManager } from '../lib/sync';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      if (navigator.onLine) {
        try {
          const locs = await locationsApi.list();
          await db.locations.bulkPut(locs);
          return locs;
        } catch (err) {
          console.warn('API error fetching locations, falling back to IndexedDB', err);
        }
      }
      return await db.locations.toArray();
    },
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Location>) => {
      if (navigator.onLine) {
        return await locationsApi.create(data);
      } else {
        const localLoc: Location = {
          id: crypto.randomUUID(),
          user_id: 'local',
          name: data.name!,
          type: data.type!,
          description: data.description || null,
          address: data.address || null,
          uri_template: data.uri_template || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _pending: true,
        };
        await db.locations.put(localLoc);
        await SyncManager.queueOperation('location', 'create', localLoc);
        return localLoc;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (navigator.onLine) {
        await locationsApi.delete(id);
      } else {
        await db.locations.delete(id);
        await SyncManager.queueOperation('location', 'delete', { id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
