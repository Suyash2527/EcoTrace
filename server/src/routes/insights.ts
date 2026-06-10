import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { generateInsights, streamChatResponse, predictActivityImpact, Activity, UserProfile } from '../services/gemini';
import { z } from 'zod';
import xss from 'xss';

export const insightsRouter = Router();

// Lenient profile schema — all fields optional, server fills defaults
const insightRequestSchema = z.object({
  activities: z.array(z.any()).max(500).default([]),
  profile: z.any().optional(),
});

const chatRequestSchema = z.object({
  message: z.string().max(1000),
  history: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).max(20).default([]),
  activities: z.array(z.any()).max(200).default([]),
  profile: z.any().optional().default({}),
});

const predictRequestSchema = z.object({
  activityType: z.string(),
  quantity: z.number().positive(),
  userHistory: z.array(z.any()).max(50).default([]),
});

insightsRouter.post('/insights', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = insightRequestSchema.parse(req.body);
    const profile: Partial<UserProfile> = {
      location: xss(body.profile?.location || 'unknown'),
      householdSize: body.profile?.householdSize || 1,
      carType: xss(body.profile?.carType || 'none'),
      dietType: xss(body.profile?.dietType || 'omnivore'),
      displayName: xss((body.profile as any)?.displayName || 'User'),
    };

    const insights = await generateInsights(body.activities as Activity[], profile);
    return res.json(insights);
  } catch (error: any) {
    console.error('[insights] error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate insights', detail: error?.message });
  }
});

insightsRouter.post('/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = chatRequestSchema.parse(req.body);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering on Cloud Run

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
  } catch (error: any) {
    console.error('[chat] error:', error?.message || error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Chat failed', detail: error?.message });
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
  } catch (error: any) {
    console.error('[predict] error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to predict impact', detail: error?.message });
  }
});
