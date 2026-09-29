import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E8ECF5] shadow-xl p-4 rounded-2xl flex items-start justify-between gap-3 animate-pop-in border-l-4 border-l-[#10B981]"
        >
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-lg bg-[#F0FDF4] text-[#10B981] mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-[#1A2340]">{toast.title}</span>
              <span className="text-[12px] text-[#6B7690]">{toast.message}</span>
            </div>
          </div>
          <button
            onClick={() => onClose(toast.id)}
            className="text-[#8C97B0] hover:text-[#1A2340] p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
