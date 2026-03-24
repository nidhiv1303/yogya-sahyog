import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { registerUser } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    // If already registered, skip to onboarding
    if (localStorage.getItem('yogya_user_id')) {
      navigate('/onboarding');
    }
  }, [navigate]);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await registerUser(email);
      localStorage.setItem('yogya_user_id', data.user_id);
      localStorage.setItem('yogya_email', email);
      navigate('/onboarding');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (lang === 'en' ? t.errorGeneric : t.errorGeneric)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-white to-[#fff8f0] flex flex-col">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0B1340] flex items-center justify-center">
            <span className="text-white font-bold text-sm">य</span>
          </div>
          <span className="font-bold text-[#1a237e] text-lg">Yogya</span>
        </Link>
        <button
          onClick={toggleLang}
          className="px-3 py-1.5 rounded-full border-2 border-[#FF6F00] text-[#FF6F00] text-xs font-semibold hover:bg-[#FF6F00] hover:text-white transition-colors"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-[#0B1340] to-[#1E3A8A] px-8 py-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mx-auto mb-4 flex items-center justify-center"
              >
                <span className="text-3xl">🇮🇳</span>
              </motion.div>
              <h1 className="text-2xl font-black mb-2">{t.welcomeTitle}</h1>
              <p className="text-blue-200 text-sm leading-relaxed">{t.welcomeSubtitle}</p>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      {...register('email', {
                        required: t.errorRequired,
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: t.errorEmail,
                        }
                      })}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-gray-900 text-sm transition-colors"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#FF6F00] hover:bg-[#E65100] disabled:bg-gray-300 text-white font-bold text-base transition-colors shadow-lg shadow-orange-200"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {lang === 'en' ? 'Processing...' : 'प्रक्रिया हो रही है...'}
                    </>
                  ) : (
                    <>
                      {t.continueBtn}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Trust signals */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  {[
                    { icon: <Shield size={14} className="text-green-500" />, text: lang === 'en' ? 'Your data is secure and private' : 'आपका डेटा सुरक्षित और निजी है' },
                    { icon: <CheckCircle2 size={14} className="text-green-500" />, text: lang === 'en' ? 'No spam, ever' : 'कोई स्पैम नहीं, कभी नहीं' },
                    { icon: <CheckCircle2 size={14} className="text-green-500" />, text: lang === 'en' ? 'Takes less than 5 minutes' : '5 मिनट से कम लगते हैं' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      {item.icon}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-gray-400 text-xs mt-6">
            {lang === 'en'
              ? 'Built by Team Bit_By_Bit for IAR Udaan Hackathon 2026'
              : 'IAR उड़ान हैकाथॉन 2026 के लिए टीम योग्य द्वारा निर्मित'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
