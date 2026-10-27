import React from 'react';

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full animate-pulse space-y-3">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded-md flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-36 mb-2"></div>
      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-20"></div>
    </div>
  );
}
