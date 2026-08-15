import { db } from './db';
import { syncApi } from '../api/sync';
import { SyncOperation, Item } from '../../../shared/types';

export class SyncManager {
  private static isSyncing = false;

  static async queueOperation(entity: 'item' | 'location' | 'reminder', action: 'create' | 'update' | 'delete', data: any, version = 1) {
    const op: SyncOperation = {
      id: crypto.randomUUID(),
      entity,
      action,
      data,
      version,
      timestamp: Date.now(),
    };

    await db.pending_operations.put(op);
    
    // If online, attempt background sync immediately
    if (navigator.onLine) {
      this.sync().catch(console.error);
    }
  }

  static async sync(): Promise<{ success: boolean; pushed: number; pulled: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: false, pushed: 0, pulled: 0 };
    }

    this.isSyncing = true;
    let pushedCount = 0;
    let pulledCount = 0;

    try {
      // 1. Fetch all pending local operations
      const pendingOps = await db.pending_operations.toArray();
      
      if (pendingOps.length > 0) {
        const pushRes = await syncApi.push(pendingOps);
        
        // Remove accepted operations from local queue
        if (pushRes.accepted.length > 0) {
          await db.pending_operations.bulkDelete(pushRes.accepted);
          pushedCount = pushRes.accepted.length;
        }

        // Handle conflicts if any
        if (pushRes.conflicts.length > 0) {
          for (const conflict of pushRes.conflicts) {
            if (conflict.entity === 'item') {
              await db.items.put(conflict.serverData);
            }
            await db.pending_operations.delete(conflict.id);
          }
        }
      }

      // 2. Pull delta changes from server
      const lastSyncKey = 'memori_last_sync_timestamp';
      const lastSync = localStorage.getItem(lastSyncKey) || undefined;
      const pullRes = await syncApi.pull(lastSync);

      if (pullRes.items.length > 0) {
        await db.items.bulkPut(pullRes.items);
        pulledCount += pullRes.items.length;
      }
      if (pullRes.locations.length > 0) {
        await db.locations.bulkPut(pullRes.locations);
      }
      if (pullRes.reminders.length > 0) {
        await db.reminders.bulkPut(pullRes.reminders);
      }

      localStorage.setItem(lastSyncKey, pullRes.timestamp);
      return { success: true, pushed: pushedCount, pulled: pulledCount };
    } catch (err) {
      console.warn('Sync failed, will retry on next cycle or connection restore', err);
      return { success: false, pushed: pushedCount, pulled: pulledCount };
    } finally {
      this.isSyncing = false;
    }
  }
}
