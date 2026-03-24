import { motion } from 'framer-motion';
import { CheckCircle2, Mail, User, Tag, FileText, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STEPS = [
  { key: 'email',    icon: <Mail size={12} />,     label: 'Email Registered' },
  { key: 'basic',   icon: <User size={12} />,     label: 'Basic Info' },
  { key: 'need',    icon: <Tag size={12} />,      label: 'Select Need' },
  { key: 'details', icon: <FileText size={12} />, label: 'Category Details' },
  { key: 'docs',    icon: <Upload size={12} />,   label: 'Upload Documents' },
];

export default function ProfileSteps({ onOpenDrawer }) {
  const { profile, categoryProfile, docsCount } = useApp();

  const getStatus = (key) => {
    if (key === 'email')    return !!localStorage.getItem('yogya_user_id');
    if (key === 'basic')    return !!(profile.full_name && profile.state && profile.age);
    if (key === 'need')     return !!categoryProfile.need;
    if (key === 'details')  return !!(categoryProfile.need && Object.keys(categoryProfile).length > 1);
    if (key === 'docs')     return docsCount > 0;
    return false;
  };

  const completedCount = STEPS.filter(s => getStatus(s.key)).length;
  const nextPendingIdx = STEPS.findIndex(s => !getStatus(s.key));

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const done = getStatus(step.key);
        const isNext = i === nextPendingIdx;

        return (
          <div key={step.key} className="flex gap-3 items-stretch">
            {/* Connector column */}
            <div className="flex flex-col items-center" style={{ width: 28 }}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => !done && onOpenDrawer?.()}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all"
                style={done ? {
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                } : isNext ? {
                  border: '2px solid #FF6F00',
                  background: 'rgba(255,111,0,0.06)',
                  animation: 'pulseGlow 2s infinite',
                } : {
                  border: '2px dashed rgba(26,35,126,0.2)',
                  background: 'transparent',
                }}
              >
                {done
                  ? <CheckCircle2 size={14} style={{ color: '#fff' }} />
                  : <span style={{ color: isNext ? '#FF6F00' : '#94a3b8' }}>{step.icon}</span>
                }
              </motion.button>
              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 w-0.5 my-0.5"
                  style={{
                    background: done ? 'linear-gradient(180deg, #22c55e, #22c55e88)' : 'rgba(26,35,126,0.1)',
                    minHeight: 12,
                  }}
                />
              )}
            </div>

            {/* Step label */}
            <div className={`flex-1 pb-${i < STEPS.length - 1 ? '2' : '0'} flex items-start pt-1`}>
              <span
                className="text-xs"
                style={{
                  color: done ? '#16a34a' : isNext ? '#FF6F00' : '#94a3b8',
                  fontWeight: done || isNext ? 700 : 400,
                }}
              >
                {step.label}
                {isNext && !done && (
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,111,0,0.1)', color: '#FF6F00' }}>
                    Next
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}

      <p className="text-[10px] pt-2 font-medium" style={{ color: '#94a3b8', marginLeft: 40 }}>
        {completedCount}/{STEPS.length} steps completed
      </p>
    </div>
  );
}
