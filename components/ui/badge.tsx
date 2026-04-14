type BadgeVariant = 'default' | 'orange' | 'teal' | 'success' | 'warning' | 'error' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-alt text-text-secondary',
  orange: 'bg-orange/15 text-orange border border-orange/20',
  teal: 'bg-teal/15 text-teal border border-teal/20',
  success: 'bg-success/15 text-success border border-success/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
  error: 'bg-error/15 text-error border border-error/20',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full
      text-xs font-semibold uppercase tracking-wide
      ${variantClasses[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
}
