import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useLifeStats } from '../../hooks/useItems';
import { CATEGORIES } from '../../lib/constants';
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
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-memori-border bg-memori-surface pt-14 transition-all duration-150 md:static md:z-0 select-none',
        isSidebarCollapsed ? 'w-16' : 'w-60',
        !isSidebarCollapsed && 'shadow-lg md:shadow-none'
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Categories / Domains */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-2">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
                Life Domains
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex rounded-btn p-1 text-memori-tertiary hover:bg-memori-subtle hover:text-primary transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          <nav className="space-y-0.5">
            {/* All Items Option */}
            <Link
              to="/dashboard"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'flex items-center justify-between rounded-btn px-2.5 py-2 text-xs font-medium transition-all duration-100',
                isDashboard && selectedCategory === null
                  ? 'bg-primary text-white font-semibold'
                  : 'text-memori-secondary hover:bg-memori-subtle hover:text-primary'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                {!isSidebarCollapsed && <span>All Life Map</span>}
              </div>
              {!isSidebarCollapsed && stats && (
                <span className={cn(
                  'rounded px-1.5 py-0.2 text-[10px] font-mono',
                  selectedCategory === null && isDashboard ? 'bg-white/15 text-white' : 'text-memori-tertiary'
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
                    'flex items-center justify-between rounded-btn px-2.5 py-2 text-xs font-medium transition-all duration-100',
                    isSelected
                      ? 'bg-primary text-white font-semibold'
                      : 'text-memori-secondary hover:bg-memori-subtle hover:text-primary'
                  )}
                  title={cat.label}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{cat.label}</span>}
                  </div>
                  {!isSidebarCollapsed && count > 0 && (
                    <span className={cn(
                      'rounded px-1.5 py-0.2 text-[10px] font-mono',
                      isSelected ? 'bg-white/15 text-white' : 'text-memori-tertiary'
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Vault Index & Systems */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-memori-tertiary">
              Vault System
            </div>
          )}
          <nav className="space-y-0.5">
            <Link
              to="/locations"
              className={cn(
                'flex items-center gap-2.5 rounded-btn px-2.5 py-2 text-xs font-medium transition-all duration-100',
                location.pathname === '/locations'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-memori-secondary hover:bg-memori-subtle hover:text-primary'
              )}
              title="Vault Index"
            >
              <Vault className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Vault Index</span>}
            </Link>

            <Link
              to="/reminders"
              className={cn(
                'flex items-center gap-2.5 rounded-btn px-2.5 py-2 text-xs font-medium transition-all duration-100',
                location.pathname === '/reminders'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-memori-secondary hover:bg-memori-subtle hover:text-primary'
              )}
              title="Smart Reminders"
            >
              <Bell className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Smart Reminders</span>}
            </Link>

            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-2.5 rounded-btn px-2.5 py-2 text-xs font-medium transition-all duration-100',
                location.pathname === '/settings'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-memori-secondary hover:bg-memori-subtle hover:text-primary'
              )}
              title="Settings & Export"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
