import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const baseStyles =
    'animate-pulse bg-gradient-to-r from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0] dark:from-[#1E293B] dark:via-[#334155] dark:to-[#1E293B] rounded-xl';

  const variants = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl border border-[#E2E8F0] dark:border-[#334155]',
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};
