import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { generatePDFBuffer } from '../services/pdfExport';
import { Activity, UserProfile } from '../services/gemini';
import { z } from 'zod';

export const exportRouter = Router();

const exportRequestSchema = z.object({
  activities: z.array(z.any()),
  profile: z.any(),
});

exportRouter.post('/export/pdf', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = exportRequestSchema.parse(req.body);
    if (!req.user?.uid) return res.status(401).json({ error: 'Unauthorized' });

    const pdfBuffer = await generatePDFBuffer(
      req.user.uid,
      body.profile as UserProfile,
      body.activities as Activity[]
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    return res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
