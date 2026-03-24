import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Globe, Search, ArrowLeft, Sun, Moon, Bell, CheckCircle2 } from 'lucide-react';

/* ── MOCK DATA ── */
const DEFAULT_SCHEME = {
  id: 'pm-kisan',
  name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
  match: 95,
  description: 'An initiative by the Government of India in which all farmers will get up to ₹6,000 per year as minimum income support.',
  benefits: ['₹6,000 per year in 3 equal installments.', 'Direct Benefit Transfer (DBT) to bank account.', 'Financial support for agricultural needs.'],
  documents: ['Aadhaar Card', 'Land holding papers (7/12 extract)', 'Bank account details (linked with Aadhaar)', 'Passport size photo'],
  faqs: [
    { q: 'Who is eligible?', a: 'All landholding farmer families with cultivable land holding.' },
    { q: 'When is the installment given?', a: 'Every 4 months (April-July, Aug-Nov, Dec-March).' }
  ]
};

const MOCK_MATCHES = [
  DEFAULT_SCHEME,
  { id: 'ayushman', name: 'Ayushman Bharat PM-JAY', match: 88, description: 'Health insurance cover of up to ₹5 lakh per family per year.', benefits: ['₹5 Lakh cover', 'Cashless treatment'], documents: ['Aadhaar', 'Income Certificate'] },
  { id: 'mudra', name: 'PMMY (Mudra Loan)', match: 72, description: 'Loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.', benefits: ['Up to ₹10L loan', 'No collateral'], documents: ['Aadhaar', 'Business Plan'] }
];


// ── DASHBOARD LAYOUT ROOT ──
export default function Dashboard() {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');
  
  // States: 'default', 'results', 'detail'
  const [middleState, setMiddleState] = useState('default'); 
  const [selectedScheme, setSelectedScheme] = useState(DEFAULT_SCHEME);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Namaste! I am Yogya AI. How can I assist you with government schemes today?' }
  ]);

  const handleSimulateChatMatch = () => {
    // Simulate AI returning schemes
    setChatMessages(prev => [
      ...prev, 
      { role: 'user', text: 'I am a farmer looking for support.' },
      { role: 'bot', text: 'I found 3 matching schemes for you based on your profile as a farmer. Check the middle section for details.', hasSchemes: true }
    ]);
    setMiddleState('results');
  };

  const handleViewScheme = (scheme) => {
    setSelectedScheme(scheme);
    setMiddleState('detail');
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0F172A] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      
      {/* ── TOP NAVBAR ── */}
      <header className={`h-16 flex items-center justify-between px-6 border-b transition-colors ${theme === 'dark' ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#147B5D] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">य</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Yogya<span className="text-[#147B5D]">.</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${theme === 'dark' ? 'border-[#334155] hover:bg-[#334155]' : 'border-[#E2E8F0] hover:bg-[#F1F5F9]'}`}>
            <Globe size={16} /> {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
          
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-[#334155]' : 'hover:bg-[#F1F5F9]'}`}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-[#334155]' : 'hover:bg-[#F1F5F9]'}`}>
             <Bell size={20} />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#147B5D] to-[#10b981] shadow-inner ml-2 border-2 border-[#147B5D]/20 cursor-pointer" />
        </div>
      </header>

      {/* ── 3 COLUMN LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. LEFT COLUMN - Nav & Search */}
        <aside className={`w-[260px] flex-shrink-0 flex flex-col p-5 border-r transition-colors ${theme === 'dark' ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}>
           <div className={`relative flex items-center px-4 py-2.5 rounded-xl border transition-colors ${theme === 'dark' ? 'border-[#334155] bg-[#1E293B]' : 'border-[#CBD5E1] bg-white'}`}>
             <Search size={18} className="text-[#64748B] mr-2" />
             <input 
               type="text" 
               placeholder="Search schemes..." 
               className="bg-transparent border-none outline-none w-full text-sm text-inherit placeholder-[#94A3B8]"
             />
           </div>

           <div className="mt-8 flex-1">
             <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4 px-2">Saved Folders</h4>
             <ul className="space-y-1">
               {['Agri Subsidies', 'Health Insurance', 'Startup Loans'].map(item => (
                 <li key={item} className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-[#1E293B] text-[#94A3B8]' : 'hover:bg-[#F1F5F9] text-[#64748B]'}`}>
                   📁 {item}
                 </li>
               ))}
             </ul>
           </div>
           
           <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-[#147B5D]/30 bg-[#147B5D]/10' : 'border-[#147B5D]/20 bg-[#147B5D]/5'}`}>
             <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#147B5D] pulse-glow"></span>
                <span className="text-xs font-bold text-[#147B5D] uppercase">Profile 80%</span>
             </div>
             <p className={`text-xs ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Complete your profile to get perfect AI matches.</p>
           </div>
        </aside>

        {/* 2. MIDDLE COLUMN - Content Engine */}
        <main className={`flex-1 flex flex-col overflow-y-auto relative ${theme === 'dark' ? 'bg-[#0B1121]' : 'bg-[#F1F5F9]'}`}>
          <div className="max-w-4xl w-full mx-auto p-8">
            <AnimatePresence mode="wait">
              {middleState === 'default' && (
                <MiddleDefaultView key="default" scheme={DEFAULT_SCHEME} onSimulateChat={handleSimulateChatMatch} theme={theme} />
              )}
              {middleState === 'results' && (
                <MiddleResultsView key="results" schemes={MOCK_MATCHES} onView={handleViewScheme} theme={theme} />
              )}
              {middleState === 'detail' && (
                <MiddleDetailView key="detail" scheme={selectedScheme} onBack={() => setMiddleState('results')} theme={theme} />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* 3. RIGHT COLUMN - Yogya AI Chatbot */}
        <aside className={`w-[360px] flex-shrink-0 flex flex-col border-l transition-colors relative ${theme === 'dark' ? 'border-[#334155] bg-[#1E293B]' : 'border-[#E2E8F0] bg-white'}`}>
           <RightChatBot 
             messages={chatMessages} 
             theme={theme} 
             onSimulateMatch={handleSimulateChatMatch}
           />
        </aside>

      </div>
    </div>
  );
}

/* ─── MIDDLE VIEWS ─── */

function MiddleDefaultView({ scheme, onSimulateChat, theme }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="w-full">
       <div className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-6 ${theme === 'dark' ? 'bg-orange-900/40 text-[#D97706]' : 'bg-orange-100 text-[#D97706]'}`}>
         🔥 Trending Scheme
       </div>
       <h1 className="text-3xl font-bold mb-4">{scheme.name}</h1>
       <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>{scheme.description}</p>
       
       <div className={`p-6 rounded-2xl mb-8 border ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
         <h3 className="text-base font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="text-[#147B5D]" size={20} /> Key Benefits</h3>
         <ul className="space-y-3">
           {scheme.benefits.map((b,i) => (
             <li key={i} className={`flex items-start gap-3 text-sm ${theme === 'dark' ? 'text-[#CBD5E1]' : 'text-[#4B5563]'}`}>
               <div className="w-1.5 h-1.5 rounded-full bg-[#147B5D] mt-1.5 flex-shrink-0" /> {b}
             </li>
           ))}
         </ul>
       </div>

       <div className="grid grid-cols-2 gap-6 mb-8">
         <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
            <h4 className="font-bold text-sm mb-3">General Documents</h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              {scheme.documents.map((d,i) => <li key={i}>• {d}</li>)}
            </ul>
         </div>
         <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
            <h4 className="font-bold text-sm mb-3">Quick FAQ</h4>
            <div className="space-y-3">
              {scheme.faqs.map((f,i) => (
                <div key={i}>
                  <p className="text-xs font-semibold mb-0.5">{f.q}</p>
                  <p className="text-xs text-[#64748B]">{f.a}</p>
                </div>
              ))}
            </div>
         </div>
       </div>

       <button onClick={onSimulateChat} className="btn-glow px-6 py-3 w-full sm:w-auto">
         Talk to Yogya to verify your eligibility
       </button>
    </motion.div>
  )
}

function MiddleResultsView({ schemes, onView, theme }) {
  // Simulating smart classification: Top 2 best for you
  const topMatches = schemes.slice(0, 2);
  const otherMatches = schemes.slice(2);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full">
      <h2 className="text-2xl font-bold mb-2">Yogya found {schemes.length} schemes for you</h2>
      <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Based on your profile, we processed 650+ documents and found these exact matches.</p>
      
      <div className="mb-8">
        <h3 className="text-xs font-bold text-[#147B5D] uppercase tracking-wider mb-4 flex items-center gap-2">
          🌟 Top 2 Best For You
        </h3>
        <div className="space-y-4">
          {topMatches.map(s => (
            <div key={s.id} onClick={() => onView(s)} 
                 className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group ${theme === 'dark' ? 'bg-[#1E293B] border-[#147B5D]/40' : 'bg-white border-[#147B5D]/30 shadow-sm'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#147B5D]/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h4 className="text-lg font-bold">{s.name}</h4>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#147B5D]/10 text-[#147B5D]">{s.match}% Match</span>
              </div>
              <p className={`text-sm line-clamp-2 relative z-10 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {otherMatches.length > 0 && (
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${theme === 'dark' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>Other Eligible Options</h3>
          <div className="space-y-4">
            {otherMatches.map(s => (
              <div key={s.id} onClick={() => onView(s)} 
                   className={`p-5 rounded-xl border cursor-pointer transition-colors ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155] hover:border-[#4B5563]' : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'}`}>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-base font-semibold">{s.name}</h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{s.match}% Match</span>
                </div>
                <p className={`text-xs line-clamp-1 truncate ${theme === 'dark' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function MiddleDetailView({ scheme, onBack, theme }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full pb-10">
       <button onClick={onBack} className={`flex items-center gap-2 text-sm font-semibold mb-6 transition-colors ${theme === 'dark' ? 'text-[#94A3B8] hover:text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
         <ArrowLeft size={16} /> Back to results
       </button>

       <h1 className="text-3xl font-bold mb-3">{scheme.name}</h1>
       <div className="flex items-center gap-3 mb-8">
         <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#147B5D]/10 text-[#147B5D]">{scheme.match}% Profile Match</span>
         <span className={`text-sm ${theme === 'dark' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>Verified source clause: Sec 4.2</span>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle2 className="text-[#147B5D]" size={16} /> Eligibility Criteria</h3>
            <ul className="space-y-4">
              {['Must be a resident of India.', 'Landholding up to 2 hectares (Small/Marginal).', 'Valid Aadhaar and linked bank account.', 'Not an institutional landholder or high-income earner.'].map((r,i) => (
                <li key={i} className={`flex gap-3 text-sm leading-relaxed ${theme === 'dark' ? 'text-[#CBD5E1]' : 'text-[#4B5563]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#147B5D] mt-1.5 flex-shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">📄 Documents Required</h3>
            <ul className="space-y-4">
              {scheme.documents.map((d,i) => (
                 <li key={i} className={`flex gap-3 text-sm items-center justify-between ${theme === 'dark' ? 'text-[#CBD5E1]' : 'text-[#4B5563]'}`}>
                   <span>• {d}</span>
                   {i === 0 ? <span className="text-[10px] uppercase font-bold text-[#147B5D] bg-[#147B5D]/10 px-2 py-0.5 rounded">Uploaded</span> : <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">Missing</span>}
                 </li>
              ))}
            </ul>
          </div>
       </div>

       <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0F172A] border-[#147B5D]/30' : 'bg-[#F8FAFC] border-[#147B5D]/20'}`}>
         <h3 className="font-bold mb-2">Ready to apply?</h3>
         <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>You have 1 of 4 required documents uploaded. Use the AI chat to upload the rest and we'll auto-fill your application.</p>
         <button className="btn-glow px-6 py-2.5 text-sm">Start Application Process</button>
       </div>
    </motion.div>
  )
}

/* ─── RIGHT CHATBOT (YOGYA AI) ─── */

function RightChatBot({ messages, theme, onSimulateMatch }) {
  const [inputTitle, setInputTitle] = useState('');
  const [chatLang, setChatLang] = useState('EN');

  return (
    <div className="flex flex-col h-full w-full relative">
       {/* Chat Header */}
       <div className={`px-5 py-4 border-b flex items-center justify-between shadow-sm z-10 ${theme === 'dark' ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex items-center gap-3">
             <div className="relative">
                <div className="w-9 h-9 bg-[#147B5D] rounded-full flex items-center justify-center shadow-md">
                   <span className="text-white font-bold text-sm">य</span>
                </div>
                <span className="pulse-glow absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
             </div>
             <div>
                <h3 className="font-bold text-sm">Yogya AI</h3>
                <span className="text-[10px] font-medium text-[#147B5D] bg-[#147B5D]/10 px-1.5 py-0.5 rounded-full inline-block mt-0.5">Online</span>
             </div>
          </div>
       </div>

       {/* Floating Popup Demo */}
       <div className="absolute top-20 left-4 right-4 z-20">
         <div className={`p-3 rounded-xl border text-xs shadow-lg animate-bounce ${theme === 'dark' ? 'bg-[#0F172A] border-[#D97706]/40 text-[#CBD5E1]' : 'bg-[#FFF8F0] border-[#D97706]/30 text-[#0F172A]'}`}>
            <strong className="text-[#D97706] block mb-1">Scholarship Structure Classification</strong>
            AI identified potential student status. Upload marksheet for classification.
         </div>
       </div>

       {/* Messages Area */}
       <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-[#0B1121]' : 'bg-[#F8FAFC]'}`}>
          <div className="pt-16" /> {/* Spacer for popup */}
          {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                   m.role === 'user' 
                    ? 'bg-[#147B5D] text-white rounded-br-sm' 
                    : theme === 'dark' ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#334155] rounded-bl-sm' : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-sm'
                }`}>
                   {m.text}
                   {m.hasSchemes && (
                     <div className={`mt-3 p-2 rounded-lg text-xs font-bold text-center border cursor-pointer hover:bg-opacity-80 transition-colors ${theme === 'dark' ? 'bg-[#0F172A] border-[#147B5D]/40 text-[#147B5D]' : 'bg-[#F1F5F9] border-[#147B5D]/30 text-[#147B5D]'}`}>
                       View Matches (Middle Area)
                     </div>
                   )}
                </div>
             </div>
          ))}
       </div>

       {/* Input Area */}
       <div className={`p-4 border-t ${theme === 'dark' ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className={`flex items-end gap-2 rounded-2xl px-2 py-2 border focus-within:ring-2 focus-within:ring-[#147B5D]/30 transition-shadow ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : 'bg-[#F8FAFC] border-[#CBD5E1]'}`}>
             
             {/* Chat Lang Toggle */}
             <button 
               onClick={() => setChatLang(l => l === 'EN' ? 'HI' : 'EN')}
               className={`h-8 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-colors ${theme === 'dark' ? 'bg-[#334155] text-white hover:bg-[#475569]' : 'bg-[#E2E8F0] text-[#0F172A] hover:bg-[#CBD5E1]'}`}>
                {chatLang}
             </button>

             {/* Voice Input */}
             <button className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${theme === 'dark' ? 'text-[#94A3B8] hover:text-white hover:bg-[#334155]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'}`}>
               <Mic size={16} />
             </button>

             <textarea 
               value={inputTitle}
               onChange={e => setInputTitle(e.target.value)}
               placeholder="Type in English or Hindi..."
               rows={1}
               className="flex-1 resize-none bg-transparent border-none outline-none text-sm py-1.5 text-inherit placeholder-[#94A3B8]"
             />

             {/* Send Button */}
             <button 
               onClick={() => {
                 onSimulateMatch();
                 setInputTitle('');
               }}
               className="btn-glow w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
               <Send size={14} className="ml-0.5" />
             </button>
          </div>
       </div>
    </div>
  )
}
