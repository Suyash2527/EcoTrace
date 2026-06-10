import { describe, it, expect } from 'vitest';
import { findTopCategory, sumCO2, buildActivitySummary, Activity } from '../services/gemini';

describe('gemini helpers', () => {
  const activities: Activity[] = [
    {
      id: '1',
      userId: 'u1',
      category: 'transport',
      activityType: 'car_petrol',
      quantity: 10,
      unit: 'km',
      co2Kg: 50,
      date: new Date().toISOString()
    },
    {
      id: '2',
      userId: 'u1',
      category: 'food',
      activityType: 'beef',
      quantity: 1,
      unit: 'kg',
      co2Kg: 27,
      date: new Date().toISOString()
    },
    {
      id: '3',
      userId: 'u1',
      category: 'transport',
      activityType: 'flight_short',
      quantity: 100,
      unit: 'km',
      co2Kg: 25,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 2 months ago
    }
  ];

  it('finds top category', () => {
    // transport = 50 + 25 = 75, food = 27
    expect(findTopCategory(activities)).toBe('transport');
    expect(findTopCategory([])).toBe('transport'); // default
  });

  it('sums CO2 for recent activities only', () => {
    // Only the first two are within the last month
    expect(sumCO2(activities)).toBe(77); 
  });

  it('builds activity summary', () => {
    const summary = buildActivitySummary(activities);
    expect(summary).toContain('Category totals: transport: 75.0kg, food: 27.0kg');
    expect(summary).toContain('car_petrol');
  });

  it('handles empty activities in summary', () => {
    expect(buildActivitySummary([])).toBe('No activities logged yet.');
  });
});
