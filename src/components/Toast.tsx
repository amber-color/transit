import { useEffect } from 'react';
import type { Toast as ToastType } from '../types';

interface Props {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgClass =
    toast.type === 'error'
      ? 'bg-red-600'
      : toast.type === 'success'
      ? 'bg-green-600'
      : 'bg-gray-700';

  return (
    <div
      className={`${bgClass} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-64 max-w-sm`}
    >
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/70 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
