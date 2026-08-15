import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-memori-secondary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-input border border-memori-border bg-memori-surface px-4 py-2 text-sm text-memori-text placeholder:text-memori-tertiary transition-colors duration-150",
            "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
            "disabled:cursor-not-allowed disabled:bg-memori-bg disabled:opacity-50",
            error && "border-memori-error focus:border-memori-error focus:ring-memori-error/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-memori-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
