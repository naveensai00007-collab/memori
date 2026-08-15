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
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-btn transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-memori-bg disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-light active:bg-primary-dark shadow-sm",
      secondary: "bg-transparent border border-memori-border text-primary hover:bg-black/5 active:bg-black/10",
      accent: "bg-accent text-primary font-semibold hover:bg-accent-dark hover:text-white active:bg-accent-dark shadow-sm",
      ghost: "bg-transparent text-memori-secondary hover:bg-black/5 hover:text-primary",
      destructive: "bg-memori-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-12 px-5 text-sm gap-2",
      lg: "h-14 px-7 text-base gap-2.5",
      icon: "h-10 w-10 p-0 rounded-full",
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
