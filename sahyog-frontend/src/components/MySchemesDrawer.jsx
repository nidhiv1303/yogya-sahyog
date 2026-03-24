import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Star, StarOff, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SchemeModal from './SchemeModal';

const FILTERS = ['All', 'Eligible', 'Partial', 'Saved'];

function EmptyState({ onClose }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(26,35,126,0.06)' }}
      >
        <Bookmark size={28} style={{ color: '#1a237e', opacity: 0.4 }} />
      </motion.div>
      <h3 className="font-black text-base gradient-text mb-2">No schemes yet</h3>
      <p className="text-sm text-center leading-relaxed mb-6" style={{ color: '#64748b' }}>
        Start chatting with Yogya AI to discover government schemes you're eligible for.
      </p>
      <button onClick={onClose} className="btn-glow px-5 py-2.5 rounded-xl text-sm font-bold">
        Start Chatting →
      </button>
    </div>
  );
}

export default function MySchemesDrawer({ open, onClose }) {
  const { savedSchemes, removeScheme, addToast } = useApp();
  const [filter, setFilter] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const filtered = savedSchemes.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Eligible') return s.eligibility_met === true;
    if (filter === 'Partial') return s.eligibility_met === null;
    if (filter === 'Saved') return true;
    return true;
  });

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeScheme(id);
    addToast('Scheme removed', 'info');
  };

  return (
    <>
      {selectedScheme && (
        <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000]"
              style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 z-[1001] flex flex-col"
              style={{
                width: 'min(420px, 100vw)',
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(24px)',
                boxShadow: '-8px 0 48px rgba(26,35,126,0.12)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(26,35,126,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a237e, #FF6F00)' }}>
                    <Bookmark size={16} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <h2 className="font-black text-base gradient-text">Your Matched Schemes</h2>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{savedSchemes.length} saved</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: '#64748b' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ borderBottom: '1px solid rgba(26,35,126,0.06)' }}>
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                    style={filter === f ? {
                      background: 'linear-gradient(135deg, #1a237e, #FF6F00)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(26,35,126,0.2)',
                    } : {
                      background: 'rgba(26,35,126,0.06)',
                      color: '#1a237e',
                      border: '1px solid rgba(26,35,126,0.1)',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {filtered.length === 0 ? (
                  <EmptyState onClose={onClose} />
                ) : (
                  <div className="space-y-2">
                    {filtered.map((scheme, i) => (
                      <motion.div
                        key={scheme.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedScheme(scheme)}
                        className="card-3d p-4 rounded-2xl flex items-center gap-3"
                        style={{
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid rgba(255,255,255,0.9)',
                          boxShadow: '0 2px 12px rgba(26,35,126,0.06)',
                        }}
                      >
                        <span className="text-2xl flex-shrink-0">{scheme.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm gradient-text truncate">{scheme.name}</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: '#FF6F00' }}>{scheme.benefit}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(26,35,126,0.08)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${scheme.match_percentage}%`,
                                  background: scheme.match_percentage >= 75 ? '#16a34a' : scheme.match_percentage >= 50 ? '#d97706' : '#dc2626',
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-black" style={{ color: '#64748b' }}>{scheme.match_percentage}%</span>
                          </div>
                        </div>
                        <button
                          onClick={e => handleRemove(e, scheme.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          style={{ color: '#94a3b8' }}
                        >
                          <X size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
