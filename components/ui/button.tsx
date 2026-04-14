import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal' | 'kinetic';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary-container text-white shadow-[0_0_16px_rgba(255,107,53,0.3)] hover:opacity-90 active:scale-95',
  secondary: 'bg-surface-container-high text-on-surface border border-outline-variant/20 hover:bg-surface-container-highest active:scale-95',
  outline: 'bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container active:scale-95',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container active:scale-95',
  danger: 'bg-error-container/20 text-error border border-error/20 hover:bg-error-container/30 active:scale-95',
  teal: 'bg-secondary-container text-white shadow-[0_0_16px_rgba(4,180,162,0.3)] hover:opacity-90 active:scale-95',
  kinetic: 'kinetic-gradient text-white shadow-[0_0_20px_rgba(255,107,53,0.4)] hover:opacity-90 active:scale-95',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs rounded-xl',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-14 px-6 text-sm rounded-2xl',
  xl: 'h-16 px-8 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-body font-bold uppercase tracking-widest',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
