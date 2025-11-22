import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-rose-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
          </div>
          <p className="text-sm text-slate-300 mb-6">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

