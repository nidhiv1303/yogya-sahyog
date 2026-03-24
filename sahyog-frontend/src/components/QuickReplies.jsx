import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const STAGE_CHIPS = {
  0: [
    'I am a farmer 🌾',
    'I am a student 🎓',
    'I need health help 🏥',
    'I need housing 🏠',
    'I run a business 💼',
    'I need a job 💻',
  ],
  1: [
    'Tell me eligible schemes',
    'What documents are needed?',
    'How do I apply?',
    'Is there any deadline?',
  ],
  2: [
    'Show me more schemes',
    'What are the full benefits?',
    'Find schemes in my state',
    'Explain eligibility criteria',
  ],
};

export default function QuickReplies({ onSend }) {
  const { messages, categoryProfile } = useApp();

  // Determine stage
  const hasSchemes = messages.some(m => m.schemes && m.schemes.length > 0);
  const hasCategory = !!categoryProfile.need;
  const stage = hasSchemes ? 2 : hasCategory ? 1 : 0;
  const chips = STAGE_CHIPS[stage];

  const handleChip = (text) => {
    onSend(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.25 }}
      className="flex gap-2 overflow-x-auto pb-1 mt-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {chips.map((chip, i) => (
        <motion.button
          key={chip}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => handleChip(chip)}
          className="flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1.5px solid rgba(26,35,126,0.15)',
            color: '#1a237e',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,111,0,0.5)';
            e.currentTarget.style.background = 'rgba(255,111,0,0.06)';
            e.currentTarget.style.color = '#FF6F00';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(26,35,126,0.15)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
            e.currentTarget.style.color = '#1a237e';
          }}
        >
          {chip}
        </motion.button>
      ))}
    </motion.div>
  );
}
