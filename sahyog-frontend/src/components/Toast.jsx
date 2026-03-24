import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICONS = {
  success: <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: '#16a34a' }} />,
  warning: <AlertTriangle size={16} className="flex-shrink-0" style={{ color: '#d97706' }} />,
  info:    <Info size={16} className="flex-shrink-0" style={{ color: '#2563eb' }} />,
  error:   <XCircle size={16} className="flex-shrink-0" style={{ color: '#dc2626' }} />,
};

const COLORS = {
  success: '#16a34a',
  warning: '#d97706',
  info:    '#2563eb',
  error:   '#dc2626',
};

function ToastItem({ toast, onRemove }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderLeft: `4px solid ${COLORS[toast.type]}`,
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(26,35,126,0.12)',
        minWidth: '280px',
        maxWidth: '360px',
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {ICONS[toast.type]}
        <p className="flex-1 text-sm font-medium" style={{ color: '#1e293b', lineHeight: 1.4 }}>
          {toast.message}
        </p>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-1 p-0.5 rounded-full transition-colors hover:bg-black/5"
          style={{ color: '#94a3b8' }}
        >
          <X size={13} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <div
          className="h-full transition-none"
          style={{
            width: `${progress}%`,
            background: COLORS[toast.type],
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div
      className="fixed top-[70px] right-4 z-[99990] flex flex-col gap-2"
      style={{ pointerEvents: 'none' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
