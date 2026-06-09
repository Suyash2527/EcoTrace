import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCarbonCalc } from '../../hooks/useCarbonCalc';
import { Activity } from '../../types';

describe('useCarbonCalc', () => {
  const mockActivities: Activity[] = [
    {
      id: '1', userId: 'user1', category: 'transport', activityType: 'car_petrol',
      quantity: 10, unit: 'km', co2Kg: 2.1, date: new Date().toISOString().split('T')[0], createdAt: ''
    },
    {
      id: '2', userId: 'user1', category: 'food', activityType: 'beef',
      quantity: 1, unit: 'kg', co2Kg: 27, date: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0], createdAt: ''
    }
  ];

  it('calculates week total correctly', () => {
    const { result } = renderHook(() => useCarbonCalc(mockActivities));
    expect(result.current.weekTotal).toBe(2.1);
  });

  it('calculates month total correctly', () => {
    const { result } = renderHook(() => useCarbonCalc(mockActivities));
    expect(result.current.monthTotal).toBe(29.1);
  });

  it('calculates byCategory correctly', () => {
    const { result } = renderHook(() => useCarbonCalc(mockActivities));
    expect(result.current.byCategory).toEqual({
      transport: 2.1,
      food: 27
    });
  });

  it('calculates equivalences correctly', () => {
    const { result } = renderHook(() => useCarbonCalc(mockActivities));
    expect(result.current.equivalences.trees).toBe(1); // Math.round(29.1 / 21)
    expect(result.current.equivalences.carKm).toBe(139); // Math.round(29.1 / 0.21)
  });
});
