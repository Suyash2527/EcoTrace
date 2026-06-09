import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { InsightCard } from '../components/insights/InsightCard';
import { InsightsSkeleton } from '../components/insights/InsightsSkeleton';
import { AIChat } from '../components/insights/AIChat';
import { Insight } from '../types';
import { Button } from '../components/ui/Button';

export function Insights() {
  const { user, profile } = useAuth();
  const { activities } = useActivities(user?.uid);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ activities, profile })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile && activities.length >= 0) {
      fetchInsights();
    }
  }, [user, profile, activities.length]); // Re-fetch only when profile loads or activities count changes

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cream-100 mb-2">AI Insights</h1>
          <p className="text-forest-300">Personalized recommendations based on your habits.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => fetchInsights(true)} 
          isLoading={loading}
          disabled={loading}
        >
          Refresh Insights
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && <InsightsSkeleton />}
            {!loading && insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
            {!loading && insights.length === 0 && !error && (
              <div className="col-span-2 text-center py-12 bg-forest-800/50 rounded-2xl border border-forest-400/20">
                <span className="text-4xl mb-4 block">🌱</span>
                <p className="text-cream-200 font-medium">Log more activities to get personalized insights!</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  );
}
