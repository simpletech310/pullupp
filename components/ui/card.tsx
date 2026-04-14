interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hoverable = false, glass = false, onClick }: CardProps) {
  const baseClass = glass ? 'glass-card' : 'bg-surface-container';

  return (
    <div
      onClick={onClick}
      className={[
        baseClass,
        'rounded-2xl border border-white/5',
        hoverable ? 'cursor-pointer hover:bg-surface-container-high active:scale-[0.98] transition-all duration-150' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function StatCard({ value, label, color = 'text-primary-container' }: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-surface-container border border-white/5 rounded-2xl p-4 flex-1">
      <div className={`font-headline font-bold text-2xl ${color}`}>{value}</div>
      <div className="text-xs text-on-surface-variant mt-1 font-body">{label}</div>
    </div>
  );
}
