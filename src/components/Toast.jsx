import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={18} />,
    warning: <AlertTriangle className="text-amber-400" size={18} />,
    info: <Info className="text-indigo-400" size={18} />
  };

  const borders = {
    success: 'border-emerald-500/20 shadow-emerald-500/5',
    warning: 'border-amber-500/20 shadow-amber-500/5',
    info: 'border-indigo-500/20 shadow-indigo-500/5'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border glass-panel shadow-2xl animate-fade-in max-w-sm ${borders[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-100 leading-tight">
          {type === 'success' ? 'Calculated Successfully' : 'System Event'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
          {message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 rounded-b-xl overflow-hidden">
        <div 
          className={`h-full transition-all duration-4000 ease-linear ${
            type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
          style={{
            animation: 'shrinkWidth 4s linear forwards',
            width: '100%'
          }}
        />
      </div>

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
