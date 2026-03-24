import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, FileText, RefreshCw, Globe, BarChart3, CheckCircle2, ArrowRight, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCitizenData } from '../api';
import DocumentUpload from './DocumentUpload';
import ProfileDrawer from './ProfileDrawer';
import ProfileSteps from './ProfileSteps';
import { NEED_CATEGORIES } from '../utils/constants';

function CircularProgress({ pct }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#22c55e' : pct >= 30 ? '#FF6F00' : '#ef4444';

  return (
    <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
      <svg width="72" height="72" className="rotate-[-90deg]">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(26,35,126,0.08)" strokeWidth="5" />
        <motion.circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-sm" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function ProfilePanel() {
  const { t, profile, categoryProfile, isProfileComplete, completionPct, getUserId, setLanguage, language, addMessage, setSchemesDrawerOpen } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const selectedCategory = NEED_CATEGORIES.find(c => c.id === categoryProfile.need);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const data = await getCitizenData(getUserId());
      localStorage.setItem('yogya_citizen_data', JSON.stringify(data));
      addMessage('bot', '✅ Profile data refreshed! Your latest information has been loaded.');
    } catch {
      addMessage('bot', '⚠️ Could not refresh data. Please check your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  const quickActions = [
    {
      icon: <User size={16} />,
      label: t.profileTitle,
      onClick: () => setDrawerOpen(true),
      from: '#3b82f6', to: '#6366f1',
    },
    {
      icon: <Bookmark size={16} />,
      label: 'My Schemes',
      onClick: () => setSchemesDrawerOpen(true),
      from: '#FF6F00', to: '#EAB308',
    },
    {
      icon: <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />,
      label: 'Refresh',
      onClick: refreshData,
      from: '#10b981', to: '#14b8a6',
    },
    {
      icon: <Globe size={16} />,
      label: language === 'en' ? 'हिंदी' : 'English',
      onClick: () => setLanguage(language === 'en' ? 'hi' : 'en'),
      from: '#8b5cf6', to: '#a855f7',
    },
  ];

  return (
    <>
      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">

        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-3d rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 24px rgba(26,35,126,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          }}
          onClick={() => setDrawerOpen(true)}
        >
          {/* Avatar + info row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Floating avatar */}
            <motion.div
              className="floating flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1a237e, #FF6F00)',
                boxShadow: '0 8px 24px rgba(255,111,0,0.25)',
              }}
            >
              <span className="text-white font-black text-xl">{initials}</span>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base truncate gradient-text">
                {profile.full_name || 'Anonymous User'}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.state && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(26,35,126,0.07)', color: '#1a237e', border: '1px solid rgba(26,35,126,0.12)' }}>
                    📍 {profile.state}
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(255,111,0,0.08)', color: '#FF6F00', border: '1px solid rgba(255,111,0,0.15)' }}>
                    {selectedCategory.icon} {selectedCategory.title.split(' ')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Income */}
          {profile.annual_income && (
            <div className="flex items-center gap-2 mb-4 text-sm"
              style={{ background: 'rgba(26,35,126,0.04)', borderRadius: 10, padding: '6px 10px' }}>
              <span className="font-semibold text-slate-500 text-xs">Annual Income</span>
              <span className="font-black text-xs gradient-text">₹{Number(profile.annual_income).toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Circular progress + label */}
          <div className="flex items-center gap-4 mb-4">
            <CircularProgress pct={completionPct} />
            <div className="flex-1">
              <p className="font-bold text-xs text-slate-600 mb-0.5">Profile Completion</p>
              <p className="text-[11px] text-slate-400">
                {completionPct < 30 ? 'Add more info to get better scheme matches' :
                  completionPct < 70 ? 'Good progress! A few more fields left' :
                    'Great! Your profile is well filled'}
              </p>
            </div>
          </div>

          {/* Profile Steps */}
          <div className="mb-4 pt-3" style={{ borderTop: '1px solid rgba(26,35,126,0.06)' }}>
            <ProfileSteps onOpenDrawer={() => setDrawerOpen(true)} />
          </div>

          {/* CTA button */}
          <button
            onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
            className="btn-glow w-full py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {isProfileComplete
              ? <><CheckCircle2 size={14} /> {t.profileComplete}</>
              : <>{t.completeProfile} <ArrowRight size={14} /></>
            }
          </button>
        </motion.div>

        {/* ── Documents section ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: '#1a237e' }}>
            <FileText size={13} />
            {t.documentsTitle}
          </h3>
          <div className="space-y-2.5">
            <DocumentUpload label="Aadhaar Card"         description="Upload front side"       doc_type="aadhaar" />
            <DocumentUpload label="Income Certificate"   description="From tahsildar"           doc_type="income_certificate" />
            <DocumentUpload label="Other Document"       description="Any relevant document"   doc_type="other" />
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-bold text-xs uppercase tracking-wider mb-3"
            style={{ color: '#1a237e' }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="card-3d text-left p-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 12px rgba(26,35,126,0.06)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-white shadow-sm transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${action.from}, ${action.to})`,
                    boxShadow: `0 4px 12px ${action.from}44`,
                  }}
                >
                  {action.icon}
                </div>
                <span className="text-xs font-semibold" style={{ color: '#374151' }}>{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Submission ID ── */}
        {localStorage.getItem('yogya_user_id') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-center pb-2">
            <p className="text-[10px]" style={{ color: '#94a3b8' }}>
              {t.submissionId}:{' '}
              <span className="font-mono" style={{ color: '#64748b' }}>
                {localStorage.getItem('yogya_user_id')}
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
}
