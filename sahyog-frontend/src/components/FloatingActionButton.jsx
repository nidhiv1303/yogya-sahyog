import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, FileUp, Bookmark, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SUB_ACTIONS = [
  { icon: <Bookmark size={16} />, label: 'My Schemes',      key: 'schemes', color: '#1a237e' },
  { icon: <FileUp size={16} />,   label: 'Upload Doc',       key: 'upload',  color: '#10b981' },
  { icon: <Mic size={16} />,      label: 'Voice Input',      key: 'voice',   color: '#8b5cf6' },
  { icon: <RefreshCw size={16} />, label: 'Refresh',         key: 'refresh', color: '#FF6F00' },
];

export default function FloatingActionButton({ onUpload, onVoice, onRefresh }) {
  const [open, setOpen] = useState(false);
  const { setSchemesDrawerOpen } = useApp();
  const fileRef = useRef(null);

  const handleAction = (key) => {
    setOpen(false);
    if (key === 'schemes') setSchemesDrawerOpen(true);
    if (key === 'upload')  fileRef.current?.click();
    if (key === 'voice')   onVoice?.();
    if (key === 'refresh') onRefresh?.();
  };

  // Arc positions (upward arc from bottom-right)
  const positions = [
    { x: -8,  y: -72  },
    { x: -56, y: -56  },
    { x: -72, y: -8   },
    { x: -48, y: -104 },
  ];

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => { if (e.target.files[0]) { onUpload?.(e.target.files[0]); e.target.value = ''; } }}
      />

      <div className="absolute bottom-20 right-4 z-40">
        {/* Sub buttons */}
        <AnimatePresence>
          {open && SUB_ACTIONS.map((action, i) => (
            <motion.div
              key={action.key}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: 1, x: positions[i].x, y: positions[i].y, scale: 1 }}
              exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300, delay: i * 0.05 }}
              className="absolute bottom-0 right-0"
            >
              <div className="relative group">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleAction(action.key)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${action.color}dd, ${action.color})`,
                    boxShadow: `0 4px 16px ${action.color}44`,
                  }}
                >
                  {action.icon}
                </motion.button>
                {/* Tooltip */}
                <span
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'rgba(26,35,126,0.9)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {action.label}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setOpen(o => !o)}
          className="btn-glow w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl relative z-10"
          style={{ width: 52, height: 52, borderRadius: '50%' }}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Sparkles size={20} />
        </motion.button>
      </div>

      {/* Backdrop to close on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
