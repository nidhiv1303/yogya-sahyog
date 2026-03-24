import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, User, FileText, Database, ChevronDown, ChevronUp,
  RotateCcw, Code, Eye, EyeOff, Copy, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function SectionCard({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#1a237e]">{icon}</span>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }) {
  // Skip nulls, undefined, empty strings, and the literal string "null"
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-500 sm:w-48 flex-shrink-0 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{display}</span>
    </div>
  );
}

export default function ResultsPage() {
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [citizenData, setCitizenData] = useState(null);

  const l = (en, hi) => lang === 'en' ? en : hi;

  // Load form payloads saved during onboarding (always reliable)
  const savedGeneral = (() => { try { return JSON.parse(localStorage.getItem('yogya_general_payload') || '{}'); } catch { return {}; } })();
  const savedCategory = (() => { try { return JSON.parse(localStorage.getItem('yogya_category_payload') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    const stored = localStorage.getItem('yogya_citizen_data');
    if (stored) {
      try { setCitizenData(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleStartOver = () => {
    ['yogya_user_id','yogya_email','yogya_citizen_data','yogya_general_payload','yogya_category_payload']
      .forEach(k => localStorage.removeItem(k));
    navigate('/register');
  };

  const handleCopy = () => {
    const payload = { general: general, category: category, documents, raw_api: citizenData };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Merge API response with locally saved payloads — local data wins for non-null values
  const apiGeneral = citizenData?.general_profile || citizenData?.profile || citizenData?.data?.general_profile || {};
  const apiCategory = citizenData?.category_profile || citizenData?.category_data || citizenData?.data?.category_profile || citizenData?.category || {};

  const general = { ...savedGeneral, ...Object.fromEntries(Object.entries(apiGeneral).filter(([,v]) => v != null && v !== '')) };
  const category = { ...savedCategory, ...Object.fromEntries(Object.entries(apiCategory).filter(([,v]) => v != null && v !== '')) };
  const documents = citizenData?.documents || citizenData?.data?.documents || [];
  const submissionId = citizenData?.submission_id || citizenData?.user_id || localStorage.getItem('yogya_user_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-white to-[#fff8f0]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a237e] flex items-center justify-center">
              <span className="text-white font-bold text-xs">य</span>
            </div>
            <span className="font-bold text-[#1a237e] text-base">Yogya</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleLang}
              className="px-3 py-1 rounded-full border-2 border-[#FF6F00] text-[#FF6F00] text-xs font-semibold">
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors"
            >
              <RotateCcw size={12} />
              {l('Start Over', 'फिर से शुरू करें')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1a237e] mb-2">
            {l('Your Profile is Ready!', 'आपकी प्रोफाइल तैयार है!')}
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {l(
              'Your data is being processed by our AI to find the best matching schemes.',
              'हमारा AI आपके लिए सर्वोत्तम मिलती-जुलती योजनाएं खोजने के लिए आपके डेटा की प्रक्रिया कर रहा है।'
            )}
          </p>

          {submissionId && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[#1a237e]/10 text-[#1a237e] text-sm font-semibold">
              <Database size={14} />
              {l('Submission ID:', 'सबमिशन ID:')} {submissionId}
            </div>
          )}
        </motion.div>

        {/* AI Processing notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[#1a237e] to-[#283593] text-white"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🤖</div>
            <div>
              <h3 className="font-bold mb-1">
                {l('AI Analysis in Progress', 'AI विश्लेषण जारी है')}
              </h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                {l(
                  'Our RAG pipeline with Qwen LLM is analyzing your profile against 650+ government scheme documents. Eligible schemes will be presented shortly.',
                  'हमारा RAG पाइपलाइन Qwen LLM के साथ 650+ सरकारी योजना दस्तावेज़ों के विरुद्ध आपकी प्रोफाइल का विश्लेषण कर रहा है। पात्र योजनाएं जल्द प्रस्तुत की जाएंगी।'
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile sections */}
        <div className="space-y-4">
          {/* Basic Info */}
          {Object.keys(general).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <SectionCard title={l('Basic Information', 'बुनियादी जानकारी')} icon={<User size={18} />}>
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <InfoRow label={l('Full Name', 'पूरा नाम')} value={general.full_name} />
                  <InfoRow label={l('Age', 'आयु')} value={general.age} />
                  <InfoRow label={l('Gender', 'लिंग')} value={general.gender} />
                  <InfoRow label={l('Marital Status', 'वैवाहिक स्थिति')} value={general.marital_status} />
                  <InfoRow label={l('State', 'राज्य')} value={general.state} />
                  <InfoRow label={l('District', 'जिला')} value={general.district} />
                  <InfoRow label={l('Area Type', 'क्षेत्र प्रकार')} value={general.area_type} />
                  <InfoRow label={l('Caste Category', 'जाति श्रेणी')} value={general.caste_category} />
                  <InfoRow label={l('Annual Income', 'वार्षिक आय')} value={general.annual_income ? `₹${general.annual_income?.toLocaleString('en-IN')}` : null} />
                  <InfoRow label={l('Employment', 'रोजगार')} value={general.employment_type} />
                  <InfoRow label={l('BPL Card', 'BPL कार्ड')} value={general.bpl_card_holder} />
                  <InfoRow label={l('Disability', 'विकलांगता')} value={general.disability} />
                  <InfoRow label={l('Bank Account Number', 'बैंक खाता नंबर')} value={general.bank_account_number} />
                  <InfoRow label={l('Bank IFSC Code', 'बैंक IFSC कोड')} value={general.bank_ifsc_code} />
                  <InfoRow label={l('Aadhaar Number', 'आधार नंबर')} value={general.aadhaar_number} />
                  <InfoRow label={l('Family Size', 'परिवार का आकार')} value={general.family_size} />
                  <InfoRow label={l('Religion', 'धर्म')} value={general.religion} />
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Category Details */}
          {Object.keys(category).filter(k => !['user_id','__v','_id'].includes(k)).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <SectionCard title={l(`Category Details — ${category.need || savedCategory.need || ''}`, `श्रेणी विवरण — ${category.need || savedCategory.need || ''}`)} icon={<FileText size={18} />}>
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  {Object.entries(category)
                    .filter(([k, v]) => !['user_id', '__v', '_id'].includes(k) && v !== null && v !== undefined && v !== '' && v !== 'null')
                    .map(([k, v]) => (
                      <InfoRow key={k} label={k.replace(/_/g, ' ')} value={v} />
                    ))}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <SectionCard title={l('Uploaded Documents', 'अपलोड किए गए दस्तावेज़')} icon={<FileText size={18} />}>
                <div className="pt-3 space-y-3">
                  {documents.map((doc, i) => (
                    <DocItem key={i} doc={doc} lang={lang} />
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Raw JSON toggle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Code size={18} className="text-[#1a237e]" />
                  <h3 className="font-bold text-gray-800">
                    {l('Raw Data (JSON)', 'रॉ डेटा (JSON)')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {showRaw && citizenData && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a237e]/10 text-[#1a237e] hover:bg-[#1a237e]/20 transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? l('Copied!', 'कॉपी हो गया!') : l('Copy', 'कॉपी करें')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowRaw(s => !s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {showRaw ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showRaw ? l('Hide', 'छिपाएं') : l('View Raw JSON', 'रॉ JSON देखें')}
                  </button>
                </div>
              </div>
              {showRaw && (
                <div className="border-t border-gray-100 px-6 pb-5">
                  <pre className="text-xs bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono leading-relaxed">
                    {citizenData
                      ? JSON.stringify(citizenData, null, 2)
                      : l('No data available yet.', 'अभी कोई डेटा उपलब्ध नहीं है।')}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleStartOver}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1a237e] text-[#1a237e] font-semibold hover:bg-[#1a237e] hover:text-white transition-all"
          >
            <RotateCcw size={16} />
            {l('Start Over', 'फिर से शुरू करें')}
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF6F00] hover:bg-[#E65100] text-white font-bold transition-all"
          >
            🏠 {l('Back to Home', 'होम पर वापस जाएं')}
          </Link>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-8">
          {l('Built by Team Bit_By_Bit for IAR Udaan Hackathon 2026 · AI · GenAI · RAG',
            'IAR उड़ान हैकाथॉन 2026 के लिए टीम योग्य द्वारा निर्मित · AI · GenAI · RAG')}
        </p>
      </div>
    </div>
  );
}

function DocItem({ doc, lang }) {
  const [showText, setShowText] = useState(false);
  const l = (en, hi) => lang === 'en' ? en : hi;

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
        <span className="font-semibold text-gray-700 text-sm capitalize">
          {(doc.doc_type || doc.type || 'document').replace(/_/g, ' ')}
        </span>
      </div>
      {doc.extracted_text && (
        <div>
          <button
            type="button"
            onClick={() => setShowText(s => !s)}
            className="flex items-center gap-1.5 text-xs text-[#1a237e] hover:underline"
          >
            {showText ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {l('View extracted text', 'निकाला गया टेक्स्ट देखें')}
          </button>
          {showText && (
            <div className="mt-2 p-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 font-mono max-h-24 overflow-y-auto">
              {doc.extracted_text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
