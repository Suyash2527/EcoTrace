export type Category = 'transport' | 'food' | 'energy' | 'shopping' | 'travel';
export type Unit = 'km' | 'kg' | 'kWh' | 'litres' | 'count' | 'meal';

export interface Activity {
  id: string;
  userId: string;
  category: Category;
  activityType: string;
  quantity: number;
  unit: Unit;
  co2Kg: number;
  date: string;           // YYYY-MM-DD
  notes?: string;
  createdAt: string;      // Firestore Timestamp serialized
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  location: string;
  householdSize: number;
  carType: 'none' | 'electric' | 'hybrid' | 'petrol' | 'diesel';
  dietType: 'vegan' | 'vegetarian' | 'omnivore' | 'heavy-meat';
  onboardingComplete: boolean;
  createdAt: string;
  totalCO2Kg: number;     // denormalized for leaderboard
  weeklyGoalKg?: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  actionItems: string[];  // exactly 3
  category: Category;
  potentialSavingKg: number;
  difficulty: 'easy' | 'medium' | 'hard';
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalCO2Kg: number;
  rank: number;
}
