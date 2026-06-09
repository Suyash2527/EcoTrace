import React from 'react';
import { Card } from '../ui/Card';
import { formatCO2 } from '../../utils/formatters';

interface SummaryCardProps {
  title: string;
  valueKg: number;
  delta?: number;
  deltaText?: string;
  isHero?: boolean;
}

export function SummaryCard({ title, valueKg, delta, deltaText, isHero }: SummaryCardProps) {
  const isPositiveDelta = delta && delta > 0;
  const isNegativeDelta = delta && delta < 0;

  return (
    <Card className={isHero ? 'bg-gradient-to-br from-forest-800 to-forest-900 border-none relative overflow-hidden' : ''}>
      {isHero && (
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-forest-700/30">
          <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/>
          </svg>
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className={`text-cream-200 font-medium ${isHero ? 'text-lg mb-2' : 'text-sm mb-1'}`}>
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className={isHero ? 'co2-display' : 'text-3xl font-mono text-cream-100 font-light tracking-tight'}>
            {formatCO2(valueKg).split(' ')[0]}
          </span>
          <span className={isHero ? 'co2-unit' : 'text-forest-300 text-sm font-medium'}>
            {formatCO2(valueKg).split(' ')[1]}
          </span>
        </div>

        {delta !== undefined && (
          <div className="mt-4 flex items-center text-sm font-medium">
            <span className={`flex items-center ${isPositiveDelta ? 'text-red-400' : isNegativeDelta ? 'text-green-400' : 'text-forest-400'}`}>
              {isPositiveDelta ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : isNegativeDelta ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                </svg>
              )}
              {Math.abs(delta)}%
            </span>
            <span className="ml-2 text-forest-300">{deltaText}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
