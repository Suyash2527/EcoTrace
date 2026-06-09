import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';

interface EquivalenceWidgetProps {
  trees: number;
  carKm: number;
}

export function EquivalenceWidget({ trees, carKm }: EquivalenceWidgetProps) {
  const [index, setIndex] = useState(0);

  const equivalences = [
    {
      value: trees,
      label: 'trees needed to absorb this year',
      icon: '🌲',
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      value: carKm,
      label: 'km driven in an average car',
      icon: '🚗',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(current => (current + 1) % equivalences.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [equivalences.length]);

  const current = equivalences[index];

  return (
    <Card className="flex flex-col justify-center items-center text-center h-full relative overflow-hidden group">
      <div className={`absolute inset-0 ${current.bg} opacity-50 transition-colors duration-1000`}></div>
      
      <div className="relative z-10 animate-in key-current">
        <div className="text-4xl mb-3">{current.icon}</div>
        <div className={`text-3xl font-mono font-bold ${current.color} mb-1`}>
          {current.value.toLocaleString()}
        </div>
        <div className="text-forest-200 text-sm font-medium">
          {current.label}
        </div>
      </div>

      <div className="absolute bottom-4 flex gap-1 z-10">
        {equivalences.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-3 bg-amber-400' : 'bg-forest-600'}`}
          />
        ))}
      </div>
    </Card>
  );
}
