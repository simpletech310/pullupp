interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface border border-border rounded-2xl overflow-hidden
        ${hoverable ? 'hover:border-border-light hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function StatCard({ value, label, color = 'text-orange' }: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex-1">
      <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
      <div className="text-xs text-text-secondary mt-1">{label}</div>
    </div>
  );
}
