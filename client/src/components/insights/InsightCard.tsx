import React from 'react';
import { Insight } from '../../types';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const CATEGORY_ICONS: Record<string, string> = {
  transport: '🚗', food: '🥗', energy: '⚡', shopping: '🛍️', travel: '✈️',
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy win',      color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  border: 'rgba(22,163,74,0.2)' },
  medium: { label: 'Medium effort', color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.2)' },
  hard:   { label: 'Major change',  color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
};

interface InsightCardProps {
  insight: Insight;
  delay?: number;
}

export function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const diff = DIFFICULTY_CONFIG[insight.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const catIcon = CATEGORY_ICONS[insight.category] ?? '🌱';

  return (
    <div
      ref={ref}
      className="glass-card flex flex-col h-full group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {/* Top row: category icon + difficulty badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: diff.bg }}
          >
            {catIcon}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {insight.category}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}
        >
          {diff.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-black mb-2 leading-snug"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
        {insight.title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-4 flex-grow"
        style={{ color: 'var(--text-secondary)' }}>
        {insight.description}
      </p>

      {/* Action items */}
      <div
        className="rounded-xl p-3.5 mb-4 space-y-2"
        style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.1)' }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Action steps
        </p>
        {insight.actionItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {i + 1}
            </div>
            <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: potential saving */}
      <div
        className="flex items-center justify-between pt-3.5 mt-auto border-t"
        style={{ borderColor: 'rgba(22,163,74,0.1)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Potential saving
        </span>
        <div className="flex items-end gap-1">
          <span
            className="text-lg font-black tabular-nums"
            style={{
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {insight.potentialSavingKg.toFixed(1)}
          </span>
          <span className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
            kg CO₂/mo
          </span>
        </div>
      </div>
    </div>
  );
}
