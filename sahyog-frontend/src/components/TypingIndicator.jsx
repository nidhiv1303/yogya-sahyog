import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Searching 650+ government schemes...',
  'Checking your eligibility...',
  'Analyzing your profile...',
  'Finding the best matches...',
  'Almost ready...',
];

export default function TypingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 1600);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1, 95));
    }, 60);

    return () => { clearInterval(cycle); clearInterval(progressInterval); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-3 mb-4"
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md mt-0.5"
        style={{
          background: 'linear-gradient(135deg, #1a237e, #4f46e5)',
          boxShadow: '0 2px 12px rgba(79,70,229,0.35)',
        }}
      >
        <span className="text-white font-bold text-xs">य</span>
      </div>

      {/* Bubble */}
      <div className="glass-bubble px-4 py-3 min-w-[200px] max-w-[280px]">
        {/* Cycling message */}
        <div className="h-4 mb-2 overflow-hidden">
          <AnimatePresence mode="wait">
            {visible && (
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-medium"
                style={{ color: '#1a237e' }}
              >
                {MESSAGES[msgIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(26,35,126,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #1a237e, #FF6F00)',
              transition: 'width 0.06s linear',
            }}
          />
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 items-center">
          <span className="typing-dot" style={{ background: '#1a237e' }} />
          <span className="typing-dot" style={{ background: '#1a237e' }} />
          <span className="typing-dot" style={{ background: '#1a237e' }} />
        </div>
      </div>
    </motion.div>
  );
}
