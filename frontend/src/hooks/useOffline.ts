import { useEffect } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { SyncManager } from '../lib/sync';
import { db } from '../lib/db';

export function useOffline() {
  const { isOnline, isSyncing, lastSyncedAt, pendingCount, setIsOnline, setIsSyncing, setLastSyncedAt, setPendingCount } = useSyncStore();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      const res = await SyncManager.sync();
      setIsSyncing(false);
      if (res.success) {
        setLastSyncedAt(new Date());
      }
      const count = await db.pending_operations.count();
      setPendingCount(count);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of pending queue count
    db.pending_operations.count().then(setPendingCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncedAt,
    pendingCount,
  };
}
