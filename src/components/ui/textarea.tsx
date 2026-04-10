import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border bg-white px-3 py-2 text-sm text-gray-900',
            'placeholder:text-gray-400 transition-colors resize-y',
            'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
            className,
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
        {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
