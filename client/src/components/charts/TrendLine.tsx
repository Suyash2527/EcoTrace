import React from 'react';
import { Card } from '../ui/Card';

interface TrendLineProps {
  data: { date: string; co2Kg: number }[];
}

export function TrendLine({ data }: TrendLineProps) {
  if (data.length === 0) return null;

  // Find max for scaling
  const max = Math.max(...data.map(d => d.co2Kg), 10); // Minimum scale of 10
  
  // SVG dimensions
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 40;
  
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  
  // Map points to SVG coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * innerWidth;
    const y = height - paddingY - (d.co2Kg / max) * innerHeight;
    return { x, y, value: d.co2Kg, date: d.date };
  });

  // Create path data
  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  
  // Create area data for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1]?.x},${height - paddingY} L ${points[0]?.x},${height - paddingY} Z`;

  return (
    <Card className="h-full">
      <h3 className="text-cream-200 font-medium mb-4">Last 7 Days Trend</h3>
      
      <div className="w-full overflow-x-auto hide-scrollbar">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[400px]">
          <defs>
            <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e5530" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="#1e5530" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#388f51" />
          
          {/* Y-axis labels */}
          <text x={paddingX - 10} y={paddingY + 4} fill="#52b36a" fontSize="12" textAnchor="end">{Math.round(max)}</text>
          <text x={paddingX - 10} y={height/2 + 4} fill="#52b36a" fontSize="12" textAnchor="end">{Math.round(max/2)}</text>
          <text x={paddingX - 10} y={height - paddingY + 4} fill="#52b36a" fontSize="12" textAnchor="end">0</text>
          
          {/* Area under curve */}
          <path d={areaD} fill="url(#trend-gradient)" className="animate-in" style={{ animationDuration: '1.5s' }} />
          
          {/* Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="animate-in"
            style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'dash 1.5s ease-out forwards' }}
          />
          
          {/* Data points */}
          {points.map((p, i) => (
            <g key={i} className="group">
              <circle cx={p.x} cy={p.y} r="4" fill="#0d2818" stroke="#f59e0b" strokeWidth="2" className="transition-all duration-200 group-hover:r-6" />
              <text 
                x={p.x} 
                y={p.y - 15} 
                fill="#f5f0e8" 
                fontSize="12" 
                textAnchor="middle" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {p.value.toFixed(1)}
              </text>
              {/* X-axis labels (Dates) */}
              <text 
                x={p.x} 
                y={height - paddingY + 20} 
                fill="#52b36a" 
                fontSize="10" 
                textAnchor="middle"
              >
                {new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </Card>
  );
}
