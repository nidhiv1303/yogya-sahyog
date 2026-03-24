import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { registerUser } from '../api';
import { useApp } from '../context/AppContext';
import ParticleBackground from '../components/ParticleBackground';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

export default function Register() {
  const navigate = useNavigate();
  const { setUserId } = useApp();

  const [step, setStep] = useState(1); // 1 = credentials, 2 = profile
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    state_residence: '',
    language_pref: 'english',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // ── Step 1: Firebase auth ──────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let firebaseUser;

      try {
        // Try creating a new account first
        const cred = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        firebaseUser = cred.user;
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Existing user — sign them in
          const cred = await signInWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );
          firebaseUser = cred.user;
        } else {
          throw createErr;
        }
      }

      // Store firebase UID immediately
      localStorage.setItem('yogya_user_id', firebaseUser.uid);
      localStorage.setItem('yogya_email', firebaseUser.email);
      setUserId(firebaseUser.uid);

      // Move to profile step
      setStep(2);
    } catch (err) {
      console.error('Firebase auth error:', err.code, err.message);
      setError(friendlyError(err.code) + (import.meta.env.DEV ? ` [${err.code}]` : ''));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Save profile to PostgreSQL ────────────────────
  const handleProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const firebaseUid = localStorage.getItem('yogya_user_id');

    try {
      await registerUser({
        firebase_uid: firebaseUid,
        email: formData.email || localStorage.getItem('yogya_email'),
        username: formData.username,
        phone: formData.phone,
        state_residence: formData.state_residence,
        language_pref: formData.language_pref,
      });

      localStorage.setItem('user_lang', formData.language_pref);
      localStorage.setItem('user_name', formData.username);
      navigate('/dashboard');
    } catch (err) {
      // Backend may already have the user — still allow navigation
      console.warn('Backend register error (non-fatal):', err.message);
      localStorage.setItem('user_lang', formData.language_pref);
      localStorage.setItem('user_name', formData.username);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#F8FAFC] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <ParticleBackground />
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#86efac] opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#fcd34d] opacity-20 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">

          {/* Header */}
          <div className="bg-[#0F172A] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#147B5D] opacity-10" />
            <div className="w-14 h-14 bg-[#147B5D] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold leading-none pb-1">य</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {step === 1 ? 'Sign in to Yogya' : 'Complete your profile'}
            </h1>
            <p className="text-[#94A3B8] text-sm">
              {step === 1
                ? 'New users are created automatically'
                : 'Help us find the right schemes for you'}
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    step >= s ? 'bg-[#147B5D] text-white' : 'bg-white/10 text-white/40'
                  }`}>{s}</div>
                  {s < 2 && <div className={`w-8 h-0.5 rounded-full ${step > s ? 'bg-[#147B5D]' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Email + Password ── */}
              {step === 1 && (
                <motion.form key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleCredentials}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#147B5D] focus:ring-2 focus:ring-[#147B5D]/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        minLength={6}
                        className="w-full bg-white border border-[#CBD5E1] rounded-lg px-4 py-3 pr-11 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#147B5D] focus:ring-2 focus:ring-[#147B5D]/20 transition-all outline-none"
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
                        {showPassword
                          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1.5">
                      New user? A new account will be created. Existing user? You'll be signed in.
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                      <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span className="text-sm text-red-600 font-medium">{error}</span>
                    </motion.div>
                  )}

                  <button type="submit" disabled={isLoading}
                    className="w-full btn-glow font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isLoading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Continue'}
                  </button>
                </motion.form>
              )}

              {/* ── STEP 2: Profile ── */}
              {step === 2 && (
                <motion.form key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleProfile}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Full Name</label>
                    <input
                      required
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#147B5D] focus:ring-2 focus:ring-[#147B5D]/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B] font-medium text-sm">+91</span>
                      <input
                        required
                        type="tel"
                        name="phone"
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="flex-1 bg-white border border-[#CBD5E1] rounded-r-lg px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:border-[#147B5D] focus:ring-2 focus:ring-[#147B5D]/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">State of Residence</label>
                    <select
                      required
                      name="state_residence"
                      value={formData.state_residence}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#CBD5E1] rounded-lg px-4 py-3 text-[#0F172A] focus:border-[#147B5D] focus:ring-2 focus:ring-[#147B5D]/20 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>Select your state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Preferred Language</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ id: 'english', native: 'English' }, { id: 'hindi', native: 'हिंदी' }].map(lang => (
                        <label key={lang.id}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.language_pref === lang.id
                              ? 'border-[#147B5D] bg-[#147B5D]/5 text-[#147B5D]'
                              : 'border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#147B5D]/50'
                          }`}>
                          <input type="radio" name="language_pref" value={lang.id}
                            checked={formData.language_pref === lang.id}
                            onChange={handleChange} className="sr-only" />
                          <span className="font-semibold text-sm">{lang.native}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-sm text-red-600 font-medium">{error}</span>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="px-5 py-3.5 rounded-lg border border-[#CBD5E1] text-[#64748B] font-semibold text-sm hover:bg-[#F1F5F9] transition-all">
                      Back
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex-1 btn-glow font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {isLoading
                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Go to Dashboard'}
                    </button>
                  </div>
                </motion.form>
              )}

            </AnimatePresence>

            <p className="mt-6 text-center text-xs text-[#94A3B8]">
              Your data is encrypted and secure. We never share it with third parties.
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/')}
          className="mt-6 flex items-center justify-center gap-2 text-[#64748B] hover:text-[#147B5D] text-sm w-full font-medium transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </button>
      </motion.div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':         return 'Invalid email address.';
    case 'auth/wrong-password':        return 'Incorrect password. Please try again.';
    case 'auth/weak-password':         return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':     return 'Too many attempts. Please wait and try again.';
    case 'auth/invalid-credential':    return 'Incorrect email or password.';
    case 'auth/network-request-failed':return 'Network error. Check your internet connection.';
    default:                           return 'Something went wrong. Please try again.';
  }
}
