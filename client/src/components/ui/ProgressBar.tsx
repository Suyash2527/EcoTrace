import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({ 
  value, 
  max, 
  colorClass = 'bg-amber-400', 
  label,
  showValue = true 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-end mb-2 text-sm">
          {label && <span className="font-medium text-cream-200">{label}</span>}
          {showValue && (
            <span className="text-forest-300 font-mono">
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div 
        className="h-3 w-full bg-forest-900 rounded-full overflow-hidden border border-forest-700/50"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
