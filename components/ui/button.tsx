import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'teal' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-orange text-white hover:bg-orange-light active:bg-orange-dark shadow-[0_0_20px_rgba(255,107,53,0.2)] hover:shadow-[0_0_24px_rgba(255,107,53,0.35)]',
  secondary: 'bg-surface border border-border-light text-text-primary hover:bg-surface-hover',
  outline: 'bg-transparent border border-border-light text-text-primary hover:bg-surface-hover',
  teal: 'bg-teal text-white hover:bg-teal-light active:bg-teal-dark shadow-[0_0_20px_rgba(20,184,166,0.2)]',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover',
  danger: 'bg-error text-white hover:bg-red-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-3 text-sm rounded-xl gap-2',
  lg: 'px-6 py-4 text-base rounded-xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading || undefined}
        aria-busy={loading || undefined}
        className={`
          inline-flex items-center justify-center font-semibold font-body
          transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
