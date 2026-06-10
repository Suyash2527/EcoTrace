import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Use gemini-2.5-flash since the user is on the paid tier with ample credits
const FLASH_MODEL = 'gemini-2.5-flash';
const PRO_MODEL   = 'gemini-2.5-flash';

function safeProfile(profile: Partial<UserProfile>) {
  return {
    location: profile.location || 'unknown',
    householdSize: profile.householdSize || 1,
    carType: profile.carType || 'none',
    dietType: profile.dietType || 'omnivore',
    displayName: profile.displayName || 'User',
  };
}

function findTopCategory(activities: Activity[]): string {
  const totals: Record<string, number> = {};
  activities.forEach(a => { totals[a.category] = (totals[a.category] ?? 0) + a.co2Kg; });
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'transport';
}

function sumCO2(activities: Activity[]): number {
  const now = new Date();
  const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
  return activities
    .filter(a => new Date(a.date) >= monthAgo)
    .reduce((s, a) => s + a.co2Kg, 0);
}

function buildActivitySummary(activities: Activity[]): string {
  if (activities.length === 0) return 'No activities logged yet.';
  
  // Group by category and sum
  const byCat: Record<string, number> = {};
  activities.slice(0, 100).forEach(a => {
    byCat[a.category] = (byCat[a.category] ?? 0) + a.co2Kg;
  });
  
  const summary = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, kg]) => `${cat}: ${kg.toFixed(1)}kg`)
    .join(', ');
  
  const recent = activities.slice(0, 20).map(a =>
    `${a.date} ${a.activityType} ${a.quantity}${a.unit} = ${a.co2Kg}kg CO₂`
  ).join('\n');

  return `Category totals: ${summary}\n\nRecent activities:\n${recent}`;
}

// ── Insights ──────────────────────────────────────────────────────────────
export async function generateInsights(
  activities: Activity[],
  profile: Partial<UserProfile>
): Promise<Insight[]> {
  const model = genAI.getGenerativeModel({ model: FLASH_MODEL });
  const p = safeProfile(profile);
  const monthlyTotal = sumCO2(activities).toFixed(1);
  const topCat = findTopCategory(activities);
  
  const prompt = `You are an expert carbon footprint advisor for the EcoTrace app. Analyze this user's data and generate exactly 5 personalized, actionable insights to reduce their carbon footprint.

USER PROFILE:
- Name: ${p.displayName}
- Location: ${p.location}
- Household size: ${p.householdSize} people
- Car type: ${p.carType}
- Diet type: ${p.dietType}

CARBON DATA (this month: ${monthlyTotal}kg CO₂, top category: ${topCat}):
${buildActivitySummary(activities)}

INSTRUCTIONS:
- Focus on highest-impact, realistic changes for THIS specific user
- If no activities, give general advice based on profile
- Make action items specific and measurable

RESPOND ONLY WITH A VALID JSON ARRAY. No markdown fences, no explanation, no extra text.
Each object must have EXACTLY these fields:
{
  "id": "unique-string-1",
  "title": "Short compelling title (max 60 chars)",
  "description": "1-2 sentences explaining the impact clearly",
  "actionItems": ["step 1", "step 2", "step 3"],
  "category": "transport"|"food"|"energy"|"shopping"|"travel",
  "potentialSavingKg": 12.5,
  "difficulty": "easy"|"medium"|"hard",
  "generatedAt": "${new Date().toISOString()}"
}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  
  // Strip markdown fences if model ignores instructions
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  
  // Extract JSON array even if there's surrounding text
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in response');
  
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed)) throw new Error('Invalid AI response format');
  
  return parsed.slice(0, 5).map((item: any, i: number) => ({
    id: item.id || `insight-${i}`,
    title: item.title || 'Carbon Reduction Tip',
    description: item.description || '',
    actionItems: Array.isArray(item.actionItems) ? item.actionItems.slice(0, 3) : [],
    category: item.category || 'transport',
    potentialSavingKg: Number(item.potentialSavingKg) || 5,
    difficulty: item.difficulty || 'medium',
    generatedAt: item.generatedAt || new Date().toISOString(),
  }));
}

// ── Deep Analysis ─────────────────────────────────────────────────────────
export async function generateDeepAnalysis(
  activities: Activity[],
  profile: Partial<UserProfile>,
  question: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: PRO_MODEL });
  const p = safeProfile(profile);
  const monthlyTotal = sumCO2(activities).toFixed(1);
  const topCat = findTopCategory(activities);

  const systemContext = `You are EcoTrace's expert AI advisor specializing in carbon footprint analysis.

USER: ${p.displayName}, ${p.location}, household of ${p.householdSize}, ${p.dietType} diet, drives ${p.carType}.
This month: ${monthlyTotal}kg CO₂. Top emission source: ${topCat}. Total logged activities: ${activities.length}.

ACTIVITY DATA:
${buildActivitySummary(activities)}

Provide a thorough, structured analysis with:
1. Current Impact Assessment
2. Top 3 Problem Areas with specific numbers
3. Comparison to global/regional averages
4. 5-7 Concrete Action Plan (ranked by impact)
5. 3-month Projection if actions are taken
6. Encouraging closing statement

Use markdown formatting with ## headers, bullet points, and **bold** for key figures. Be specific with numbers.`;

  const result = await model.generateContent(`${systemContext}\n\nUser question: ${question}`);
  return result.response.text();
}

// ── Streaming Chat ────────────────────────────────────────────────────────
export async function* streamChatResponse(
  message: string,
  history: Array<{role: string; content: string}>,
  activities: Activity[],
  profile: Partial<UserProfile>
): AsyncGenerator<string> {
  const p = safeProfile(profile);
  const monthlyTotal = sumCO2(activities).toFixed(1);
  const topCat = findTopCategory(activities);

  const systemInstructionStr = `You are EcoTrace AI, a friendly and knowledgeable carbon footprint coach.

User: ${p.displayName}, ${p.location}, ${p.dietType} diet, drives ${p.carType}, household of ${p.householdSize}.
This month: ${monthlyTotal}kg CO₂. Top source: ${topCat}.

Recent activity data:
${buildActivitySummary(activities)}

Guidelines:
- Be encouraging, specific, and practical
- Use the user's actual data when relevant
- Give concise responses (2-4 sentences unless they ask for more)
- Back up suggestions with numbers from their data
- If they have no data, give personalized advice based on their profile`;

  const model = genAI.getGenerativeModel({ 
    model: FLASH_MODEL,
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstructionStr }]
    }
  });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
  });

  const stream = await chat.sendMessageStream(message);
  for await (const chunk of stream.stream) {
    yield chunk.text();
  }
}

// ── Activity Impact Prediction ────────────────────────────────────────────
export async function predictActivityImpact(
  activityType: string,
  quantity: number,
  userHistory: Activity[]
): Promise<{ co2Kg: number; comparison: string; tip: string }> {
  const model = genAI.getGenerativeModel({
    model: FLASH_MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const avgUserCO2 = userHistory.length > 0
    ? (userHistory.reduce((s, a) => s + a.co2Kg, 0) / userHistory.length)
    : 2;

  const prompt = `Carbon footprint tracker prediction.
Activity: "${activityType}" with quantity ${quantity}.
User's average activity CO₂: ${avgUserCO2.toFixed(2)}kg.

Return ONLY JSON (no markdown):
{"co2Kg": <number>, "comparison": "<one sentence vs typical>", "tip": "<one actionable reduction tip>"}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  
  try {
    return JSON.parse(text);
  } catch {
    // Fallback
    return { co2Kg: quantity * 0.1, comparison: 'Similar to average', tip: 'Consider lower-emission alternatives.' };
  }
}

// ── Annual Report Calculator ──────────────────────────────────────────────
export async function generateAnnualReport(
  activities: Activity[],
  profile: Partial<UserProfile>
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: PRO_MODEL });
  const p = safeProfile(profile);
  
  // Aggregate data specifically for the year
  const totalCo2 = activities.reduce((s, a) => s + a.co2Kg, 0).toFixed(1);
  const byCat: Record<string, number> = {};
  activities.forEach(a => { byCat[a.category] = (byCat[a.category] ?? 0) + a.co2Kg; });
  const categoryBreakdown = Object.entries(byCat).map(([c, kg]) => `- **${c}**: ${kg.toFixed(1)}kg CO₂`).join('\n');

  const systemContext = `You are EcoTrace's AI Sustainability Auditor. Generate a comprehensive Annual Carbon Footprint Report.
USER: ${p.displayName}, Location: ${p.location}, Household: ${p.householdSize}, Diet: ${p.dietType}, Car: ${p.carType}.
TOTAL RECORDED EMISSIONS THIS YEAR: ${totalCo2}kg CO₂.
Total logged activities: ${activities.length}.

CATEGORY BREAKDOWN:
${categoryBreakdown}

Generate a beautiful, engaging markdown report with the following structure:
# 🌍 ${p.displayName}'s Annual EcoReport

## 📊 Year in Review
A paragraph summarizing their total impact, comparing ${totalCo2}kg to regional/global averages for their location (${p.location}).

## 🏆 Top Achievements
Identify 2 positive patterns in their profile or data (e.g., lower than average food emissions due to diet, or lots of logged eco-friendly actions). Make it encouraging.

## ⚠️ Areas for Improvement
Highlight the top 2 emission sources. Be specific with the numbers provided.

## 🔮 Predictive Forecast
Based on the user's current data and habits, visualize their current scenario and predict their total carbon footprint generation over the next 12 months if they maintain their current trajectory. Provide a concrete estimated number in kg CO₂. Use a simple markdown table or visual text representation to show the projected emissions per quarter or month.

## 🎯 Next Year's Roadmap
Provide exactly 3 high-impact, realistic goals for them to adopt next year based on their specific profile and highest emission categories, aiming to reduce the projected forecast.

Use emojis, bold text, and standard markdown. Do not include any JSON or code blocks.`;

  const result = await model.generateContent(systemContext);
  return result.response.text();
}
