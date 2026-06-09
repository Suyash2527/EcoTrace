import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useCarbonCalc } from '../hooks/useCarbonCalc';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { EquivalenceWidget } from '../components/dashboard/EquivalenceWidget';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { DonutChart } from '../components/charts/DonutChart';
import { TrendLine } from '../components/charts/TrendLine';

export function Dashboard() {
  const { profile, user } = useAuth();
  const { activities, loading } = useActivities(user?.uid);
  const { weekTotal, monthTotal, byCategory, equivalences } = useCarbonCalc(activities);

  // Generate last 7 days trend data
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayTotal = activities
        .filter(a => a.date === dateStr)
        .reduce((sum, a) => sum + a.co2Kg, 0);
        
      data.push({ date: dateStr, co2Kg: dayTotal });
    }
    return data;
  }, [activities]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-forest-800 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-forest-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">
          Welcome back, {profile?.displayName?.split(' ')[0] || 'Eco Warrior'}
        </h1>
        <p className="text-forest-300">Here's your impact overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="This Month" 
          valueKg={monthTotal} 
          isHero 
        />
        <SummaryCard 
          title="This Week" 
          valueKg={weekTotal} 
        />
        <EquivalenceWidget 
          trees={equivalences.trees} 
          carKm={equivalences.carKm} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendLine data={trendData} />
        </div>
        <div>
          <CategoryBreakdown data={byCategory} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DonutChart data={byCategory} />
        {/* Placeholder for future insights widget or activity feed */}
        <div className="bg-forest-800 border border-forest-400/20 rounded-[20px] p-6 flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-3xl mb-4 text-amber-400">💡</div>
           <h3 className="text-cream-100 font-medium mb-2">Want to reduce this?</h3>
           <p className="text-forest-300 text-sm mb-4">Check out your AI-generated insights for personalized tips.</p>
           <a href="/insights" className="text-amber-400 hover:text-amber-300 text-sm font-medium">View Insights →</a>
        </div>
      </div>
    </div>
  );
}
