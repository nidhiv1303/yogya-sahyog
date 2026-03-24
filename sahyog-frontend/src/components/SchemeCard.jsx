import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SchemeModal from './SchemeModal';

function MatchBar({ pct }) {
  const color = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] font-semibold" style={{ color: '#64748b', minWidth: 72 }}>Profile Match</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(26,35,126,0.08)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      <span className="text-[10px] font-black" style={{ color, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export default function SchemeCard({ scheme, index = 0 }) {
  const { saveScheme, removeScheme, savedSchemes, addToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const isSaved = savedSchemes.some(s => s.id === scheme.id);

  const handleSave = (e) => {
    e.stopPropagation();
    if (isSaved) {
      removeScheme(scheme.id);
      addToast('Scheme removed from saved list', 'info');
    } else {
      saveScheme(scheme);
      addToast(`${scheme.name} saved! 📋`, 'success');
    }
  };

  const eligibilityColor = scheme.eligibility_met === true ? '#16a34a'
    : scheme.eligibility_met === false ? '#dc2626' : '#d97706';
  const eligibilityLabel = scheme.eligibility_met === true ? '✅ You likely qualify'
    : scheme.eligibility_met === false ? '⚠️ Partial match'
    : '🔍 Check eligibility';

  return (
    <>
      {modalOpen && <SchemeModal scheme={scheme} onClose={() => setModalOpen(false)} />}

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200, delay: index * 0.1 }}
        className="card-3d rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 4px 20px rgba(26,35,126,0.07)',
          borderLeft: '4px solid transparent',
          borderImage: 'linear-gradient(180deg, #1a237e, #FF6F00) 1',
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">{scheme.emoji}</span>
              <div className="min-w-0">
                <h4 className="font-black text-sm gradient-text truncate">{scheme.name}</h4>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(26,35,126,0.07)', color: '#475569' }}
              >
                {scheme.ministry}
              </span>
              <button onClick={handleSave} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                {isSaved
                  ? <BookmarkCheck size={14} style={{ color: '#FF6F00' }} />
                  : <Bookmark size={14} style={{ color: '#94a3b8' }} />
                }
              </button>
            </div>
          </div>

          {/* Benefit amount */}
          <p className="font-black text-xl mb-1" style={{ color: '#FF6F00' }}>{scheme.benefit}</p>
          <p className="text-xs mb-2 leading-relaxed" style={{ color: '#64748b' }}>{scheme.description}</p>

          {/* Match bar */}
          <MatchBar pct={scheme.match_percentage} />

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {scheme.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(26,35,126,0.06)', color: '#1a237e', border: '1px solid rgba(26,35,126,0.1)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: i === 0 ? '#1a237e' : i === 1 ? '#FF6F00' : '#10b981' }} />
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(26,35,126,0.06)' }}>
            <span className="text-xs font-semibold" style={{ color: eligibilityColor }}>
              {eligibilityLabel}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  border: '1.5px solid rgba(26,35,126,0.2)',
                  color: '#1a237e',
                  background: 'transparent',
                }}
              >
                Learn More
              </button>
              <a
                href={scheme.official_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                onClick={e => !scheme.official_url && e.preventDefault()}
              >
                Apply <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
