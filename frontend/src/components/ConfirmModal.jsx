import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  previewDetails = null
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isDestructive 
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
            {message}
          </div>
        </div>

        {/* Detailed Breakdown Preview (e.g. for fund transfers or loan payments) */}
        {previewDetails && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col gap-2">
            {Object.entries(previewDetails).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{key}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500'
                : 'bg-brand-600 hover:bg-brand-700 focus:ring-2 focus:ring-brand-500'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
