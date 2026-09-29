import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              'w-full bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 disabled:opacity-50 disabled:bg-[#F1F5F9]',
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              error
                ? 'border-[#EF4444] focus:ring-[#EF4444]'
                : 'border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1]',
              'h-10 py-2',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#94A3B8] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-[#EF4444] font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
