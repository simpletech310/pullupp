type BadgeVariant = 'orange' | 'teal' | 'purple' | 'warning' | 'success' | 'error' | 'outline' | 'glass' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  orange: 'bg-primary-container/20 text-primary-container border border-primary-container/30',
  teal: 'bg-secondary-container/20 text-secondary border border-secondary-container/30',
  purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  warning: 'bg-primary/20 text-primary border border-primary/30',
  success: 'bg-secondary-container/20 text-secondary border border-secondary-container/30',
  error: 'bg-error-container/20 text-error border border-error/30',
  outline: 'bg-transparent text-on-surface-variant border border-outline-variant',
  glass: 'glass-card text-on-surface border border-white/10',
  default: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
};

export function Badge({ variant = 'orange', children, className = '' }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest',
      VARIANT_CLASSES[variant],
      className,
    ].join(' ')}>
      {children}
    </span>
  );
}
