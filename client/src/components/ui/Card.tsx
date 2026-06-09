import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  isInsight?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', isInsight, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-forest-800 border border-forest-400/20 rounded-[20px] p-6 transition-all duration-200 hover:border-forest-300/40 hover:-translate-y-px ${
          isInsight ? 'border-l-4 border-l-amber-400' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
