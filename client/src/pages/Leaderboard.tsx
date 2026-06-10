import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalCO2Kg: number;
  rank: number;
  isCurrentUser?: boolean;
}

// Podium card for top 3
function PodiumCard({ entry, delay }: { entry: LeaderboardEntry; delay: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const animated = useCountUp(entry.totalCO2Kg, visible, { decimals: 1, duration: 1200 });

  const medals = ['🥇', '🥈', '🥉'];
  const colors = [
    { bg: 'linear-gradient(135deg,#fef9c3,#fde68a)', border: '#f59e0b', glow: 'rgba(245,158,11,0.3)', text: '#92400e' },
    { bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', border: '#94a3b8', glow: 'rgba(148,163,184,0.25)', text: '#475569' },
    { bg: 'linear-gradient(135deg,#fdf4eb,#fed7aa)', border: '#f97316', glow: 'rgba(249,115,22,0.25)', text: '#9a3412' },
  ];
  const c = colors[entry.rank - 1];
  const heights = ['h-32', 'h-24', 'h-20'];

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: `opacity 600ms ease ${delay}ms, transform 600ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {/* Medal + avatar */}
      <div className="relative">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black border-2 shadow-lg"
          style={{
            background: c.bg,
            borderColor: c.border,
            boxShadow: `0 4px 20px ${c.glow}, 0 2px 6px rgba(0,0,0,0.08)`,
          }}
        >
          {entry.displayName.charAt(0).toUpperCase()}
        </div>
        <div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            animation: entry.rank === 1 ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }}
        >
          {medals[entry.rank - 1]}
        </div>
        {entry.isCurrentUser && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="badge badge-green text-[9px] py-0.5 px-1.5">You</span>
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-xs font-bold text-center max-w-[80px] truncate" style={{ color: 'var(--text-primary)' }}>
        {entry.displayName}
      </p>

      {/* Podium block */}
      <div
        className={`w-20 ${heights[entry.rank - 1]} rounded-t-xl flex flex-col items-center justify-start pt-2 border`}
        style={{
          background: c.bg,
          borderColor: `${c.border}44`,
          boxShadow: `0 -4px 16px ${c.glow}`,
        }}
      >
        <span className="text-xs font-black tabular-nums" style={{ color: c.text }}>
          {animated.toFixed(1)}
        </span>
        <span className="text-[9px]" style={{ color: c.text, opacity: 0.7 }}>kg CO₂</span>
      </div>
    </div>
  );
}

// Table row for positions 4+
function LeaderRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const { ref, visible } = useScrollReveal<HTMLTableRowElement>({ threshold: 0.1 });
  const animated = useCountUp(entry.totalCO2Kg, visible, { decimals: 1, duration: 1000 });

  return (
    <tr
      ref={ref}
      className="border-b last:border-0 transition-all duration-200 hover:bg-white/40"
      style={{
        borderColor: 'rgba(22,163,74,0.08)',
        background: entry.isCurrentUser ? 'rgba(22,163,74,0.06)' : 'transparent',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-12px)',
        transition: `opacity 400ms ease ${index * 50}ms, transform 400ms ease ${index * 50}ms, background 200ms`,
      }}
    >
      <td className="py-3.5 pl-5 w-12">
        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black tabular-nums"
          style={{
            background: entry.isCurrentUser ? 'rgba(22,163,74,0.15)' : 'rgba(15,36,25,0.05)',
            color: entry.isCurrentUser ? 'var(--accent)' : 'var(--text-muted)',
          }}>
          {entry.rank}
        </span>
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: entry.isCurrentUser ? 'var(--gradient-brand)' : 'linear-gradient(135deg,#94a3b8,#64748b)' }}
          >
            {entry.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {entry.displayName}
          </span>
          {entry.isCurrentUser && (
            <span className="badge badge-green text-[9px]">You</span>
          )}
        </div>
      </td>
      <td className="py-3.5 pr-5 text-right">
        <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {animated.toFixed(1)}
        </span>
        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>kg</span>
      </td>
    </tr>
  );
}

export function Leaderboard() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  const fetchLeaderboard = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/leaderboard', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Failed to load leaderboard');
      const data: LeaderboardEntry[] = await res.json();

      // If no other users yet, show current user + some inspiring placeholders
      if (data.length === 0 && profile) {
        setEntries([
          {
            uid: user.uid,
            displayName: profile.displayName || 'You',
            totalCO2Kg: profile.totalCO2Kg || 0,
            rank: 1,
            isCurrentUser: true,
          },
        ]);
      } else {
        setEntries(data.map(e => ({ ...e, isCurrentUser: e.uid === user.uid })));
      }
    } catch {
      setError('Failed to load leaderboard');
      // Fallback: show current user at least
      if (profile) {
        setEntries([{
          uid: user.uid,
          displayName: profile.displayName || 'You',
          totalCO2Kg: profile.totalCO2Kg || 0,
          rank: 1,
          isCurrentUser: true,
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

   
  useEffect(() => {
    if (!user) return;
    fetchLeaderboard();
  }, [user]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);



  return (
    <div className="p-5 md:p-10 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div
        ref={headerRef}
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Global Leaderboard
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Lower carbon footprint = higher rank. Monthly total.
            </p>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="btn btn-glass px-4 py-2 text-sm gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton h-14 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      )}

      {/* Podium — top 3 */}
      {!loading && top3.length >= 1 && (
        <div className="glass-card">
          <p className="label mb-6 text-center">🏆 Top Champions</p>
          <div className="flex items-end justify-center gap-4 px-4">
            {/* Silver (2nd) */}
            {top3[1] ? (
              <PodiumCard entry={top3[1]} delay={100} />
            ) : <div className="w-20" />}
            {/* Gold (1st) — tallest */}
            {top3[0] && <PodiumCard entry={top3[0]} delay={0} />}
            {/* Bronze (3rd) */}
            {top3[2] ? (
              <PodiumCard entry={top3[2]} delay={200} />
            ) : <div className="w-20" />}
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      {!loading && rest.length > 0 && (
        <div className="glass-card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(22,163,74,0.04)', borderBottom: '1px solid rgba(22,163,74,0.08)' }}>
                <th className="py-3 pl-5 text-left">
                  <span className="label">Rank</span>
                </th>
                <th className="py-3 text-left">
                  <span className="label">User</span>
                </th>
                <th className="py-3 pr-5 text-right">
                  <span className="label">CO₂ / month</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rest.map((entry, i) => (
                <LeaderRow key={entry.uid} entry={entry} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length <= 1 && !error && (
        <div className="glass-card text-center py-10">
          <p className="text-3xl mb-3">🌍</p>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Be the first on the leaderboard!
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Complete onboarding and log activities to appear here.
          </p>
        </div>
      )}

      {/* Info banner */}
      <div className="glass-card flex items-start gap-3" style={{ background: 'rgba(240,249,255,0.7)' }}>
        <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#0891b2' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Rankings are based on total CO₂ logged this month. Lower is better — less carbon means a higher position. Only users who have completed onboarding are shown.
        </p>
      </div>
    </div>
  );
}
