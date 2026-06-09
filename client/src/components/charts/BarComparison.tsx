import React from 'react';
import { Card } from '../ui/Card';

interface BarComparisonProps {
  items: { label: string; value: number; color?: string; isHighlight?: boolean }[];
  title?: string;
}

export function BarComparison({ items, title }: BarComparisonProps) {
  const max = Math.max(...items.map(i => i.value));
  
  return (
    <Card>
      {title && <h3 className="text-cream-200 font-medium mb-6">{title}</h3>}
      
      <div className="space-y-4">
        {items.map((item, i) => {
          const percentage = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={i} className="flex flex-col">
              <div className="flex justify-between text-sm mb-1">
                <span className={item.isHighlight ? 'text-amber-400 font-medium' : 'text-cream-100'}>
                  {item.label}
                </span>
                <span className="text-forest-300 font-mono">{item.value.toFixed(1)} kg</span>
              </div>
              <div className="w-full h-4 bg-forest-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    item.color ? item.color : (item.isHighlight ? 'bg-amber-400' : 'bg-forest-600')
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
