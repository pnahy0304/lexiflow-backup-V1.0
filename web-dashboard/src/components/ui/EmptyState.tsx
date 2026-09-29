import React from 'react';
import { clsx } from 'clsx';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-10 h-10 text-[#4F46E5]" />,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#0B0F19]/30',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] dark:bg-[#4F46E5]/20 flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h4 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
