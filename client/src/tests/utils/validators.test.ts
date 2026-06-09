import { describe, it, expect } from 'vitest';
import { activitySchema, sanitize } from '../../utils/validators';

describe('validators.ts', () => {
  describe('activitySchema', () => {
    it('accepts valid complete activity', () => {
      const result = activitySchema.safeParse({
        category: 'transport',
        activityType: 'car_petrol',
        quantity: 10,
        unit: 'km',
        date: '2024-01-15'
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative quantity', () => {
      const result = activitySchema.safeParse({
        category: 'transport',
        activityType: 'car_petrol',
        quantity: -1,
        unit: 'km',
        date: '2024-01-15'
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing date', () => {
      const result = activitySchema.safeParse({
        category: 'transport',
        activityType: 'car_petrol',
        quantity: 10,
        unit: 'km'
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid category', () => {
      const result = activitySchema.safeParse({
        category: 'invalid',
        activityType: 'car_petrol',
        quantity: 10,
        unit: 'km',
        date: '2024-01-15'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('sanitize', () => {
    it('strips HTML tags', () => {
      expect(sanitize('<b>bold</b> text')).toBe('bold text');
    });

    it('strips script injection', () => {
      expect(sanitize('<script>alert("xss")</script>')).toBe('alert(xss)');
    });

    it('preserves plain text', () => {
      expect(sanitize('Hello world')).toBe('Hello world');
    });
  });
});
