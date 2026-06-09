import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { generateInsights, streamChatResponse, predictActivityImpact, Activity, UserProfile } from '../services/gemini';
import { z } from 'zod';
import xss from 'xss'; // Using xss library to sanitize strings

export const insightsRouter = Router();

const insightRequestSchema = z.object({
  activities: z.array(z.any()).max(100),
  profile: z.object({
    location: z.string(),
    householdSize: z.number(),
    carType: z.string().optional(),
    dietType: z.string(),
  }),
});

const chatRequestSchema = z.object({
  message: z.string().max(500),
  history: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).max(20),
  activities: z.array(z.any()).max(50),
  profile: z.any(),
});

const predictRequestSchema = z.object({
  activityType: z.string(),
  quantity: z.number().positive(),
  userHistory: z.array(z.any()).max(50),
});

insightsRouter.post('/insights', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = insightRequestSchema.parse(req.body);
    const profile = {
      location: xss(body.profile.location),
      householdSize: body.profile.householdSize,
      carType: xss(body.profile.carType || 'none'),
      dietType: xss(body.profile.dietType),
    } as Partial<UserProfile>;
    
    const insights = await generateInsights(body.activities as Activity[], profile);
    return res.json(insights);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to generate insights' });
  }
});

insightsRouter.post('/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = chatRequestSchema.parse(req.body);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = streamChatResponse(
      xss(body.message),
      body.history.map(h => ({ role: xss(h.role), content: xss(h.content) })),
      body.activities as Activity[],
      body.profile as Partial<UserProfile>
    );

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(400).json({ error: 'Chat failed' });
    }
    res.end();
  }
});

insightsRouter.post('/predict', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = predictRequestSchema.parse(req.body);
    const prediction = await predictActivityImpact(
      xss(body.activityType),
      body.quantity,
      body.userHistory as Activity[]
    );
    return res.json(prediction);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to predict impact' });
  }
});
