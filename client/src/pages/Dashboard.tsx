import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useCarbonCalc } from '../hooks/useCarbonCalc';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';
import { TrendLine } from '../components/charts/TrendLine';
import { DonutChart } from '../components/charts/DonutChart';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { ComparisonChart } from '../components/charts/ComparisonChart';
import { getCountryAverage } from '../utils/countryAverages';

/* ── Animated Stat Card ── */
function StatCard({ label, value, unit, icon, color, note }: {
  label: string; value: number; unit: string;
  icon: React.ReactNode; color: string; note?: string;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const animated = useCountUp(value, visible, { decimals: 1, duration: 1200 });

  return (
    <div
      ref={ref}
      className="glass-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Inner glow accent border */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${color}22, inset 0 1px 0 rgba(255,255,255,0.9)`,
        }}
      />
      <div className="flex items-start justify-between mb-4">
        <span className="label">{label}</span>
        <div
          className="stat-icon transition-transform duration-300 hover:scale-110"
          style={{ background: `${color}14`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span
          className="co2-display"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {animated.toFixed(1)}
        </span>
        <span className="co2-unit mb-1">{unit}</span>
      </div>
      {note && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{note}</p>
      )}
    </div>
  );
}

/* ── Animated Equivalences Card ── */
function EquivCard({ trees, carKm }: { trees: number; carKm: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const animTrees = useCountUp(trees, visible, { decimals: 0, duration: 1400 });
  const animKm    = useCountUp(carKm, visible, { decimals: 0, duration: 1400 });

  return (
    <div
      ref={ref}
      className="glass-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <span className="label mb-4 block">Equivalents</span>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{animTrees}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>trees to offset</p>
          </div>
        </div>
        <div className="h-px" style={{ background: 'rgba(22,163,74,0.1)' }} />
        <div className="flex items-center gap-3">
          <div className="stat-icon" style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{animKm}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>km driven equiv.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Scroll-revealed section wrapper ── */
function RevealSection({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 550ms ease ${delay}ms, transform 550ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function Dashboard() {
  const { profile, user } = useAuth();
  const { activities, loading } = useActivities(user?.uid);
  const { weekTotal, monthTotal, byCategory, equivalences } = useCarbonCalc(activities);

  const trendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr,
        co2Kg: activities.filter(a => a.date === dateStr).reduce((s, a) => s + a.co2Kg, 0),
      };
    });
  }, [activities]);

  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-5">
        <div className="skeleton h-8 w-56 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-3xl" />)}
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  const firstName = profile?.displayName?.split(' ')[0] || 'Eco Warrior';
  // Budget: global average is ~11kg CO₂/day → ~330/month; personal target 100kg
  const MONTHLY_BUDGET = 100;

  const countryAvg = getCountryAverage(profile?.location);
  const comparisonData = [
    { label: 'You', value: monthTotal, color: '#10b981', subLabel: 'This month' },
    { label: countryAvg.country, value: countryAvg.monthlyKg, color: '#3b82f6', subLabel: 'Avg month' },
    { label: 'Global', value: 391, color: '#f59e0b', subLabel: 'Avg month' },
  ];

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-6 animate-in">

      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Hey, {firstName}! 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Here's your carbon impact overview.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)' }}>
          <div className="glow-dot" />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Live tracking</span>
        </div>
      </header>

      {/* Stat cards — row 1: ring + two animated stats + equiv */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Progress ring replaces plain month card */}
        <RevealSection delay={0}>
          <ProgressRing
            value={monthTotal}
            goal={MONTHLY_BUDGET}
            size={160}
            label="This Month"
            unit="kg CO₂"
          />
        </RevealSection>

        <StatCard
          label="This Week"
          value={weekTotal}
          unit="kg CO₂"
          color="#7c3aed"
          note="Your 7-day rolling total"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" /></svg>}
        />

        <EquivCard trees={equivalences.trees} carKm={equivalences.carKm} />

        {/* AI Insights prompt card */}
        <RevealSection delay={60} className="h-full">
          <div className="glass-card flex flex-col items-center justify-center text-center gap-4 h-full relative">
            {/* Animated glow pulse behind icon */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 80, height: 80,
                background: 'radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)',
                animation: 'pulse-dot 3s ease-in-out infinite',
                filter: 'blur(12px)',
              }}
            />
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg relative z-10"
              style={{ background: 'var(--gradient-brand)', boxShadow: '0 8px 24px var(--accent-glow)' }}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                AI Insights ready
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: 180, margin: '0 auto' }}>
                Personalised tips from Gemini AI.
              </p>
            </div>
            <Link to="/insights" className="btn btn-primary px-5 py-2 text-xs">
              View Insights
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </RevealSection>
      </div>

      {/* Charts row */}
      <RevealSection delay={80} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><TrendLine data={trendData} /></div>
        <CategoryBreakdown data={byCategory} />
      </RevealSection>

      {/* Analytics Row 2 */}
      <RevealSection delay={120} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ComparisonChart data={comparisonData} />
        <DonutChart data={byCategory} />
        {/* Quick action card */}
        <div className="glass-card flex flex-col justify-between gap-4">
          <div>
            <span className="label mb-3 block">Quick Actions</span>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Keep the momentum going
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Every activity you log helps you understand your true footprint.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/log"
              className="btn btn-primary px-4 py-2.5 text-sm w-full justify-between"
            >
              <span>Log an activity</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link to="/compare"
              className="btn btn-glass px-4 py-2.5 text-sm w-full justify-between"
            >
              <span>Compare transport</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
