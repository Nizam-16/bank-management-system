import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are currently no items matching your criteria or active filters.',
  icon: Icon = Inbox,
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 my-6">
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-brand-600 dark:text-brand-400 mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-950/20">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h4>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-brand-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
