import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useLifeStats } from '../../hooks/useItems';
import { CATEGORIES } from '../../lib/constants';
import { Category } from '../../../../shared/types';
import { 
  Layers, 
  ShieldCheck, 
  GraduationCap, 
  Coins, 
  Laptop, 
  Key, 
  Landmark, 
  FolderArchive,
  Vault,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  GraduationCap,
  Coins,
  Laptop,
  Key,
  Landmark,
  FolderArchive,
};

export function Sidebar() {
  const location = useLocation();
  const { selectedCategory, setSelectedCategory, isSidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: stats } = useLifeStats();

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-memori-border bg-memori-surface pt-16 transition-all duration-200 md:static md:z-0',
        isSidebarCollapsed ? 'w-18' : 'w-64',
        !isSidebarCollapsed && 'shadow-lg md:shadow-none'
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Categories */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-memori-tertiary">
                Life Domains
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex rounded p-1 text-memori-tertiary hover:bg-memori-bg hover:text-primary transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="space-y-1">
            {/* All Items Option */}
            <Link
              to="/dashboard"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'flex items-center justify-between rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
                isDashboard && selectedCategory === null
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-memori-secondary hover:bg-memori-bg hover:text-primary'
              )}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>All Life Map</span>}
              </div>
              {!isSidebarCollapsed && stats && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  selectedCategory === null && isDashboard ? 'bg-white/20 text-white' : 'bg-memori-bg text-memori-secondary'
                )}>
                  {stats.total_items}
                </span>
              )}
            </Link>

            {/* Category items */}
            {CATEGORIES.map((cat) => {
              const IconComponent = iconMap[cat.iconName] || Layers;
              const isSelected = isDashboard && selectedCategory === cat.id;
              const count = stats?.category_breakdown?.[cat.id]?.total || 0;

              return (
                <Link
                  key={cat.id}
                  to="/dashboard"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center justify-between rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-memori-secondary hover:bg-memori-bg hover:text-primary'
                  )}
                  title={cat.label}
                >
                  <div className="flex items-center gap-3 truncate">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{cat.label}</span>}
                  </div>
                  {!isSidebarCollapsed && count > 0 && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      isSelected ? 'bg-white/20 text-white' : 'bg-memori-bg text-memori-secondary'
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Vault & Organization System */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-memori-tertiary">
              Vault & Index
            </div>
          )}
          <nav className="space-y-1">
            <Link
              to="/locations"
              className={cn(
                'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname === '/locations'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-memori-secondary hover:bg-memori-bg hover:text-primary'
              )}
              title="Vault Index (Locations)"
            >
              <Vault className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Vault Index</span>}
            </Link>

            <Link
              to="/reminders"
              className={cn(
                'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname === '/reminders'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-memori-secondary hover:bg-memori-bg hover:text-primary'
              )}
              title="Smart Reminders"
            >
              <Bell className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Smart Reminders</span>}
            </Link>

            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname === '/settings'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-memori-secondary hover:bg-memori-bg hover:text-primary'
              )}
              title="Settings & Export"
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
