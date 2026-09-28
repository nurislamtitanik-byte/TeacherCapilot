import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastMessage = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles =
    toast.type === 'success'
      ? 'bg-emerald-900/90 text-white border-emerald-700 shadow-emerald-900/20'
      : toast.type === 'error'
      ? 'bg-rose-900/90 text-white border-rose-700 shadow-rose-900/20'
      : 'bg-slate-900/90 text-white border-slate-700 shadow-slate-900/20';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgStyles}`}
      role="alert"
    >
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-sky-300 shrink-0" />}

      <span className="text-sm font-medium leading-tight flex-1">{toast.message}</span>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/60 hover:text-white transition-colors p-1 rounded-md"
        aria-label="Yopish"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
