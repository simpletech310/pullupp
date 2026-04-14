import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-surface border border-border rounded-xl px-4 py-3
              text-sm text-text-primary font-body
              placeholder:text-text-muted
              focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };
