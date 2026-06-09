import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  isInsight?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', isInsight, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`glass-card ${
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
