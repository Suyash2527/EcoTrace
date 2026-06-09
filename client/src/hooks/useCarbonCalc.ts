import { useMemo } from 'react';
import { Activity } from '../types';

export function useCarbonCalc(activities: Activity[]) {
  const weekTotal = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return activities
      .filter(a => new Date(a.date) >= weekAgo)
      .reduce((sum, a) => sum + a.co2Kg, 0);
  }, [activities]);

  const monthTotal = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);
    return activities
      .filter(a => new Date(a.date) >= monthAgo)
      .reduce((sum, a) => sum + a.co2Kg, 0);
  }, [activities]);

  const yearTotal = useMemo(() => {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setDate(now.getDate() - 365);
    return activities
      .filter(a => new Date(a.date) >= yearAgo)
      .reduce((sum, a) => sum + a.co2Kg, 0);
  }, [activities]);

  const byCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    activities.forEach(a => {
      totals[a.category] = (totals[a.category] || 0) + a.co2Kg;
    });
    return totals;
  }, [activities]);

  const equivalences = useMemo(() => {
    return {
      trees: Math.round(yearTotal / 21), // 21kg CO2 per tree per year
      carKm: Math.round(yearTotal / 0.21) // 0.21kg per km for average petrol car
    };
  }, [yearTotal]);

  const last7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dailySum = activities
        .filter(a => a.date === dateStr)
        .reduce((sum, a) => sum + a.co2Kg, 0);
      days.push({ date: dateStr, co2Kg: dailySum });
    }
    return days;
  }, [activities]);

  return { weekTotal, monthTotal, yearTotal, byCategory, equivalences, last7Days };
}
