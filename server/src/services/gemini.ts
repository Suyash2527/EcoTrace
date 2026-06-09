import { GoogleGenerativeAI } from '@google/generative-ai';

// Placeholder for Activity and UserProfile types used by the server
export interface Activity {
  id: string;
  userId: string;
  category: string;
  activityType: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  date: string;
}

export interface UserProfile {
  displayName?: string;
  location: string;
  householdSize: number;
  carType: string;
  dietType: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  actionItems: string[];
  category: string;
  potentialSavingKg: number;
  difficulty: 'easy' | 'medium' | 'hard';
  generatedAt: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function generateInsights(
  activities: Activity[],
  profile: Partial<UserProfile>
): Promise<Insight[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  
  const prompt = `You are an expert carbon footprint advisor. Analyze this user's activity data and generate exactly 5 personalized, actionable insights to reduce their carbon footprint.

User profile: location=${profile.location}, household=${profile.householdSize} people, diet=${profile.dietType}, car=${profile.carType}
Activities (last 30 days): ${JSON.stringify(activities.slice(0, 50))}

RESPOND ONLY WITH A VALID JSON ARRAY. No markdown. No explanation. No code fences.
Each object must have exactly these fields:
- id: string (uuid v4)
- title: string (max 60 chars, compelling action-oriented)
- description: string (1-2 sentences explaining the impact)
- actionItems: string[] (exactly 3 specific, measurable steps)
- category: "transport"|"food"|"energy"|"shopping"|"travel"
- potentialSavingKg: number (realistic monthly CO2 saving in kg)
- difficulty: "easy"|"medium"|"hard"
- generatedAt: string (current ISO timestamp)

Prioritize the highest-impact, most realistic changes for this specific user.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);
  
  if (!Array.isArray(parsed)) throw new Error('Invalid AI response format');
  return parsed.slice(0, 5);
}

export async function generateDeepAnalysis(
  activities: Activity[],
  profile: Partial<UserProfile>,
  question: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
  
  const systemContext = `You are EcoTrace's AI advisor, an expert in carbon footprint analysis. 
The user has logged ${activities.length} activities. Their biggest category by CO2 is 
${findTopCategory(activities)}. Total CO2 this month: ${sumCO2(activities).toFixed(1)}kg.
User location: ${profile.location}. Diet: ${profile.dietType}.
Activities summary: ${JSON.stringify(activities.slice(0, 30))}`;

  const result = await model.generateContent(`${systemContext}\n\nUser question: ${question}`);
  return result.response.text();
}

export async function* streamChatResponse(
  message: string,
  history: Array<{role: string; content: string}>,
  activities: Activity[],
  profile: Partial<UserProfile>
): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  
  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    systemInstruction: `You are EcoTrace, a friendly carbon footprint coach. 
You have access to the user's carbon data. Be specific, encouraging, and practical.
User's recent CO2: ${sumCO2(activities).toFixed(1)}kg this month.
Top emission source: ${findTopCategory(activities)}.
Give concise responses (2-4 sentences unless asked for more). Use data to back up suggestions.`,
  });
  
  const stream = await chat.sendMessageStream(message);
  for await (const chunk of stream.stream) {
    yield chunk.text();
  }
}

export async function predictActivityImpact(
  activityType: string,
  quantity: number,
  userHistory: Activity[]
): Promise<{ co2Kg: number; comparison: string; tip: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  
  const avgUserCO2 = sumCO2(userHistory) / Math.max(userHistory.length, 1);
  
  const prompt = `For a carbon footprint tracker: activity "${activityType}" at quantity ${quantity}.
User's average activity emits ${avgUserCO2.toFixed(2)}kg CO2.
Respond with ONLY JSON: {"co2Kg": number, "comparison": "one sentence comparing to typical", "tip": "one actionable reduction tip"}`;
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  const text = result.response.text().trim();
  return JSON.parse(text);
}

function findTopCategory(activities: Activity[]): string {
  const totals: Record<string, number> = {};
  activities.forEach(a => { totals[a.category] = (totals[a.category] ?? 0) + a.co2Kg; });
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';
}

function sumCO2(activities: Activity[]): number {
  const now = new Date();
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
  return activities
    .filter(a => new Date(a.date) >= monthAgo)
    .reduce((s, a) => s + a.co2Kg, 0);
}
