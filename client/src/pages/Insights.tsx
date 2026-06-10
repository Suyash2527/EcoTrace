import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { InsightCard } from '../components/insights/InsightCard';
import { InsightsSkeleton } from '../components/insights/InsightsSkeleton';
import { AIChat } from '../components/insights/AIChat';
import { Insight } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export function Insights() {
  const { user, profile } = useAuth();
  const { activities } = useActivities(user?.uid);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll reveals for staggered cards
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  const fetchInsights = async (forceRefresh = false) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/insights${forceRefresh ? '?refresh=true' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          activities,
          profile: {
            location: profile?.location || 'unknown',
            householdSize: profile?.householdSize || 1,
            carType: profile?.carType || 'none',
            dietType: profile?.dietType || 'omnivore',
            displayName: profile?.displayName || 'User',
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || 'Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

   
  useEffect(() => {
    if (user) fetchInsights();
  }, [user, profile?.uid]);

  return (
    <div className="p-5 md:p-10 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <header
        ref={headerRef}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: 'var(--gradient-brand)', boxShadow: '0 4px 14px var(--accent-glow)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              AI Insights
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Personalised recommendations from Gemini AI based on your habits.
          </p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={loading}
          className="btn btn-glass px-5 py-2.5 text-sm gap-2 flex items-center"
        >
          <RefreshIcon spinning={loading} />
          {loading ? 'Generating…' : 'Refresh Insights'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Insight cards */}
        <div className="lg:col-span-2 space-y-6">

          {/* Error state */}
          {error && (
            <div className="glass-card border border-red-200/50" style={{ background: 'rgba(254,226,226,0.6)' }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-red-700 text-sm">Failed to generate insights</p>
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                  <button
                    onClick={() => fetchInsights()}
                    className="text-xs text-red-600 font-semibold mt-2 underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && <InsightsSkeleton />}

          {/* Empty state */}
          {!loading && insights.length === 0 && !error && (
            <div className="glass-card text-center py-12">
              <span className="text-5xl mb-4 block">🌱</span>
              <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                No insights yet
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto 20px' }}>
                Log some activities first, or click "Refresh Insights" to get personalised tips based on your profile.
              </p>
              <button
                onClick={() => fetchInsights(true)}
                className="btn btn-primary px-6 py-2.5 text-sm"
              >
                Generate Insights Now
              </button>
            </div>
          )}

          {/* Insight cards grid */}
          {!loading && insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {insights.map((insight, i) => (
                <div
                  key={insight.id}
                  style={{
                    animationDelay: `${i * 80}ms`,
                    animation: 'fade-up 0.5s cubic-bezier(0.4,0,0.2,1) both',
                  }}
                >
                  <InsightCard insight={insight} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Chat sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AIChat activities={activities} profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
