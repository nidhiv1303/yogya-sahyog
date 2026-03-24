import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeAnimation({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'out'

  useEffect(() => {
    // Fill progress bar over 1.4s
    const start = Date.now();
    const duration = 1400;
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => setPhase('out'), 200);
        setTimeout(onDone, 700);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0B1340 0%, #1a237e 60%, #0d1257 100%)' }}
        >
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,111,0,0.15) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #FF6F00, #EAB308)',
              boxShadow: '0 0 60px rgba(255,111,0,0.4)',
            }}
          >
            <span className="text-white font-black text-5xl">य</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-black text-white mb-2">Yogya</h1>
            <p className="text-blue-300 text-sm font-medium tracking-wider">
              Finding your schemes...
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 240 }}
            transition={{ delay: 0.4 }}
            className="rounded-full overflow-hidden"
            style={{ height: 4, background: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF6F00, #EAB308)',
                transition: 'width 0.016s linear',
                boxShadow: '0 0 8px rgba(255,111,0,0.6)',
              }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-400 text-xs mt-3 font-medium"
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
