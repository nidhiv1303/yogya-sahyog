import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';

/* ─── CountUp ─── */
function CountUp({ end, suffix = '', duration = 1500, prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ─── FadeUp ─── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ text, light = false }) {
  return (
    <span className="inline-block text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
      style={light
        ? { background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }
        : { background: 'rgba(20,123,93,0.1)', color: '#147B5D', border: '1px solid rgba(20,123,93,0.2)' }
      }>
      {text}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 1 — NAVBAR
════════════════════════════════════════════════════════ */
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('en');
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Problem', id: 'problem' },
    { label: 'Solution', id: 'solution' },
    { label: 'Features', id: 'features' },
    { label: 'Team', id: 'team' },
  ];

  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        height: 72,
        padding: '0 max(5vw, 40px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.0)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(15,23,42,0.08)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(15,23,42,0.05)' : 'none',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center border-2 border-[#0F172A]"
          style={{ background: 'transparent' }}>
          <span className="text-[#0F172A] font-black text-2xl leading-none">य</span>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-2xl leading-none text-[#0F172A]">Yogya</span>
          <span className="text-[11px] font-bold text-[#4B5563] tracking-[0.18em] uppercase mt-0.5">Sahyog</span>
        </div>
      </div>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-2">
        {links.map(link => (
          <button key={link.id} onClick={() => scroll(link.id)}
            className="px-4 py-2 rounded-lg text-[15px] font-semibold transition-all hover:bg-[#147B5D]/8 hover:text-[#147B5D] border border-transparent hover:border-[#147B5D]/20"
            style={{ color: scrolled ? '#374151' : '#0F172A' }}>
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm font-semibold text-[#374151] hover:border-[#147B5D]/40 hover:text-[#147B5D] transition-all shadow-sm">
          {lang === 'en' ? 'A / अ' : 'अ / A'}
        </button>
        <button onClick={() => navigate('/register')}
          className="btn-glow px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md rounded-xl">
          Sign In
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 2 — HERO
════════════════════════════════════════════════════════ */
function HeroSection() {
  const navigate = useNavigate();

  const statCards = [
    { num: 650, suffix: '+', label: 'Government Schemes', sub: 'Across 28 state portals', color: '#147B5D', rot: '-2deg', delay: 0 },
    { num: 73, suffix: '%', label: 'Unclaimed Benefits', sub: 'Eligible citizens miss out', color: '#D97706', rot: '1.5deg', delay: 0.1 },
    { num: 15, suffix: 'L Cr', label: 'Welfare Budget', sub: 'Annual allocated funds', color: '#0F172A', rot: '-1deg', delay: 0.2, prefix: '₹' },
    { num: 3, suffix: ' Min', label: 'To Discover', sub: 'With AI matching', color: '#15803D', rot: '2.5deg', delay: 0.3 },
  ];

  return (
    <section className="relative overflow-hidden w-full flex items-center bg-[#F8FAFC]" style={{ minHeight: '100vh', paddingTop: 72 }}>
      {/* Particles and ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>
      <div className="blob-1 absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 70%)' }} />
      <div className="blob-2 absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fcd34d 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-[max(5vw,40px)] flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center gap-2 self-start mb-6 px-3 py-1.5 rounded-full border border-[#147B5D]/20 bg-[#147B5D]/5">
             <span className="text-[#147B5D] text-sm font-semibold">IAR Udaan Hackathon 2026</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(42px,5vw,72px)] font-bold text-[#0F172A] leading-[1.1] mb-6">
            Discover Government Schemes <span className="text-[#147B5D]">You Qualify For.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#4B5563] mb-8 leading-relaxed max-w-xl">
            A single, intelligent platform that simplifies scheme discovery. Answer a few questions, upload your documents securely, and let our AI match you with exact benefits across state and central governments.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate('/register')} className="btn-glow px-8 py-3.5 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Find My Schemes
            </button>
            <button onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3.5 text-[#0F172A] border border-[#CBD5E1] bg-white rounded-8 shadow-sm hover:bg-[#F1F5F9] transition-all font-medium rounded-lg">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Right Content - 3D Cards Grid */}
        <div className="w-full lg:w-1/2 relative lg:h-[600px] flex items-center justify-center">
           <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {statCards.map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: card.rot }}
                transition={{ duration: 0.8, delay: 0.4 + card.delay, type: "spring", bounce: 0.4 }}
                whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-[#E2E8F0] float-delay"
                style={{
                  borderTop: `4px solid ${card.color}`,
                  animationDelay: `${i * 0.7}s`
                }}>
                <div className="text-3xl font-bold mb-1" style={{ color: card.color }}>
                  <CountUp prefix={card.prefix} end={card.num} suffix={card.suffix} />
                </div>
                <div className="text-sm font-semibold text-[#0F172A] mb-1">{card.label}</div>
                <div className="text-xs text-[#64748b]">{card.sub}</div>
              </motion.div>
            ))}
           </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 3 — PROBLEM
════════════════════════════════════════════════════════ */
function ProblemSection() {
  const problems = [
    {
      num: '01',
      icon: '🗺️',
      title: 'Information Fragmentation',
      desc: 'Over 650 schemes are scattered across dozens of ministry websites, state portals, and PDF circulars — each with different formats, URLs, and update cycles. No single source of truth exists.',
      stat: '650+',
      statLabel: 'scattered scheme sources',
      accent: '#f97316',
    },
    {
      num: '02',
      icon: '📜',
      title: 'Complex Eligibility Criteria',
      desc: 'Every scheme has layered conditions: income ceilings, caste categories, land holdings, age brackets, and occupation codes written in dense legal language that even educated citizens struggle to decode.',
      stat: '40+',
      statLabel: 'criteria per scheme on avg',
      accent: '#a78bfa',
    },
    {
      num: '03',
      icon: '📂',
      title: 'Document Confusion',
      desc: 'Citizens routinely travel hours and spend weeks collecting the wrong documents — only to have applications rejected at the counter. Each scheme demands a different combination of certificates.',
      stat: '68%',
      statLabel: 'rejections due to wrong docs',
      accent: '#fb7185',
    },
    {
      num: '04',
      icon: '🗣️',
      title: 'Language & Literacy Barrier',
      desc: 'Critical eligibility information is published in English or formal Hindi. The 500M+ citizens who speak Gujarati, Marathi, Tamil, or Bengali are effectively locked out of understanding what they qualify for.',
      stat: '500M+',
      statLabel: 'non-Hindi/English speakers',
      accent: '#34d399',
    },
  ];

  return (
    <section id="problem" className="py-24 sm:py-36 w-full bg-[#0F172A] relative overflow-hidden">
      <div className="dot-pattern absolute inset-0 opacity-10 pointer-events-none" />
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #147B5D, transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-[max(5vw,40px)] relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <FadeUp><SectionLabel text="The Challenge" light /></FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
                Millions miss out<br />
                <span style={{ color: '#f97316' }}>because the system</span><br />
                is broken.
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="flex-shrink-0">
            <div className="flex gap-6">
              {[
                { value: '₹2.3L Cr', label: 'Unclaimed annually' },
                { value: '73%', label: 'Never apply' },
              ].map((s, i) => (
                <div key={i} className="text-center px-6 py-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-[#64748b] mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <FadeUp delay={0.15 + i * 0.1} key={i}>
              <motion.div
                whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="relative rounded-2xl p-7 group overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  transformStyle: 'preserve-3d',
                  /* 3D depth: bottom and right shadow */
                  boxShadow: `
                    4px 8px 24px rgba(0,0,0,0.5),
                    inset 0 1px 0 rgba(255,255,255,0.06)
                  `,
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />

                {/* Right-side 3D edge */}
                <div className="absolute top-2 bottom-2 right-0 w-0.5 rounded-full opacity-30"
                  style={{ background: `linear-gradient(to bottom, ${p.accent}, transparent)` }} />

                {/* Bottom 3D edge */}
                <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full opacity-20"
                  style={{ background: `linear-gradient(to right, transparent, ${p.accent}, transparent)` }} />

                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}30` }}>
                      {p.icon}
                    </div>
                    <span className="text-xs font-black tracking-widest" style={{ color: p.accent }}>{p.num}</span>
                  </div>
                  {/* Stat badge */}
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: p.accent }}>{p.stat}</div>
                    <div className="text-[10px] text-[#475569] font-medium leading-tight max-w-[100px] text-right">{p.statLabel}</div>
                  </div>
                </div>

                <h3 className="text-white font-bold text-xl mb-3">{p.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{p.desc}</p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${p.accent}08, transparent 60%)` }} />
              </motion.div>
            </FadeUp>
          ))}
        </div>

        {/* Bottom callout */}
        <FadeUp delay={0.5}>
          <div className="mt-12 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'rgba(20,123,93,0.08)', border: '1px solid rgba(20,123,93,0.2)' }}>
            <p className="text-[#94A3B8] text-base">
              <span className="text-white font-bold">Yogya AI</span> solves all four problems — one conversation at a time.
            </p>
            <button
              onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(20,123,93,0.2)', color: '#34d399', border: '1px solid rgba(20,123,93,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,123,93,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,123,93,0.2)'}
            >
              See how we fix it
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 4 — SOLUTION / HOW IT WORKS
════════════════════════════════════════════════════════ */
function SolutionSection() {
  const steps = [
    { title: "Conversation", icon: "💬", desc: "Speak or type naturally in your preferred language to establish your basic profile." },
    { title: "Smart Matching", icon: "🧠", desc: "Our RAG engine cross-references your profile against thousands of official scheme documents." },
    { title: "Document Check", icon: "📄", desc: "Upload docs. OCR validates them instantly against exactly what the scheme requires." },
    { title: "Guided Application", icon: "✅", desc: "Receive a step-by-step checklist and auto-filled draft applications to apply confidently." }
  ];

  return (
    <section id="solution" className="py-24 sm:py-32 w-full bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1400px] mx-auto px-[max(5vw,40px)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeUp><SectionLabel text="How It Works" /></FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-4xl sm:text-6xl font-bold text-[#0F172A] mb-4">A simple flow to empowerment</h2>
            <p className="text-[#4B5563] text-xl">We abstract away the bureaucratic complexity, leaving you with a clean, conversational experience.</p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
           {/* Connecting line for desktop */}
           <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-0.5 bg-[#E2E8F0] z-0" />
           {steps.map((step, i) => (
             <FadeUp delay={0.2 + (i*0.1)} key={i} className="relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#147B5D] flex items-center justify-center text-3xl shadow-lg mb-6 relative">
                    {step.icon}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#147B5D] text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                      {i+1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3">{step.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{step.desc}</p>
                </div>
             </FadeUp>
           ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 5 — FEATURES (3D GRID)
════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const features = [
    { title: "Multilingual AI", desc: "Talk in Hindi, Gujarati, or English. The engine translates and processes natively." },
    { title: "Conflict Detection", desc: "Flags contradicting eligibility rules between Central and State scheme variants." },
    { title: "OCR Document Parsing", desc: "Upload Aadhaar, PAN, or land records. Extract data without manual entry." },
    { title: "No Hallucinations", desc: "Every match cites the exact clause and page number of the original PDF." },
    { title: "Voice Input", desc: "Not comfortable typing? Just press the microphone and explain your situation." },
    { title: "Private & Secure", desc: "Your PII and uploaded documents are processed securely and not used for training." }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 w-full bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-[max(5vw,40px)]">
        <div className="mb-16">
          <FadeUp><SectionLabel text="Platform Capabilities" /></FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-4xl sm:text-6xl font-bold text-[#0F172A] mb-4">Built for scale and accuracy</h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeUp delay={i * 0.1} key={i}>
              <div className="card-3d p-8 h-full bg-white cursor-default">
                <div className="w-2 h-2 rounded-full bg-[#D97706] mb-4" />
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 6 — TEAM
════════════════════════════════════════════════════════ */
function TeamSection() {
  const team = [
    {
      initials: 'YG',
      name: 'Yug Gandhi',
      role: 'Backend & Database',
      accent: '#3b82f6',
      items: [
        { done: true,  text: 'FastAPI server (port 8000)' },
        { done: true,  text: 'PostgreSQL database — 11 tables' },
        { done: true,  text: 'OCR pipeline (pdfplumber + pytesseract)' },
        { done: true,  text: 'Node.js middleware server (port 3000)' },
        { done: true,  text: 'All REST API endpoints' },
        { done: true,  text: 'Hindi translation (deep-translator)' },
        { done: true,  text: 'Compiled citizen JSON for RAG pipeline' },
      ],
      stack: ['FastAPI', 'PostgreSQL', 'Node.js', 'Python'],
    },
    {
      initials: 'JC',
      name: 'Jaypalsinh Chavda',
      role: 'Frontend & Full Integration',
      accent: '#f97316',
      badge: 'Full-Stack Bridge',
      items: [
        { done: true,  text: 'Vite + React dashboard & landing page' },
        { done: true,  text: '3D glass morphism UI + animations' },
        { done: true,  text: 'Scheme cards, document upload, profile drawer' },
        { done: true,  text: 'Connected frontend → Node.js → FastAPI → PostgreSQL' },
        { done: true,  text: 'Firebase authentication integration' },
        { done: true,  text: 'Hindi / English language toggle' },
        { done: true,  text: 'End-to-end API wiring across all layers' },
      ],
      stack: ['React', 'Vite', 'Tailwind', 'Firebase'],
    },
    {
      initials: 'KM',
      name: 'Kushagra Mali',
      role: 'RAG & AI Pipeline',
      accent: '#a78bfa',
      items: [
        { done: false, text: 'ChromaDB vector database setup' },
        { done: false, text: 'Ingest government scheme PDFs' },
        { done: false, text: 'Qwen LLM via Ollama (local)' },
        { done: false, text: 'RAG query pipeline' },
        { done: false, text: 'Scheme eligibility matching engine' },
        { done: false, text: 'Citation of exact PDF clauses' },
        { done: false, text: 'Conflict detection (central vs state)' },
      ],
      stack: ['ChromaDB', 'Qwen', 'LangChain', 'Ollama'],
    },
    {
      initials: 'N',
      name: 'Nidhi',
      role: 'RAG Research & Testing',
      accent: '#34d399',
      items: [
        { done: false, text: 'PM-KISAN, PMAY, Ayushman PDFs' },
        { done: false, text: 'PMFBY, NSP scheme documents' },
        { done: false, text: 'Scheme metadata curation' },
        { done: false, text: 'RAG accuracy testing per scheme' },
        { done: false, text: 'Hindi language testing' },
        { done: false, text: 'Eligibility test cases (farmer, student, widow)' },
        { done: false, text: 'Central vs State conflict analysis' },
      ],
      stack: ['Research', 'Hindi NLP', 'PDF Curation', 'Testing'],
    },
  ];

  return (
    <section id="team" className="py-24 sm:py-32 w-full bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="max-w-[1400px] mx-auto px-[max(5vw,40px)]">
        <div className="text-center mb-14">
          <FadeUp><SectionLabel text="The Team" /></FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#0F172A] mb-3">Meet Team Yogya</h2>
            <p className="text-[#64748B] text-lg">Four builders. One mission. IAR Udaan Hackathon 2026.</p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <FadeUp delay={i * 0.1} key={i}>
              <motion.div
                whileHover={{ y: -8, rotateX: 2, rotateY: -3 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className="relative rounded-2xl p-6 flex flex-col h-full overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${member.accent}25`,
                  transformStyle: 'preserve-3d',
                  boxShadow: `
                    4px 8px 32px rgba(0,0,0,0.08),
                    0 1px 0 rgba(255,255,255,0.9) inset
                  `,
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${member.accent}, ${member.accent}40)` }} />

                {/* Right 3D edge */}
                <div className="absolute top-2 right-0 bottom-2 w-px opacity-40"
                  style={{ background: `linear-gradient(to bottom, ${member.accent}, transparent)` }} />

                {/* Bottom 3D edge */}
                <div className="absolute bottom-0 left-2 right-2 h-px opacity-30"
                  style={{ background: `linear-gradient(to right, transparent, ${member.accent}, transparent)` }} />

                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 font-black text-xl flex-shrink-0"
                  style={{
                    background: `${member.accent}15`,
                    border: `1.5px solid ${member.accent}35`,
                    color: member.accent,
                  }}>
                  {member.initials}
                </div>

                <div className="mb-1 flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[#0F172A] text-base">{member.name}</h3>
                  {member.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `${member.accent}15`, color: member.accent, border: `1px solid ${member.accent}30` }}>
                      {member.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold mb-4"
                  style={{ color: member.accent }}>{member.role}</div>

                {/* Task list */}
                <div className="space-y-1.5 flex-1 mb-4">
                  {member.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5 text-xs"
                        style={{ color: item.done ? '#22c55e' : '#94a3b8' }}>
                        {item.done ? '✓' : '○'}
                      </span>
                      <span className="text-xs leading-relaxed"
                        style={{ color: item.done ? '#374151' : '#94a3b8' }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stack pills */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {member.stack.map((s, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        background: `${member.accent}12`,
                        color: member.accent,
                        border: `1px solid ${member.accent}25`,
                      }}>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION 7 — ARCHITECTURE
════════════════════════════════════════════════════════ */
function ArchitectureSection() {
  return (
     <section id="technology" className="py-24 sm:py-32 w-full bg-[#0F172A]">
       <div className="max-w-[1400px] mx-auto px-[max(5vw,40px)] text-center">
         <FadeUp><SectionLabel text="Under The Hood" light /></FadeUp>
         <FadeUp delay={0.1}>
           <h2 className="text-3xl sm:text-5xl font-bold text-white mb-16">Modern Gov-Tech Stack</h2>
         </FadeUp>
         
         <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {['React', 'Node.js', 'FastAPI', 'PostgreSQL', 'ChromaDB', 'Qwen LLM'].map((tech, i) => (
               <FadeUp delay={i*0.05} key={i}>
                  <div className="px-6 py-3 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] font-semibold">
                    {tech}
                  </div>
               </FadeUp>
            ))}
         </div>
       </div>
     </section>
  )
}

/* ════════════════════════════════════════════════════════
   SECTION 8 — FOOTER
════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-16 pb-8 px-[max(5vw,40px)]">
       <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded bg-[#147B5D] flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">य</span>
              </div>
              <span className="font-bold text-2xl text-[#0F172A]">Yogya</span>
            </div>
            <p className="text-[#64748B] text-sm">Empowering citizens through intelligent discovery.</p>
          </div>
          <div className="text-sm font-semibold text-[#147B5D] px-4 py-2 bg-[#147B5D]/10 rounded-full">
            🏆 IAR Udaan Hackathon 2026
          </div>
       </div>
       <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between text-xs text-[#94A3B8]">
         <span>© 2026 Team Yogya. All rights reserved.</span>
         <span>Built for 1.4 Billion Indians</span>
       </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════
   ROOT EXPORT
════════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#F8FAFC]">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <TeamSection />
      <ArchitectureSection />
      <Footer />
    </div>
  );
}
