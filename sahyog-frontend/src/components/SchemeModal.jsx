import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Circle, FileText, ExternalLink, Copy, Phone, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SchemeModal({ scheme, onClose }) {
  const { addToast } = useApp();

  const handleCopy = () => {
    const text = `${scheme.name}\nBenefit: ${scheme.benefit}\n${scheme.description}\n\nHow to apply:\n${scheme.how_to_apply?.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => addToast('Copied to clipboard', 'success'));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="w-full max-w-[600px] max-h-[90vh] overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,1)',
            boxShadow: '0 24px 80px rgba(26,35,126,0.18)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 pt-6 pb-4 relative"
            style={{ borderBottom: '1px solid rgba(26,35,126,0.06)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:rotate-90 hover:bg-black/5"
              style={{ color: '#64748b' }}
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <span className="text-5xl">{scheme.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-xl gradient-text leading-tight">{scheme.name}</h2>
                <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{scheme.ministry}</p>
                <p className="font-black text-2xl mt-2" style={{ color: '#FF6F00' }}>{scheme.benefit}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {scheme.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(26,35,126,0.07)', color: '#1a237e' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto px-6 py-4 space-y-5" style={{ maxHeight: 'calc(90vh - 280px)' }}>

            {/* Overview */}
            <section>
              <h3 className="font-black text-sm gradient-text mb-2">Overview</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{scheme.description}</p>
            </section>

            {/* Eligibility */}
            {scheme.criteria?.length > 0 && (
              <section>
                <h3 className="font-black text-sm gradient-text mb-2">Eligibility Criteria</h3>
                <div className="space-y-2">
                  {scheme.criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {c.met === true  && <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />}
                      {c.met === false && <XCircle size={15} style={{ color: '#dc2626', flexShrink: 0 }} />}
                      {c.met === null  && <Circle size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                      <span className="text-sm" style={{ color: c.met === null ? '#94a3b8' : '#334155' }}>{c.text}</span>
                      {c.met === null && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }}>unknown</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Documents */}
            {scheme.documents_required?.length > 0 && (
              <section>
                <h3 className="font-black text-sm gradient-text mb-2">Documents Required</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {scheme.documents_required.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(26,35,126,0.04)', color: '#334155', border: '1px solid rgba(26,35,126,0.07)' }}
                    >
                      <FileText size={11} style={{ color: '#1a237e', flexShrink: 0 }} />
                      {doc}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* How to Apply */}
            {scheme.how_to_apply?.length > 0 && (
              <section>
                <h3 className="font-black text-sm gradient-text mb-2">How to Apply</h3>
                <div className="space-y-2">
                  {scheme.how_to_apply.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #1a237e, #FF6F00)', color: '#fff' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Important Details */}
            <section
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(26,35,126,0.03)', border: '1px solid rgba(26,35,126,0.07)' }}
            >
              <h3 className="font-black text-sm gradient-text mb-2">Important Details</h3>
              {scheme.deadline && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
                  <Clock size={12} style={{ color: '#FF6F00' }} />
                  <span><strong>Deadline:</strong> {scheme.deadline}</span>
                </div>
              )}
              {scheme.helpline && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
                  <Phone size={12} style={{ color: '#1a237e' }} />
                  <span><strong>Helpline:</strong> {scheme.helpline}</span>
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(26,35,126,0.06)' }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ border: '1.5px solid rgba(26,35,126,0.15)', color: '#1a237e' }}
            >
              Close
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-glow-blue px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
              >
                <Copy size={13} /> Copy Details
              </button>
              <a
                href={scheme.official_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
              >
                Apply Now <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
