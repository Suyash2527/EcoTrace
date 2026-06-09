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
        <label htmlFor={generatedId} className="field-label">
          {label}
        </label>
        <div className="relative">
          <input
            id={generatedId}
            ref={ref}
            className={`input-field ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''} ${className}`}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText && !error ? helperId : ''}`.trim() || undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
