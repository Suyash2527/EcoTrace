import { describe, it, expect } from 'vitest';
import { calculateCO2 } from '../../utils/emissionFactors';

describe('emissionFactors.ts', () => {
  it('calculates CO2 for transport correctly', () => {
    expect(calculateCO2('transport', 'car_petrol', 10)).toBe(1.7);
    expect(calculateCO2('transport', 'bicycle', 100)).toBe(0);
  });

  it('calculates CO2 for food correctly', () => {
    expect(calculateCO2('food', 'beef', 1)).toBe(27);
    expect(calculateCO2('food', 'beef', 0)).toBe(0);
  });

  it('calculates CO2 for energy correctly', () => {
    expect(calculateCO2('energy', 'electricity', 100)).toBe(23.3);
  });

  it('calculates CO2 for shopping correctly', () => {
    expect(calculateCO2('shopping', 'laptop', 1)).toBe(400);
  });

  it('returns 0 for unknown type', () => {
    expect(calculateCO2('transport', 'unknown_type', 10)).toBe(0);
  });

  it('handles negative or zero quantities', () => {
    expect(calculateCO2('food', 'chicken', -5)).toBe(0);
  });

  it('rounds to 3 decimal places', () => {
    expect(calculateCO2('transport', 'bus', 15.42)).toBe(1.372);
  });
});
