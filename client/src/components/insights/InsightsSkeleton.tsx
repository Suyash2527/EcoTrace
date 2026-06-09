import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export function InsightsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} isInsight className="h-full">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />
          
          <div className="bg-forest-900/50 rounded-lg p-4 mb-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
          </div>
          
          <div className="mt-auto flex items-center justify-between border-t border-forest-400/10 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </Card>
      ))}
    </>
  );
}
