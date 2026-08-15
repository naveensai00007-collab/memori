import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount } = useOffline();

  if (isOnline && !isSyncing && pendingCount === 0) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="bg-primary text-white px-4 py-2 text-xs flex items-center justify-between border-b border-primary-light transition-all shadow-inner"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 text-accent" />
              <span>
                <strong>Offline Mode.</strong> You are working from local IndexedDB. All additions and edits will automatically sync when connection returns.
              </span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-accent" />
              <span>Syncing pending offline changes with server...</span>
            </>
          ) : (
            <span>{pendingCount} local changes pending sync</span>
          )}
        </div>

        {pendingCount > 0 && (
          <span className="bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full text-[10px]">
            {pendingCount} pending
          </span>
        )}
      </div>
    </aside>
  );
}
