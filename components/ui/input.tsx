import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  suffix,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-body">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 text-on-surface-variant pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={[
            'w-full bg-surface-container-lowest border border-outline-variant/30',
            'rounded-xl py-3.5 text-sm text-on-surface placeholder:text-outline',
            'focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30',
            'transition-colors duration-150 font-body',
            icon ? 'pl-11 pr-4' : 'px-4',
            suffix ? 'pr-12' : '',
            error ? 'border-error focus:border-error focus:ring-error/30' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-on-surface-variant pointer-events-none flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-error font-body">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
