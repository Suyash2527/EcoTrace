import { describe, it, expect } from 'vitest';
import { formatCO2, formatDate } from '../../utils/formatters';

describe('formatters.ts', () => {
  describe('formatCO2', () => {
    it('formats less than 1kg as grams', () => {
      expect(formatCO2(0.4)).toBe('400 g');
    });

    it('formats kg correctly', () => {
      expect(formatCO2(1.5)).toBe('1.5 kg');
    });

    it('formats tonnes correctly', () => {
      expect(formatCO2(1500)).toBe('1.5 t');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      expect(formatDate('2024-01-15')).toMatch(/Jan 15, 2024|15 Jan 2024/);
    });
  });
});
