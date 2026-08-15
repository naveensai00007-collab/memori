import React from 'react';
import { cn } from '../../lib/utils';
import { Status } from '../../../../shared/types';
import { CheckCircle2, AlertCircle, AlertTriangle, MinusCircle } from 'lucide-react';

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'accent' }) {
  const variants = {
    default: 'bg-primary text-white',
    secondary: 'bg-memori-bg text-memori-secondary border border-memori-border',
    outline: 'border border-memori-border text-memori-text',
    accent: 'bg-accent/20 text-accent-dark border border-accent/40 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
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
  showIcon = true,
}: {
  status: Status;
  className?: string;
  showIcon?: boolean;
}) {
  const configs = {
    complete: {
      label: 'Complete',
      bg: 'bg-status-complete/15 text-emerald-800 border-status-complete/30',
      icon: CheckCircle2,
    },
    missing: {
      label: 'Missing',
      bg: 'bg-status-missing/20 text-rose-800 border-status-missing/40',
      icon: AlertCircle,
    },
    needs_attention: {
      label: 'Needs Attention',
      bg: 'bg-status-attention/20 text-amber-800 border-status-attention/40',
      icon: AlertTriangle,
    },
    not_applicable: {
      label: 'N/A',
      bg: 'bg-status-na/20 text-gray-700 border-status-na/40',
      icon: MinusCircle,
    },
  };

  const config = configs[status] || configs.missing;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-badge border px-2.5 py-0.5 text-xs font-semibold select-none',
        config.bg,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
