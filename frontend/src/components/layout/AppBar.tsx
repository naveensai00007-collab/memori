import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useSyncStore } from '../../stores/syncStore';
import { useReminders } from '../../hooks/useReminders';
import { Search, Plus, Bell, Sparkles, LogOut, Settings as SettingsIcon, Menu, WifiOff, RefreshCw, Command } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function AppBar() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery, openCreateItemModal, setLifeReviewOpen, toggleSidebar } = useUIStore();
  const { isOnline, isSyncing } = useSyncStore();
  const { data: reminders } = useReminders(true);
  const unacknowledgedCount = reminders?.length || 0;

  // Global keyboard shortcut to focus search with '/' or 'Cmd+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.metaKey || e.ctrlKey) && e.key === 'k') && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openCreateItemModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreateItemModal]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-memori-border bg-memori-surface/95 px-4 md:px-6 backdrop-blur-md transition-all">
      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={toggleSidebar}
          className="rounded-btn p-1.5 text-memori-secondary hover:bg-memori-subtle hover:text-primary md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <img src="/logo.svg" alt="MEMORI Logo" className="w-7 h-7 transition-transform group-hover:scale-105" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-primary font-mono">MEMORI</span>
            <span className="text-[10px] text-memori-tertiary font-mono hidden lg:inline">v1.0.0</span>
          </div>
        </Link>
      </div>

      {/* Center Global Search / Command Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-memori-tertiary" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Life Map (press '/' to focus)..."
            className="w-full h-8 rounded-input border border-memori-border bg-memori-bg pl-8 pr-12 text-xs text-memori-text placeholder:text-memori-tertiary focus:bg-memori-surface focus:border-memori-borderHover focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="rounded border border-memori-border bg-memori-surface px-1.5 py-0.5 text-[9px] font-mono text-memori-tertiary">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2">
        {/* Offline Pill */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 rounded-badge bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline Mode</span>
          </div>
        )}

        {isSyncing && (
          <div className="flex items-center gap-1 rounded-badge bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-800">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Syncing</span>
          </div>
        )}

        {/* Life Review Trigger */}
        <button
          onClick={() => setLifeReviewOpen(true)}
          className="flex items-center gap-1.5 rounded-btn border border-memori-border bg-memori-surface hover:bg-memori-subtle px-2.5 py-1.5 text-xs font-medium text-memori-text transition-colors"
          title="Open Life Review"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">Life Review</span>
        </button>

        {/* Reminders Trigger */}
        <Link
          to="/reminders"
          className="relative rounded-btn p-1.5 text-memori-secondary hover:bg-memori-subtle hover:text-primary transition-colors"
          title="Smart Reminders"
        >
          <Bell className="w-4 h-4" />
          {unacknowledgedCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-status-attention text-[9px] font-bold text-white">
              {unacknowledgedCount}
            </span>
          )}
        </Link>

        {/* Add Item Primary Trigger */}
        <Button
          onClick={() => openCreateItemModal()}
          size="sm"
          variant="primary"
          className="gap-1 h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Record</span>
        </Button>

        {/* Settings & Logout */}
        <div className="flex items-center gap-0.5 border-l border-memori-border pl-2 ml-1">
          <Link
            to="/settings"
            className="rounded-btn p-1.5 text-memori-secondary hover:bg-memori-subtle hover:text-primary transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="rounded-btn p-1.5 text-memori-secondary hover:bg-red-50 hover:text-memori-error transition-colors"
            title="Lock Vault & Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
