import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { generateAnnualReport, Activity, UserProfile } from '../services/gemini';
import { z } from 'zod';
import xss from 'xss';

export const reportRouter = Router();

const reportRequestSchema = z.object({
  activities: z.array(z.any()).max(2000).default([]),
  profile: z.any().optional().default({}),
});

reportRouter.post('/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = reportRequestSchema.parse(req.body);
    const profile: Partial<UserProfile> = {
      location: xss(body.profile?.location || 'unknown'),
      householdSize: body.profile?.householdSize || 1,
      carType: xss(body.profile?.carType || 'none'),
      dietType: xss(body.profile?.dietType || 'omnivore'),
      displayName: xss((body.profile as any)?.displayName || 'User'),
    };

    const reportMarkdown = await generateAnnualReport(body.activities as Activity[], profile);
    return res.json({ markdown: reportMarkdown });
  } catch (error: unknown) {
    const e = error as Error;
    console.error('[report] error:', e?.message || e);
    return res.status(500).json({ error: 'Failed to generate annual report', detail: e?.message });
  }
});
