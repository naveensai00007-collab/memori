import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-btn transition-all duration-120 active:scale-[0.99] focus:outline-none focus:ring-1.5 focus:ring-accent focus:ring-offset-1 focus:ring-offset-memori-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-light active:bg-primary-dark shadow-subtle",
      secondary: "bg-memori-surface border border-memori-border text-memori-text hover:bg-memori-subtle hover:border-memori-borderHover active:bg-memori-border/60 shadow-subtle",
      accent: "bg-accent text-white font-semibold hover:bg-accent-dark active:bg-accent-dark shadow-subtle",
      ghost: "bg-transparent text-memori-secondary hover:bg-memori-subtle hover:text-memori-text",
      destructive: "bg-memori-error text-white hover:bg-red-800 active:bg-red-900 shadow-subtle",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-xs tracking-tight gap-2",
      lg: "h-12 px-6 text-sm gap-2.5",
      icon: "h-9 w-9 p-0 rounded-btn",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
