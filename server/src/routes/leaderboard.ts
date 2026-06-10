import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/firebaseAuth';
import { getFirestore } from 'firebase-admin/firestore';

export const leaderboardRouter = Router();

leaderboardRouter.get('/leaderboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getFirestore();
    // Query top 50 users ordered by totalCO2Kg ascending (lower = better)
    const snapshot = await db.collection('users')
      .where('onboardingComplete', '==', true)
      .orderBy('totalCO2Kg', 'asc')
      .limit(50)
      .get();

    const entries = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        uid: doc.id,
        displayName: data.displayName || 'Eco Warrior',
        photoURL: data.photoURL || null,
        totalCO2Kg: Number(data.totalCO2Kg) || 0,
        rank: index + 1,
        isCurrentUser: doc.id === req.user?.uid,
      };
    });

    return res.json(entries);
  } catch (error: any) {
    console.error('[leaderboard] error:', error?.message || error);
    // Return empty array gracefully — don't break UI
    return res.json([]);
  }
});
