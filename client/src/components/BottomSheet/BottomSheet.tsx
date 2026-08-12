import React from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop Click to Close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 max-h-[80vh] flex flex-col w-full animate-in slide-in-from-bottom duration-300">
        {/* Pull Handle */}
        <div className="w-full flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Optional Title Header */}
        {title && (
          <div className="px-5 py-2 flex items-center justify-between border-b border-slate-100 shrink-0">
            <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
