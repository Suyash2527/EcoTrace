import React from 'react';
import { Card } from '../ui/Card';

interface ComparisonData {
  label: string;
  value: number;
  color: string;
  subLabel?: string;
}

interface ComparisonChartProps {
  data: ComparisonData[];
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  if (data.length === 0) return null;

  // Find max value to scale the bars, ensure a minimum scale so small bars are visible
  const maxValue = Math.max(...data.map(d => d.value), 100);
  
  return (
    <Card className="h-full flex flex-col justify-between relative overflow-hidden group/card">
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-cream-100 mb-1 tracking-tight">Impact Comparison</h3>
        <p className="text-xs text-cream-200/60 mb-6">Your footprint vs. averages</p>
      </div>
      
      {/* Background Grid Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-end pb-16 px-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full border-t border-green-900/20 absolute left-0" style={{ bottom: `${(i * 30) + 20}%` }} />
        ))}
      </div>

      <div className="relative z-10 flex items-end justify-between h-48 gap-3 mt-auto pt-4 border-b border-green-800/40">
        {data.map((item, index) => {
          // Calculate height percentage relative to container
          const heightPercent = Math.max((item.value / maxValue) * 90, 4);
          const isUser = item.label === 'You';
          
          return (
            <div key={index} className="flex flex-col items-center justify-end flex-1 h-full group">
              <div 
                className="w-full max-w-[56px] rounded-t-xl relative transition-all duration-700 ease-out flex justify-center hover:brightness-125"
                style={{ 
                  height: `${heightPercent}%`, 
                  background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}40 100%)`,
                  borderTop: `2px solid ${item.color}`,
                  borderLeft: `1px solid ${item.color}80`,
                  borderRight: `1px solid ${item.color}80`,
                  boxShadow: isUser ? `0 0 20px ${item.color}40, inset 0 4px 12px ${item.color}80` : `inset 0 4px 12px ${item.color}40`,
                }}
              >
                {/* Value floating inside/above bar */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 font-bold text-xs bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-xl border border-gray-700 text-white z-20 pointer-events-none whitespace-nowrap">
                  {Math.round(item.value)} kg
                </div>
              </div>
              <div className="mt-2 text-center h-12 flex flex-col justify-start">
                <p className={`text-sm ${isUser ? 'font-black' : 'font-semibold'}`} style={{ color: item.color }}>{item.label}</p>
                {item.subLabel && <p className="text-[10px] text-cream-200/50 mt-0.5">{item.subLabel}</p>}
                <p className="text-xs font-bold text-cream-100 mt-1">{Math.round(item.value)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
