import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useSyncStore } from '../../stores/syncStore';
import { useReminders } from '../../hooks/useReminders';
import { Search, Plus, Bell, Sparkles, User as UserIcon, LogOut, Settings as SettingsIcon, Menu, WifiOff, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function AppBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery, openCreateItemModal, setLifeReviewOpen, toggleSidebar } = useUIStore();
  const { isOnline, isSyncing } = useSyncStore();
  const { data: reminders } = useReminders(true);
  const unacknowledgedCount = reminders?.length || 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-memori-border bg-memori-surface/95 px-4 md:px-8 backdrop-blur-xs">
      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-memori-secondary hover:bg-memori-bg hover:text-primary md:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="MEMORI Logo" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-primary font-mono hidden sm:inline">MEMORI</span>
        </Link>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-memori-tertiary" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, tags, locations, or notes..."
            className="w-full h-10 rounded-input border border-memori-border bg-memori-bg pl-10 pr-4 text-sm text-memori-text placeholder:text-memori-tertiary focus:bg-memori-surface focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Status */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}

        {isSyncing && (
          <div className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-700">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Syncing</span>
          </div>
        )}

        {/* Life Review Guided Trigger */}
        <button
          onClick={() => setLifeReviewOpen(true)}
          className="flex items-center gap-1.5 rounded-btn border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-semibold text-primary hover:bg-accent/25 transition-colors"
          title="Start Life Review"
        >
          <Sparkles className="w-4 h-4 text-accent-dark" />
          <span className="hidden sm:inline">Life Review</span>
        </button>

        {/* Reminders Bell */}
        <Link
          to="/reminders"
          className="relative rounded-btn p-2 text-memori-secondary hover:bg-memori-bg hover:text-primary transition-colors"
          title="Reminders"
        >
          <Bell className="w-5 h-5" />
          {unacknowledgedCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-attention text-[10px] font-bold text-white">
              {unacknowledgedCount}
            </span>
          )}
        </Link>

        {/* Add Item Quick Button */}
        <Button
          onClick={() => openCreateItemModal()}
          size="sm"
          variant="primary"
          className="gap-1.5 h-9"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>

        {/* Profile / Menu */}
        <div className="flex items-center gap-1 border-l border-memori-border pl-2 ml-1">
          <Link
            to="/settings"
            className="rounded-full p-2 text-memori-secondary hover:bg-memori-bg hover:text-primary transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="rounded-full p-2 text-memori-secondary hover:bg-red-50 hover:text-memori-error transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
