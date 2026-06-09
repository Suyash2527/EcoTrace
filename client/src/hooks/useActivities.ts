import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, deleteDoc, doc, query,
  orderBy, limit, onSnapshot, writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Activity, Category } from '../types';
import { calculateCO2 } from '../utils/emissionFactors';

export function useActivities(userId: string | undefined) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setActivities([]); setLoading(false); return; }

    const q = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('date', 'desc'),
      limit(200)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
      setActivities(data);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  const addActivity = useCallback(async (
    data: Omit<Activity, 'id' | 'co2Kg' | 'createdAt' | 'userId'>
  ) => {
    if (!userId) throw new Error('No user');
    
    // Fallback static calculation in case AI fails
    let co2Kg = calculateCO2(data.category, data.activityType, data.quantity);
    let comparison = '';
    let tip = '';

    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const res = await fetch('/api/analysis/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            activityType: data.activityType,
            quantity: data.quantity,
            userHistory: activities.slice(0, 10), // Only send recent history
          })
        });
        if (res.ok) {
          const aiData = await res.json();
          co2Kg = aiData.co2Kg;
          comparison = aiData.comparison;
          tip = aiData.tip;
        }
      }
    } catch (e) {
      console.error('AI prediction failed, falling back to static calculation', e);
    }

    await addDoc(collection(db, 'users', userId, 'activities'), {
      ...data,
      userId,
      co2Kg,
      createdAt: serverTimestamp(),
    });
    
    return { co2Kg, comparison, tip };
  }, [userId, activities]);

  const deleteActivity = useCallback(async (activityId: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'activities', activityId));
  }, [userId]);

  const deleteMany = useCallback(async (activityIds: string[]) => {
    if (!userId) return;
    const batch = writeBatch(db);
    activityIds.forEach(id => {
      batch.delete(doc(db, 'users', userId, 'activities', id));
    });
    await batch.commit();
  }, [userId]);

  const getByCategory = useCallback((category: Category) => {
    return activities.filter(a => a.category === category);
  }, [activities]);

  const getByDateRange = useCallback((startDate: string, endDate: string) => {
    return activities.filter(a => a.date >= startDate && a.date <= endDate);
  }, [activities]);

  return { activities, loading, addActivity, deleteActivity, deleteMany, getByCategory, getByDateRange };
}
