import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { generateDeepAnalysis, Activity, UserProfile } from '../services/gemini';
import { z } from 'zod';
import xss from 'xss';

export const analysisRouter = Router();

const analysisRequestSchema = z.object({
  question: z.string().max(500).optional().default('Give me a deep analysis of my carbon footprint.'),
  activities: z.array(z.any()).max(100),
  profile: z.any(),
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
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to generate analysis' });
  }
});
const predictRequestSchema = z.object({
  activityType: z.string().min(1).max(100),
  quantity: z.number().positive(),
  userHistory: z.array(z.any()).max(100).default([]),
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
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to predict activity impact' });
  }
});
