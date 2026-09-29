import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet';
  size?: 'sm' | 'md';
  pill?: boolean;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'indigo',
  size = 'md',
  pill = false,
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold transition-colors tracking-wide whitespace-nowrap';

  const variants = {
    indigo:
      'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#4F46E5]/20 dark:text-[#818CF8] border border-[#C7D2FE]/60 dark:border-[#4F46E5]/30',
    emerald:
      'bg-[#ECFDF5] text-[#059669] dark:bg-[#059669]/20 dark:text-[#34D399] border border-[#A7F3D0]/60 dark:border-[#059669]/30',
    amber:
      'bg-[#FFFBEB] text-[#D97706] dark:bg-[#D97706]/20 dark:text-[#FBBF24] border border-[#FDE68A]/60 dark:border-[#D97706]/30',
    rose:
      'bg-[#FFF1F2] text-[#E11D48] dark:bg-[#E11D48]/20 dark:text-[#FB7185] border border-[#FECDD3]/60 dark:border-[#E11D48]/30',
    violet:
      'bg-[#F5F3FF] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA] border border-[#DDD6FE]/60 dark:border-[#7C3AED]/30',
    slate:
      'bg-[#F1F5F9] text-[#475569] dark:bg-[#334155]/50 dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#475569]/30',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotColors = {
    indigo: 'bg-[#4F46E5]',
    emerald: 'bg-[#10B981]',
    amber: 'bg-[#F59E0B]',
    rose: 'bg-[#EF4444]',
    violet: 'bg-[#8B5CF6]',
    slate: 'bg-[#64748B]',
  };

  return (
    <span
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        pill ? 'rounded-full' : 'rounded-lg',
        className
      )}
      {...props}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
};
