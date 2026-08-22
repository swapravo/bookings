import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-soft',
  secondary: 'bg-ink text-white hover:bg-ink/90 active:bg-ink shadow-soft',
  ghost: 'text-ink-secondary hover:bg-ink/5 hover:text-ink',
  outline: 'border border-border bg-surface text-ink hover:border-border-strong hover:bg-background shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-btn',
  md: 'h-11 px-5 text-sm rounded-btn',
  lg: 'h-14 px-7 text-base rounded-btn',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
