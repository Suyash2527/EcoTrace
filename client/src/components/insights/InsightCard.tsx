import React from 'react';
import { Insight } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCO2, formatDate } from '../../utils/formatters';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const difficultyMap = {
    easy: { label: 'Easy win', variant: 'success' as const },
    medium: { label: 'Medium effort', variant: 'warning' as const },
    hard: { label: 'Major change', variant: 'danger' as const },
  };

  const diff = difficultyMap[insight.difficulty];

  return (
    <Card isInsight className="flex flex-col h-full relative overflow-hidden animate-in group">
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <Badge variant={diff.variant}>{diff.label}</Badge>
          <span className="text-xs text-forest-400">{formatDate(insight.generatedAt)}</span>
        </div>

        <h3 className="text-lg font-bold text-cream-100 mb-2">{insight.title}</h3>
        <p className="text-sm text-forest-300 mb-4 flex-grow">{insight.description}</p>

        <div className="bg-forest-900/50 rounded-lg p-4 mb-4">
          <ul className="space-y-2">
            {insight.actionItems.map((item, i) => (
              <li key={i} className="flex text-sm text-cream-200">
                <span className="text-amber-400 mr-2 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-forest-400/10 pt-4">
          <span className="text-sm font-medium text-forest-300">Potential saving</span>
          <div className="text-right">
            <span className="text-lg font-mono font-bold text-amber-400">
              {formatCO2(insight.potentialSavingKg).split(' ')[0]}
            </span>
            <span className="text-amber-400/80 text-sm ml-1 font-medium">
              {formatCO2(insight.potentialSavingKg).split(' ')[1]}/mo
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
