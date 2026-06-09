import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const generatedId = id || Math.random().toString(36).substr(2, 9);
    const errorId = `${generatedId}-error`;
    const helperId = `${generatedId}-helper`;

    return (
      <div className="w-full">
        <label htmlFor={generatedId} className="block text-sm font-medium text-cream-200 mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            id={generatedId}
            ref={ref}
            className={`w-full bg-forest-900 border ${
              error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-forest-600 focus:ring-amber-400 focus:border-amber-400'
            } rounded-md py-2 px-3 text-cream-100 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${className}`}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText && !error ? helperId : ''}`.trim() || undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-forest-300">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
