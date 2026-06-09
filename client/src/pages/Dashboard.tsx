import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useCarbonCalc } from '../hooks/useCarbonCalc';
import { TrendLine } from '../components/charts/TrendLine';
import { DonutChart } from '../components/charts/DonutChart';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';

function StatCard({ label, value, unit, icon, color, note }: {
  label: string; value: number; unit: string;
  icon: React.ReactNode; color: string; note?: string;
}) {
  return (
    <div className="glass-card">
      <div className="flex items-start justify-between mb-4">
        <span className="label">{label}</span>
        <div className="stat-icon" style={{ background: `${color}14`, color }}>{icon}</div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="co2-display">{value.toFixed(1)}</span>
        <span className="co2-unit mb-1">{unit}</span>
      </div>
      {note && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{note}</p>
      )}
    </div>
  );
}

function EquivCard({ trees, carKm }: { trees: number; carKm: number }) {
  return (
    <div className="glass-card">
      <span className="label mb-4 block">Equivalents</span>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="stat-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{trees.toFixed(0)}</p>
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
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{carKm.toFixed(0)}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>km driven equiv.</p>
          </div>
        </div>
      </div>
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label="This Month"
          value={monthTotal}
          unit="kg CO₂"
          color="#16a34a"
          note="Total carbon footprint logged this month"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <StatCard
          label="This Week"
          value={weekTotal}
          unit="kg CO₂"
          color="#7c3aed"
          note="Your 7-day rolling total"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" /></svg>}
        />
        <EquivCard trees={equivalences.trees} carKm={equivalences.carKm} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><TrendLine data={trendData} /></div>
        <CategoryBreakdown data={byCategory} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DonutChart data={byCategory} />

        {/* AI prompt card */}
        <div className="glass-card flex flex-col items-center justify-center text-center gap-5">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 8px 24px var(--accent-glow)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              AI Insights ready
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: 260, margin: '0 auto' }}>
              Gemini AI has analysed your habits and has personalised tips ready for you.
            </p>
          </div>
          <Link to="/insights" className="btn btn-primary px-6 py-2.5 text-sm">
            View Insights
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
