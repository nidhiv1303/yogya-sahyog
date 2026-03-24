import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Sparkles, Users, BookOpen, Brain, Database,
  Globe, Server, Cpu, Zap, Shield, TrendingUp, ChevronDown,
  CheckCircle2, Star, Award, Code2, GitBranch, Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ─── helpers ─── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ─── data ─── */
const teamMembers = [
  {
    name: 'Yug Gandhi',
    role: 'Backend & Database',
    avatar: 'YG',
    gradient: 'from-blue-600 to-indigo-700',
    skills: ['FastAPI', 'PostgreSQL', 'Node.js', 'OCR'],
    desc: 'Architected the entire backend — FastAPI server, PostgreSQL schema, document extraction pipeline with pdfplumber + pytesseract OCR, and Node.js middleware.',
  },
  {
    name: 'Jaypalsinh Chavda',
    role: 'Frontend & Integrations',
    avatar: 'JC',
    gradient: 'from-orange-500 to-rose-600',
    skills: ['React', 'Tailwind', 'UX Design', 'APIs'],
    desc: 'Designed and built the complete React frontend, API integrations, UI/UX system, and connected all backend services into a seamless experience.',
  },
  {
    name: 'Kushagra Mali',
    role: 'RAG & AI Pipeline',
    avatar: 'KM',
    gradient: 'from-violet-600 to-purple-700',
    skills: ['ChromaDB', 'RAG', 'Qwen LLM', 'Vectors'],
    desc: 'Built the ChromaDB vector store, RAG pipeline over 650+ scheme PDFs, Qwen LLM integration for eligibility reasoning and scheme matching.',
  },
  {
    name: 'Nidhi',
    role: 'RAG & Research',
    avatar: 'N',
    gradient: 'from-emerald-500 to-teal-700',
    skills: ['Research', 'Hindi NLP', 'PDF Corpus', 'QA'],
    desc: 'Curated the government scheme PDF corpus, researched central vs state conflicts, built Hindi language support, and QA tested the full pipeline.',
  },
];

const techStack = [
  { name: 'FastAPI', cat: 'Backend', color: 'bg-green-900/40 text-green-300 border-green-700/50' },
  { name: 'PostgreSQL', cat: 'Database', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' },
  { name: 'React 19', cat: 'Frontend', color: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' },
  { name: 'Node.js', cat: 'Middleware', color: 'bg-lime-900/40 text-lime-300 border-lime-700/50' },
  { name: 'ChromaDB', cat: 'Vector DB', color: 'bg-purple-900/40 text-purple-300 border-purple-700/50' },
  { name: 'Qwen LLM', cat: 'AI Model', color: 'bg-orange-900/40 text-orange-300 border-orange-700/50' },
  { name: 'RAG Pipeline', cat: 'AI Arch', color: 'bg-rose-900/40 text-rose-300 border-rose-700/50' },
  { name: 'pdfplumber', cat: 'Extraction', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' },
  { name: 'pytesseract', cat: 'OCR', color: 'bg-pink-900/40 text-pink-300 border-pink-700/50' },
  { name: 'Tailwind CSS', cat: 'Styling', color: 'bg-teal-900/40 text-teal-300 border-teal-700/50' },
  { name: 'Python', cat: 'Language', color: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50' },
  { name: 'Framer Motion', cat: 'Animation', color: 'bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-700/50' },
  { name: 'Vite 8', cat: 'Build', color: 'bg-violet-900/40 text-violet-300 border-violet-700/50' },
  { name: 'JavaScript', cat: 'Language', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' },
];

const archFlow = [
  { label: 'Citizen', sub: 'React Frontend', icon: <Globe size={16} />, color: 'bg-cyan-500' },
  { label: 'Gateway', sub: 'Node.js Server', icon: <Server size={16} />, color: 'bg-lime-600' },
  { label: 'Backend', sub: 'FastAPI Python', icon: <Zap size={16} />, color: 'bg-blue-600' },
  { label: 'Data', sub: 'PostgreSQL', icon: <Database size={16} />, color: 'bg-indigo-600' },
  { label: 'AI Engine', sub: 'RAG Pipeline', icon: <Brain size={16} />, color: 'bg-purple-600' },
  { label: 'Vectors', sub: 'ChromaDB', icon: <Layers size={16} />, color: 'bg-rose-600' },
  { label: 'LLM', sub: 'Qwen Model', icon: <Cpu size={16} />, color: 'bg-orange-600' },
  { label: 'Results', sub: 'Matched Schemes', icon: <CheckCircle2 size={16} />, color: 'bg-emerald-600' },
];

const howSteps = [
  { n: '01', icon: '📧', title: 'Register', titleHi: 'रजिस्टर करें', desc: 'Sign up with just your email — no passwords, no hassle.', descHi: 'सिर्फ अपने ईमेल से साइन अप करें।' },
  { n: '02', icon: '👤', title: 'Your Profile', titleHi: 'अपनी प्रोफाइल', desc: 'Share personal, financial & social details in 4 easy steps.', descHi: '4 आसान चरणों में विवरण साझा करें।' },
  { n: '03', icon: '📄', title: 'Upload Docs', titleHi: 'दस्तावेज़ अपलोड', desc: 'Upload Aadhaar, income certificate & more. AI reads them instantly.', descHi: 'आधार, आय प्रमाण पत्र अपलोड करें।' },
  { n: '04', icon: '✨', title: 'Get Matched', titleHi: 'मैच पाएं', desc: 'Qwen LLM scans 650+ schemes and surfaces only what you qualify for.', descHi: 'AI 650+ योजनाओं में से आपकी पात्र योजनाएं खोजता है।' },
];

export default function LandingPage() {
  const { lang, toggleLang } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const l = (en, hi) => lang === 'en' ? en : hi;

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1340] via-[#0d1a5e] to-[#030712]" />
        <div className="absolute inset-0 dot-pattern" />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#1E3A8A]/30 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#F97316]/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />

        {/* Top bar */}
        <div className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-6">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EAB308] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-base">य</span>
            </div>
            <div>
              <div className="font-black text-xl leading-none text-white">Yogya</div>
              <div className="text-[10px] text-[#F97316] font-semibold leading-none tracking-widest uppercase">योग्य</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center gap-3">
            <Link to="/register"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium transition-all">
              {l('Find My Schemes', 'योजनाएं खोजें')}
            </Link>
            <button onClick={toggleLang}
              className="px-3 py-1.5 rounded-full border border-[#F97316]/60 text-[#F97316] text-xs font-bold hover:bg-[#F97316] hover:text-white transition-all">
              {lang === 'en' ? 'हिंदी' : 'EN'}
            </button>
          </motion.div>
        </div>

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-10 pb-24">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#F97316]/30 text-sm font-medium text-[#FB923C] mb-8">
            <Sparkles size={14} className="text-[#EAB308]" />
            IAR Udaan Hackathon 2026 &nbsp;·&nbsp; Team Bit_By_Bit
            <Star size={12} className="text-[#EAB308]" />
          </motion.div>

          {/* Main headline */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
              <span className="block text-white">You are</span>
              <span className="block gradient-text">Yogya.</span>
              <span className="block text-slate-300 text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
                अपने हक़ का हकदार।
              </span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            {l(
              'Yogya uses AI to navigate 650+ government welfare schemes and instantly tell you which ones you qualify for — in seconds, not months.',
              'योग्य AI का उपयोग करके 650+ सरकारी कल्याण योजनाओं में नेविगेट करता है और तुरंत बताता है कि आप किन योजनाओं के लिए पात्र हैं।'
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EAB308] text-white font-bold text-lg shadow-2xl shadow-orange-900/40 hover:shadow-orange-900/60 transition-all hover:scale-105 active:scale-100">
              {l('Find My Schemes', 'मेरी योजनाएं खोजें')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl glass text-white font-semibold text-lg hover:bg-white/10 transition-all">
              {l('How It Works', 'यह कैसे काम करता है')}
              <ChevronDown size={20} />
            </a>
          </motion.div>

          {/* Stat pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-3 mt-14">
            {[
              { val: '650+', label: l('Govt Schemes', 'सरकारी योजनाएं') },
              { val: '73%', label: l('Citizens Miss Out', 'नागरिक वंचित') },
              { val: '<30s', label: l('Matching Time', 'मैचिंग समय') },
              { val: '4', label: l('AI Tech Layers', 'AI परतें') },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass border border-white/10">
                <span className="font-black text-[#F97316] text-lg">{p.val}</span>
                <span className="text-slate-300 text-sm">{p.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 z-10">
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          PROBLEM SECTION
      ══════════════════════════════════════════ */}
      <section className="py-28 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 stripe-pattern" />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase mb-4">
              {l('The Problem', 'समस्या')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              {l('Welfare schemes exist.', 'कल्याण योजनाएं मौजूद हैं।')}
              <br />
              <span className="gradient-text">{l('Awareness doesn\'t.', 'जागरूकता नहीं।')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {l('A massive information asymmetry keeps eligible citizens from claiming what they rightfully deserve.',
                'एक बड़ी सूचना असमानता पात्र नागरिकों को उनके उचित लाभ से वंचित रखती है।')}
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stat: '650+', icon: <BookOpen size={24} />,
                label: l('Government Schemes', 'सरकारी योजनाएं'),
                desc: l('Active welfare schemes across central & state governments', 'केंद्र और राज्य सरकारों में सक्रिय कल्याण योजनाएं'),
                accent: 'border-blue-500/30 from-blue-900/20',
                iconBg: 'bg-blue-500/20 text-blue-400',
              },
              {
                stat: '73%', icon: <Users size={24} />,
                label: l('Never Claim Benefits', 'कभी लाभ नहीं उठाते'),
                desc: l('Eligible citizens who miss out due to lack of awareness', 'जागरूकता के अभाव से वंचित पात्र नागरिक'),
                accent: 'border-rose-500/30 from-rose-900/20',
                iconBg: 'bg-rose-500/20 text-rose-400',
              },
              {
                stat: '₹0', icon: <TrendingUp size={24} />,
                label: l('Cost to Citizens', 'नागरिकों की लागत'),
                desc: l('Yogya is completely free. AI-powered. No middlemen.', 'योग्य पूरी तरह मुफ्त है। AI-संचालित। कोई बिचौलिया नहीं।'),
                accent: 'border-emerald-500/30 from-emerald-900/20',
                iconBg: 'bg-emerald-500/20 text-emerald-400',
              },
            ].map((card, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div className={`relative rounded-3xl border bg-gradient-to-b ${card.accent} to-transparent p-8 card-lift h-full`}>
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-5`}>
                    {card.icon}
                  </div>
                  <div className="text-5xl font-black text-white mb-2">{card.stat}</div>
                  <div className="text-base font-bold text-white mb-2">{card.label}</div>
                  <div className="text-slate-400 text-sm leading-relaxed">{card.desc}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Banner */}
          <FadeUp delay={0.4} className="mt-10">
            <div className="rounded-3xl bg-gradient-to-r from-[#0B1340] to-[#1E3A8A] border border-blue-500/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  {l('We fix this with AI.', 'हम इसे AI से ठीक करते हैं।')}
                </h3>
                <p className="text-blue-200 text-sm">
                  {l('Yogya reads your profile, processes your documents, and matches you instantly.',
                    'योग्य आपकी प्रोफाइल पढ़ता है, दस्तावेज़ों को संसाधित करता है और आपको तुरंत मैच करता है।')}
                </p>
              </div>
              <Link to="/register"
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#F97316] hover:bg-[#ea6610] text-white font-bold transition-all hover:scale-105">
                {l('Get Started Free', 'मुफ्त में शुरू करें')} <ArrowRight size={16} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 bg-gradient-to-b from-[#030712] to-[#0B1340] relative">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-xs font-bold tracking-widest uppercase mb-4">
              {l('Process', 'प्रक्रिया')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white">
              {l('Four steps to', 'चार चरणों में')} <span className="gradient-text">{l('your benefits', 'आपके लाभ')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              {l('Designed to be completed in under 5 minutes on any device.',
                '5 मिनट से कम में किसी भी डिवाइस पर पूरा करने के लिए डिज़ाइन किया गया।')}
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((step, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="relative group">
                  {/* Connector line */}
                  {i < howSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-[#F97316]/40 to-transparent z-0" />
                  )}
                  <div className="relative z-10 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-[#F97316]/30 rounded-3xl p-7 transition-all card-lift">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B1340] to-[#1E3A8A] border border-blue-500/30 flex items-center justify-center text-2xl shadow-xl">
                        {step.icon}
                      </div>
                      <span className="text-4xl font-black text-white/5 group-hover:text-[#F97316]/20 transition-colors">
                        {step.n}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {l(step.title, step.titleHi)}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {l(step.desc, step.descHi)}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.5} className="mt-14 text-center">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2D4EAA] hover:from-[#2D4EAA] hover:to-[#1E3A8A] text-white font-bold text-lg border border-blue-500/30 shadow-xl transition-all hover:scale-105">
              {l('Start Now — It\'s Free', 'अभी शुरू करें — मुफ्त है')}
              <ArrowRight size={18} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TEAM
      ══════════════════════════════════════════ */}
      <section className="py-28 bg-[#0B1340] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#1E3A8A]/10 blur-[140px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-xs font-bold tracking-widest uppercase">
              <Award size={12} /> {l('The Team', 'हमारी टीम')}
            </span>
          </FadeUp>
          <FadeUp delay={0.1} className="text-center mb-4">
            <h2 className="text-4xl sm:text-5xl font-black text-white">
              {l('Built by ', 'निर्मित ')}<span className="gradient-text">Bit_By_Bit</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.15} className="text-center mb-16">
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {l(
                'Four engineers. One mission. Making government schemes accessible to every Indian citizen.',
                'चार इंजीनियर। एक मिशन। सरकारी योजनाओं को हर भारतीय नागरिक तक पहुंचाना।'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['AI', 'GenAI', 'RAG', 'LLM'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((m, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden card-lift transition-all group">
                  {/* Top gradient bar */}
                  <div className={`h-1 bg-gradient-to-r ${m.gradient}`} />
                  <div className="p-6">
                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg`}>
                      {m.avatar}
                    </div>
                    <h3 className="font-black text-white text-lg leading-tight">{m.name}</h3>
                    <p className="text-[#F97316] text-xs font-bold uppercase tracking-wider mb-3">{m.role}</p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{m.desc}</p>
                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {m.skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-slate-300 text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════ */}
      <section className="py-28 bg-gradient-to-b from-[#0B1340] to-[#030712]">
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 text-[#0EA5E9] text-xs font-bold tracking-widest uppercase mb-4">
              {l('Tech Stack', 'तकनीकी स्टैक')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
              {l('Built with', 'से निर्मित')} <span className="gradient-text-blue">{l('modern AI tools', 'आधुनिक AI टूल')}</span>
            </h2>
            <p className="text-slate-400 text-lg">
              {l('A full-stack production-grade AI application', 'एक पूर्ण-स्टैक प्रोडक्शन-ग्रेड AI एप्लिकेशन')}
            </p>
          </FadeUp>

          <FadeIn delay={0.2}>
            <div className="flex flex-wrap gap-3 justify-center">
              {techStack.map((t, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                  className={`flex flex-col items-center px-4 py-3 rounded-2xl border ${t.color} backdrop-blur-sm`}>
                  <span className="font-bold text-sm">{t.name}</span>
                  <span className="text-[10px] opacity-60 mt-0.5">{t.cat}</span>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ARCHITECTURE
      ══════════════════════════════════════════ */}
      <section className="py-28 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F97316]/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
              {l('Architecture', 'आर्किटेक्चर')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
              {l('How the system', 'सिस्टम')}{' '}
              <span className="text-purple-400">{l('connects', 'कैसे काम करता है')}</span>
            </h2>
            <p className="text-slate-400 text-lg">
              {l('From your input to matched schemes — under 30 seconds', 'आपके इनपुट से मिलान तक — 30 सेकंड से कम')}
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            {/* Flow */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
              {archFlow.map((node, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`flex flex-col items-center px-4 py-3 rounded-2xl ${node.color} text-white shadow-lg min-w-[90px]`}>
                    <div className="mb-1">{node.icon}</div>
                    <div className="text-xs font-black">{node.label}</div>
                    <div className="text-[9px] opacity-75 text-center">{node.sub}</div>
                  </div>
                  {i < archFlow.length - 1 && (
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }}>
                      <ArrowRight size={14} className="text-slate-500" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Layer explanations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: l('Citizen Layer', 'नागरिक परत'), desc: l('React frontend with Framer Motion — collects profile, docs, category data', 'React फ्रंटएंड — प्रोफाइल, दस्तावेज़, श्रेणी डेटा एकत्र करता है'), icon: <Globe size={18} />, col: 'border-cyan-500/30 bg-cyan-900/10' },
                { title: l('API Layer', 'API परत'), desc: l('Node.js validates and proxies to FastAPI. PostgreSQL stores citizen data.', 'Node.js FastAPI को प्रॉक्सी करता है। PostgreSQL नागरिक डेटा संग्रहीत करता है।'), icon: <Server size={18} />, col: 'border-blue-500/30 bg-blue-900/10' },
                { title: l('AI Layer', 'AI परत'), desc: l('ChromaDB retrieves relevant chunks from 650+ scheme PDFs via vector search.', 'ChromaDB 650+ योजना PDFs से प्रासंगिक चंक्स निकालता है।'), icon: <Brain size={18} />, col: 'border-purple-500/30 bg-purple-900/10' },
                { title: l('LLM Layer', 'LLM परत'), desc: l('Qwen reasons over citizen eligibility and returns structured scheme matches.', 'Qwen नागरिक पात्रता पर तर्क करता है और संरचित मैच देता है।'), icon: <Cpu size={18} />, col: 'border-orange-500/30 bg-orange-900/10' },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl border ${item.col} p-5`}>
                  <div className="text-slate-300 mb-3">{item.icon}</div>
                  <h4 className="font-bold text-white text-sm mb-2">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-b from-[#030712] to-[#0B1340]">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F97316]/10 blur-[100px] pointer-events-none" />

        <FadeUp className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F97316] to-[#EAB308] mb-8 shadow-2xl shadow-orange-900/40 pulse-ring">
            <span className="text-white font-black text-3xl">य</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            {l('You are', 'आप हैं')} <span className="gradient-text">{l('Yogya.', 'योग्य।')}</span>
            <br />
            <span className="text-slate-300 text-3xl sm:text-4xl font-bold">
              {l('Claim what you deserve.', 'अपना हक लें।')}
            </span>
          </h2>
          <p className="text-slate-400 text-xl mb-10">
            {l(
              'Join thousands of Indians discovering government schemes they\'re entitled to.',
              'उन हजारों भारतीयों से जुड़ें जो अपनी पात्र सरकारी योजनाएं खोज रहे हैं।'
            )}
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EAB308] text-white font-black text-xl shadow-2xl shadow-orange-900/40 hover:shadow-orange-900/60 transition-all hover:scale-105">
            {l('Find My Schemes Now', 'अभी मेरी योजनाएं खोजें')}
            <ArrowRight size={22} />
          </Link>
          <p className="text-slate-500 text-sm mt-5">
            {l('Free · Secure · Takes < 5 minutes', 'मुफ्त · सुरक्षित · 5 मिनट से कम')}
          </p>
        </FadeUp>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-[#030712] border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EAB308] flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">य</span>
              </div>
              <div>
                <div className="font-black text-xl text-white">Yogya — योग्य</div>
                <div className="text-slate-400 text-xs">AI Government Scheme Navigator</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-6">
              <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">{l('Home', 'होम')}</Link>
              <Link to="/register" className="text-slate-400 hover:text-white text-sm transition-colors">{l('Find Schemes', 'योजनाएं खोजें')}</Link>
              <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors">{l('How It Works', 'कैसे काम करता है')}</a>
            </div>

            {/* Team */}
            <div className="text-right">
              <div className="text-white font-bold">Team Bit_By_Bit</div>
              <div className="text-slate-400 text-xs">IAR Udaan Hackathon 2026</div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Shield size={14} className="text-[#F97316]" />
              {l('Built with love for every Indian citizen 🇮🇳', 'हर भारतीय नागरिक के लिए प्यार से बनाया गया 🇮🇳')}
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-xs">
              {['AI', 'GenAI', 'RAG', 'Qwen LLM', 'ChromaDB'].map(t => (
                <span key={t} className="px-2 py-1 rounded-md bg-white/5">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
