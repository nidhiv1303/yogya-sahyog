import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

function StatItem({ icon, value, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all hover:bg-white/40"
      style={{ color: '#475569' }}
    >
      <span className="text-sm">{icon}</span>
      <span className="font-black text-sm gradient-text">{value}</span>
      <span className="text-xs font-medium hidden sm:block" style={{ color: '#94a3b8' }}>{label}</span>
    </motion.button>
  );
}

export default function StatsBar({ onSchemesClick, onDocsClick }) {
  const { matchedCount, docsCount } = useApp();

  return (
    <div
      className="flex items-center justify-center gap-1 flex-shrink-0"
      style={{
        height: 36,
        background: 'rgba(26,35,126,0.03)',
        borderBottom: '1px solid rgba(26,35,126,0.06)',
      }}
    >
      <StatItem icon="📊" value="650+" label="Schemes" />
      <div className="w-px h-4" style={{ background: 'rgba(26,35,126,0.1)' }} />
      <StatItem
        icon="🎯"
        value={matchedCount || '0'}
        label="Matched"
        onClick={matchedCount > 0 ? onSchemesClick : undefined}
      />
      <div className="w-px h-4" style={{ background: 'rgba(26,35,126,0.1)' }} />
      <StatItem
        icon="📄"
        value={docsCount}
        label="Docs"
        onClick={onDocsClick}
      />
    </div>
  );
}
