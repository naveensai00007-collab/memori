import React from 'react';
import { cn } from '../../lib/utils';
import { Status } from '../../../../shared/types';

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'accent' }) {
  const variants = {
    default: 'bg-primary text-white',
    secondary: 'bg-memori-subtle text-memori-secondary border border-memori-border',
    outline: 'border border-memori-border text-memori-text',
    accent: 'bg-accent/15 text-accent-dark border border-accent/30 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: Status;
  className?: string;
  showDot?: boolean;
}) {
  const configs = {
    complete: {
      label: 'Complete',
      bg: 'bg-emerald-950/5 text-emerald-900 border-emerald-800/20',
      dot: 'bg-emerald-700',
    },
    missing: {
      label: 'Missing',
      bg: 'bg-rose-950/5 text-rose-900 border-rose-800/20',
      dot: 'bg-rose-700',
    },
    needs_attention: {
      label: 'Needs Attention',
      bg: 'bg-amber-950/5 text-amber-900 border-amber-800/25',
      dot: 'bg-amber-700',
    },
    not_applicable: {
      label: 'N/A',
      bg: 'bg-stone-900/5 text-stone-700 border-stone-800/15',
      dot: 'bg-stone-500',
    },
  };

  const config = configs[status] || configs.missing;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-badge border px-2 py-0.5 text-[11px] font-semibold tracking-tight select-none',
        config.bg,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
      <span>{config.label}</span>
    </span>
  );
}
