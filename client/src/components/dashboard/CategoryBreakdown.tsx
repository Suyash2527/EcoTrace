import React from 'react';
import { Card } from '../ui/Card';
import { formatCO2 } from '../../utils/formatters';

interface CategoryBreakdownProps {
  data: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-amber-500',
  food: 'bg-green-400',
  energy: 'bg-blue-400',
  shopping: 'bg-pink-400',
  travel: 'bg-purple-400',
  unknown: 'bg-forest-500'
};

const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚗',
  food: '🍔',
  energy: '⚡',
  shopping: '🛍️',
  travel: '✈️',
  unknown: '❓'
};

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
  // Sort descending
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .filter((entry) => entry[1] > 0);

  if (total === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center text-forest-400 p-8">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <p>No data yet for breakdown</p>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <h3 className="text-cream-200 font-medium mb-6">Emissions by Category</h3>
      
      <div className="space-y-5">
        {sorted.map(([category, value]) => {
          const percentage = Math.round((value / total) * 100);
          const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.unknown;
          const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.unknown;
          
          return (
            <div key={category} className="group">
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center text-cream-100">
                  <span className="mr-2">{icon}</span>
                  <span className="capitalize">{category}</span>
                </div>
                <div className="flex space-x-3">
                  <span className="text-forest-300">{formatCO2(value)}</span>
                  <span className="text-amber-400 font-medium w-10 text-right">{percentage}%</span>
                </div>
              </div>
              
              <div className="w-full h-2.5 bg-forest-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${color} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
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
