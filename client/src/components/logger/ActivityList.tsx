import React, { useState } from 'react';
import { Activity } from '../../types';
import { EMISSION_FACTORS } from '../../utils/emissionFactors';
import { formatCO2, formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';

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
      <div className="text-center py-10 bg-forest-900/50 rounded-2xl border border-forest-800">
        <p className="text-forest-400">No activities logged yet.</p>
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
        <h3 className="text-lg font-medium text-cream-100">Recent Activities</h3>
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
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex justify-between items-center animate-in">
          <span className="text-sm font-medium text-amber-400">{selectedIds.size} selected</span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            Delete Selected
          </Button>
        </div>
      )}

      {Object.entries(grouped).map(([date, dayActivities]) => (
        <div key={date} className="space-y-3">
          <h4 className="text-sm font-medium text-forest-300 uppercase tracking-wider sticky top-0 bg-forest-900/90 backdrop-blur py-2 z-10">
            {formatDate(date)}
          </h4>
          <div className="space-y-2">
            {dayActivities.map(activity => {
              const factor = EMISSION_FACTORS[activity.category]?.[activity.activityType];
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-center p-3 rounded-xl border transition-colors ${
                    selectedIds.has(activity.id) 
                      ? 'bg-forest-700/50 border-amber-400/50' 
                      : 'bg-forest-800 border-forest-600 hover:border-forest-400'
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
                        className="w-4 h-4 rounded bg-forest-900 border-forest-500 text-amber-400 focus:ring-amber-400"
                      />
                    </div>
                  )}
                  
                  <div className="w-10 h-10 rounded-full bg-forest-700 flex items-center justify-center text-xl mr-4 shrink-0">
                    {factor?.icon || '❓'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-cream-100 font-medium truncate">
                      {factor?.label || activity.activityType}
                    </p>
                    <p className="text-forest-300 text-sm">
                      {activity.quantity} {activity.unit}
                    </p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <span className="inline-block bg-forest-900 text-cream-200 px-2 py-1 rounded text-sm font-mono border border-forest-700">
                      {formatCO2(activity.co2Kg)}
                    </span>
                  </div>

                  {!isBulkMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}
                      className="ml-4 p-2 text-forest-400 hover:text-red-400 transition-colors focus:outline-none"
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
