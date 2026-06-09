import React, { useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import { ActivityForm } from '../components/logger/ActivityForm';
import { ActivityList } from '../components/logger/ActivityList';
import { Toast } from '../components/ui/Toast';

import { useAuth } from '../hooks/useAuth';

export function LogActivity() {
  const { user } = useAuth();
  const { activities, addActivity, deleteActivity } = useActivities(user?.uid);
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error'}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await addActivity(data);
      addToast('Activity logged successfully!', 'success');
    } catch (err) {
      addToast('Failed to log activity. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id);
      addToast('Activity removed.', 'success');
    } catch (err) {
      addToast('Failed to remove activity.', 'error');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast id={t.id} message={t.message} type={t.type} onClose={removeToast} />
          </div>
        ))}
      </div>

      <header>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Log Activity</h1>
        <p className="text-[var(--text-muted)]">Record your actions to calculate their footprint.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <div className="glass-card p-6 sm:p-8">
            <ActivityForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <ActivityList activities={activities} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
