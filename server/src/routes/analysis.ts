import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { generateDeepAnalysis, Activity, UserProfile } from '../services/gemini';
import { z } from 'zod';
import xss from 'xss';

export const analysisRouter = Router();

const analysisRequestSchema = z.object({
  question: z.string().max(500).optional().default('Give me a comprehensive deep analysis of my carbon footprint, including key patterns, comparisons to averages, and a personalised action plan.'),
  activities: z.array(z.any()).max(500).default([]),
  profile: z.any().optional().default({}),
});

const predictRequestSchema = z.object({
  activityType: z.string().min(1).max(100),
  quantity: z.number().positive(),
  userHistory: z.array(z.any()).max(100).default([]),
});

analysisRouter.post('/analysis/deep', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = analysisRequestSchema.parse(req.body);
    const answer = await generateDeepAnalysis(
      body.activities as Activity[],
      body.profile as Partial<UserProfile>,
      xss(body.question)
    );
    return res.json({ result: answer });
  } catch (error: any) {
    console.error('[analysis/deep] error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate analysis', detail: error?.message });
  }
});

analysisRouter.post('/analysis/predict', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = predictRequestSchema.parse(req.body);
    const { predictActivityImpact } = await import('../services/gemini');
    const result = await predictActivityImpact(
      xss(body.activityType),
      body.quantity,
      body.userHistory as Activity[]
    );
    return res.json(result);
  } catch (error: any) {
    console.error('[analysis/predict] error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to predict activity impact', detail: error?.message });
  }
});
