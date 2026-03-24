import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { getCitizenData } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const processingSteps = {
  en: [
    { label: 'Profile saved', delay: 0 },
    { label: 'Documents processed', delay: 0.8 },
    { label: 'Finding matching schemes...', delay: 1.6 },
    { label: 'Checking eligibility...', delay: 2.4 },
    { label: 'Preparing your results...', delay: 3.2 },
  ],
  hi: [
    { label: 'प्रोफाइल सेव हो गई', delay: 0 },
    { label: 'दस्तावेज़ संसाधित हुए', delay: 0.8 },
    { label: 'मिलती-जुलती योजनाएं खोज रहे हैं...', delay: 1.6 },
    { label: 'पात्रता जांच रहे हैं...', delay: 2.4 },
    { label: 'आपके परिणाम तैयार कर रहे हैं...', delay: 3.2 },
  ],
};

export default function ProcessingPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = processingSteps[lang];
  const userId = localStorage.getItem('yogya_user_id');

  useEffect(() => {
    if (!userId) { navigate('/register'); return; }

    // Animate steps
    steps.forEach((_, i) => {
      setTimeout(() => setVisibleSteps(i + 1), (i * 800) + 300);
    });

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 80);

    // Fetch citizen data + navigate after 4.5s
    const timer = setTimeout(async () => {
      try {
        const { data } = await getCitizenData(userId);
        localStorage.setItem('yogya_citizen_data', JSON.stringify(data));
      } catch (e) {
        // Navigate anyway — results page handles missing data gracefully
      }
      navigate('/results');
    }, 4500);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [userId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1257] via-[#1a237e] to-[#283593] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🇮🇳</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {lang === 'en' ? 'Analyzing Your Profile' : 'आपकी प्रोफाइल का विश्लेषण हो रहा है'}
          </h1>
          <p className="text-blue-200 mt-2 text-sm">
            {lang === 'en'
              ? 'Checking 650+ government schemes for you...'
              : 'आपके लिए 650+ सरकारी योजनाएं जांच रहे हैं...'}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between text-xs text-blue-300 mb-2">
            <span>{lang === 'en' ? 'Processing...' : 'संसाधन हो रहा है...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isVisible = i < visibleSteps;
            const isDone = i < visibleSteps - 1;
            const isCurrent = i === visibleSteps - 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  isVisible ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/5'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={20} className="text-green-400" />
                  ) : isCurrent ? (
                    <Loader2 size={20} className="text-[#FF6F00] animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDone ? 'text-green-300' : isCurrent ? 'text-white' : 'text-white/30'
                }`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Pulsing dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-2 mt-8"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-[#FF6F00]"
            />
          ))}
        </motion.div>

        <p className="text-center text-blue-300 text-xs mt-6">
          {lang === 'en'
            ? 'Powered by RAG + Qwen LLM · Built by Team Bit_By_Bit'
            : 'RAG + Qwen LLM द्वारा संचालित · टीम योग्य द्वारा निर्मित'}
        </p>
      </div>
    </div>
  );
}
