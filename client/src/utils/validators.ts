import { z } from 'zod';

export const activitySchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'travel']),
  activityType: z.string().min(1).max(50),
  quantity: z.number().positive().max(100000),
  unit: z.enum(['km', 'kg', 'kWh', 'litres', 'count', 'meal']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(200).optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(1).max(50),
  location: z.string().min(1).max(100),
  householdSize: z.number().int().min(1).max(20),
  carType: z.enum(['none', 'electric', 'hybrid', 'petrol', 'diesel']),
  dietType: z.enum(['vegan', 'vegetarian', 'omnivore', 'heavy-meat']),
  weeklyGoalKg: z.number().positive().max(1000).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).max(20),
});

export const insightRequestSchema = z.object({
  activities: z.array(z.object({
    category: z.string(),
    activityType: z.string(),
    quantity: z.number(),
    co2Kg: z.number(),
    date: z.string(),
  })).max(100),
  profile: z.object({
    location: z.string(),
    householdSize: z.number(),
    dietType: z.string(),
    weeklyGoalKg: z.number().optional(),
  }),
});

export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim();
}
