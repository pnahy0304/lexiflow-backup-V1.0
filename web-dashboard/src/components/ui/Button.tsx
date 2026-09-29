import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm hover:shadow-indigo-glow border border-transparent',
      gradient:
        'bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-md hover:shadow-indigo-glow border border-transparent',
      secondary:
        'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] dark:bg-[#1E293B] dark:hover:bg-[#334155] dark:text-[#F8FAFC] border border-transparent',
      outline:
        'border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155] dark:border-[#334155] dark:bg-[#0F172A] dark:hover:bg-[#1E293B] dark:text-[#E2E8F0]',
      ghost:
        'bg-transparent hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] dark:hover:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]',
      danger:
        'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-sm border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 h-8',
      md: 'px-4 py-2 text-sm rounded-xl gap-2 h-10',
      lg: 'px-6 py-3 text-base rounded-2xl gap-2.5 h-12',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
