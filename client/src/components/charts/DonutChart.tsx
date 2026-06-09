import React from 'react';
import { Card } from '../ui/Card';

interface DonutChartProps {
  data: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#f59e0b', // amber-400
  food: '#4ade80',      // green-400
  energy: '#60a5fa',    // blue-400
  shopping: '#f472b6',  // pink-400
  travel: '#a78bfa',    // purple-400
  unknown: '#388f51'    // forest-400
};

export function DonutChart({ data }: DonutChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
  if (total === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-48 h-48 rounded-full border-[16px] border-forest-800 flex items-center justify-center">
          <span className="text-forest-400 text-sm">No Data</span>
        </div>
      </Card>
    );
  }

  // Calculate SVG circles
  let cumulativePercent = 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const segments = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => {
      const percent = value / total;
      const strokeDasharray = `${percent * circumference} ${circumference}`;
      const strokeDashoffset = -cumulativePercent * circumference;
      cumulativePercent += percent;
      
      return {
        category,
        percent,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.unknown,
        strokeDasharray,
        strokeDashoffset
      };
    });

  return (
    <Card className="h-full flex flex-col items-center">
      <h3 className="text-cream-200 font-medium mb-4 self-start">CO2 by Category</h3>
      
      <div className="relative w-64 h-64 mb-6">
        <svg viewBox="-100 -100 200 200" className="transform -rotate-90 w-full h-full">
          {segments.map((seg, i) => (
            <circle
              key={i}
              r={radius}
              cx="0"
              cy="0"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="32"
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              className="transition-all duration-1000 ease-out hover:stroke-[36px]"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono text-cream-100">{Math.round(total)}</span>
          <span className="text-sm text-forest-300">kg CO2</span>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-auto">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center text-sm text-cream-200">
            <span 
              className="w-3 h-3 rounded-full mr-1.5" 
              style={{ backgroundColor: seg.color }} 
            />
            <span className="capitalize">{seg.category}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
