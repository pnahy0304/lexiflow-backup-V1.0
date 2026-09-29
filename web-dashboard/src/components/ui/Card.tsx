import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'interactive';
  hoverEffect?: boolean;
}

export const CardRoot: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const baseStyles =
    'rounded-2xl transition-all duration-200 overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]';

  const variants = {
    default:
      'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)]',
    glass:
      'bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-[#E2E8F0]/80 dark:border-[#1F2937]/80 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)]',
    bordered:
      'bg-white dark:bg-[#111827] border-2 border-[#E2E8F0] dark:border-[#1F2937]',
    interactive:
      'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1F2937] shadow-sm hover:shadow-indigo-glow hover:border-[#818CF8]/50 cursor-pointer active:scale-[0.99]',
  };

  const hoverStyles = hoverEffect ? 'hover:-translate-y-1 hover:shadow-md' : '';

  return (
    <div
      className={clsx(baseStyles, variants[variant], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={clsx(
      'px-6 py-5 border-b border-[#F1F5F9] dark:border-[#1F2937] flex items-center justify-between gap-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3
    className={clsx(
      'text-base md:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => <div className={clsx('p-6', className)} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={clsx(
      'px-6 py-4 bg-[#F8FAFC] dark:bg-[#0B0F19]/50 border-t border-[#F1F5F9] dark:border-[#1F2937] flex items-center justify-between',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Body: CardBody,
  Footer: CardFooter,
});
