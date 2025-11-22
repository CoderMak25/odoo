import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-sky-400" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info: 'bg-sky-500/10 border-sky-500/20',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium text-slate-200">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-2 rounded-md p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

