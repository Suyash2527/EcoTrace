import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, deleteDoc, doc, query,
  orderBy, limit, onSnapshot, writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
    const co2Kg = calculateCO2(data.category, data.activityType, data.quantity);
    await addDoc(collection(db, 'users', userId, 'activities'), {
      ...data,
      userId,
      co2Kg,
      createdAt: serverTimestamp(),
    });
    return co2Kg;
  }, [userId]);

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
