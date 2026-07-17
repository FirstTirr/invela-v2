import React from 'react';

export default function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="h-8 bg-surface-container rounded-md w-1/4 mb-4" />
      
      {/* Table Box Skeleton */}
      <div className="bg-white border border-surface-container-high rounded-lg overflow-hidden">
        <div className="h-12 bg-surface-low border-b border-surface-container-high" />
        <div className="divide-y divide-surface-container p-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-4 bg-surface-container rounded w-1/3" />
              <div className="h-4 bg-surface-container rounded w-1/4" />
              <div className="h-4 bg-surface-container rounded w-1/12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}