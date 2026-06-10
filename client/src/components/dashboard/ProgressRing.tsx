import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useCountUp } from '../../hooks/useCountUp';

interface ProgressRingProps {
  /** Current value (e.g. monthTotal kg CO₂) */
  value: number;
  /** Goal target (e.g. 100 kg/month budget) */
  goal?: number;
  /** Ring size in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
  label?: string;
  unit?: string;
  color?: string;
}

export function ProgressRing({
  value,
  goal = 100,
  size = 160,
  strokeWidth = 12,
  label = 'This Month',
  unit = 'kg CO₂',
}: ProgressRingProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const animatedValue = useCountUp(value, visible, { decimals: 1, duration: 1600, easing: 'easeOut' });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / goal, 1);
  const offset = circumference * (1 - (visible ? pct : 0));

  // status color: green → amber → red
  const ringColor = pct < 0.6 ? '#16a34a' : pct < 0.85 ? '#d97706' : '#ef4444';
  const ringGlow = pct < 0.6
    ? 'rgba(22,163,74,0.35)'
    : pct < 0.85
    ? 'rgba(217,119,6,0.35)'
    : 'rgba(239,68,68,0.35)';

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div ref={ref} className="glass-card flex flex-col items-center justify-center gap-3 overflow-visible">
      {/* Wrapper for SVG and text to ensure absolute positioning aligns exactly with the SVG */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Subtle glow behind ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.75,
            height: size * 0.75,
            background: `radial-gradient(circle, ${ringGlow} 0%, transparent 70%)`,
            transition: 'background 600ms ease',
            filter: 'blur(18px)',
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          className="relative z-10"
        >
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ringColor} stopOpacity="1" />
              <stop offset="100%" stopColor={pct < 0.6 ? '#22c55e' : pct < 0.85 ? '#f59e0b' : '#f87171'} stopOpacity="1" />
            </linearGradient>
            {/* Drop shadow filter */}
            <filter id="ring-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={ringColor} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="rgba(22,163,74,0.10)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#ring-shadow)"
            style={{
              transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)',
              willChange: 'stroke-dashoffset',
            }}
          />
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
        >
          <span
            className="font-black tabular-nums text-center"
            style={{
              fontSize: size * 0.2,
              letterSpacing: '-0.04em',
              color: ringColor,
              lineHeight: 1,
              transition: 'color 600ms ease',
            }}
          >
            {animatedValue.toFixed(1)}
          </span>
          <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{unit}</span>
        </div>
      </div>

      {/* Footer label */}
      <div className="text-center" style={{ marginTop: 4 }}>
        <p className="label">{label}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {pct < 1
            ? `${((1 - pct) * goal).toFixed(1)} kg under budget`
            : `${((pct - 1) * goal).toFixed(1)} kg over budget`}
        </p>
      </div>

      {/* Mini progress dots */}
      <div className="flex gap-1.5 mt-1">
        {[0.25, 0.5, 0.75, 1].map((milestone, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              background: pct >= milestone ? ringColor : 'rgba(22,163,74,0.15)',
              transform: pct >= milestone && visible ? 'scale(1.3)' : 'scale(1)',
              transitionDelay: `${i * 120 + 1200}ms`,
              boxShadow: pct >= milestone ? `0 0 6px ${ringColor}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
