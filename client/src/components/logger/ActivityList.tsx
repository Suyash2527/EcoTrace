import React, { useState } from 'react';
import { Activity } from '../../types';
import { EMISSION_FACTORS } from '../../utils/emissionFactors';
import { formatCO2, formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { getIcon } from '../../utils/icons';

interface ActivityListProps {
  activities: Activity[];
  onDelete: (id: string) => Promise<void>;
  onDeleteMany?: (ids: string[]) => Promise<void>;
}

export function ActivityList({ activities, onDelete, onDeleteMany }: ActivityListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (onDeleteMany && selectedIds.size > 0) {
      if (confirm(`Delete ${selectedIds.size} activities?`)) {
        await onDeleteMany(Array.from(selectedIds));
        setSelectedIds(newSet => { newSet.clear(); return newSet; });
        setIsBulkMode(false);
      }
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-10 glass-card">
        <p className="text-[var(--text-muted)]">No activities logged yet.</p>
      </div>
    );
  }

  // Group by date
  const grouped = activities.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activities</h3>
        {onDeleteMany && activities.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              if (isBulkMode) setSelectedIds(new Set());
            }}
          >
            {isBulkMode ? 'Cancel' : 'Select'}
          </Button>
        )}
      </div>

      {isBulkMode && selectedIds.size > 0 && (
        <div className="bg-[var(--accent-dim)] border border-[var(--accent)] p-3 rounded-xl flex justify-between items-center animate-in shadow-sm">
          <span className="text-sm font-semibold text-[var(--accent)]">{selectedIds.size} selected</span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            Delete Selected
          </Button>
        </div>
      )}

      {Object.entries(grouped).map(([date, dayActivities]) => (
        <div key={date} className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider sticky top-0 bg-[var(--bg-base)]/90 backdrop-blur py-2 z-10">
            {formatDate(date)}
          </h4>
          <div className="space-y-2">
            {dayActivities.map(activity => {
              const factor = EMISSION_FACTORS[activity.category]?.[activity.activityType];
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-center p-3 rounded-xl border transition-all duration-200 ${
                    selectedIds.has(activity.id) 
                      ? 'bg-[var(--accent-dim)] border-[var(--accent)]' 
                      : 'bg-white/60 border-[var(--border-glass)] hover:bg-white/80 hover:shadow-sm'
                  }`}
                  onClick={() => isBulkMode && toggleSelect(activity.id)}
                  style={{ cursor: isBulkMode ? 'pointer' : 'default' }}
                >
                  {isBulkMode && (
                    <div className="mr-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(activity.id)}
                        onChange={() => toggleSelect(activity.id)}
                        className="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-glass)] focus:ring-[var(--accent)]"
                      />
                    </div>
                  )}
                  
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center mr-4 shrink-0">
                    <span className="w-5 h-5">{getIcon(activity.activityType, activity.category)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] font-semibold truncate">
                      {factor?.label || activity.activityType}
                    </p>
                    <p className="text-[var(--text-muted)] text-sm">
                      {activity.quantity} {activity.unit}
                    </p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <span className="inline-block bg-white text-[var(--text-primary)] px-2 py-1 rounded text-sm font-mono border border-[var(--border-glass)] shadow-sm">
                      {formatCO2(activity.co2Kg)}
                    </span>
                  </div>

                  {!isBulkMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                      aria-label={`Delete activity: ${factor?.label} ${activity.quantity}${activity.unit}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
