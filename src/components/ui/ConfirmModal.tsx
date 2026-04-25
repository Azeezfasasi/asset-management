'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal(props: ConfirmModalProps) {
  const { isOpen, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel } = props;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  let btnClass = 'bg-red-600 hover:bg-red-700';
  if (variant === 'warning') btnClass = 'bg-amber-500 hover:bg-amber-600';
  if (variant === 'info') btnClass = 'bg-blue-600 hover:bg-blue-700';

  let iconClass = 'bg-red-100 text-red-600';
  if (variant === 'warning') iconClass = 'bg-amber-100 text-amber-600';
  if (variant === 'info') iconClass = 'bg-blue-100 text-blue-600';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onCancel} />
      <div className='relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'>
        <div className='flex items-start gap-4'>
          <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ' + iconClass}>
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
              <path d='M12 9v4' />
              <path d='M12 17h.01' />
            </svg>
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
            <p className='mt-1.5 text-sm leading-relaxed text-slate-500'>{message}</p>
          </div>
        </div>
        <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <button onClick={onCancel} className='rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'>
            {cancelLabel || 'Cancel'}
          </button>
          <button onClick={onConfirm} className={'rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ' + btnClass}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
