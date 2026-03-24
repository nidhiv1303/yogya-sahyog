import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import VoiceInput from './VoiceInput';
import SchemeCard from './SchemeCard';
import QuickReplies from './QuickReplies';
import StatsBar from './StatsBar';
import FloatingActionButton from './FloatingActionButton';
import MySchemesDrawer from './MySchemesDrawer';
import { useApp } from '../context/AppContext';
import { sendChatMessage, uploadDocument } from '../api';

const SUGGESTIONS = [
  'I am a farmer looking for subsidies',
  'I need health insurance for my family',
  'I want a loan to start a business',
  'My daughter needs a scholarship',
];

export default function ChatWindow() {
  const { t, messages, addMessage, getUserId, addToast, setMatchedCount, schemesDrawerOpen, setSchemesDrawerOpen, incrementDocsCount } = useApp();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const docsScrollRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg) return;
    setInput('');
    addMessage('user', msg);
    setTyping(true);
    try {
      const { reply, schemes } = await sendChatMessage(getUserId(), msg);
      addMessage('bot', reply, { schemes: schemes || [] });
      if (schemes?.length) {
        setMatchedCount(c => c + schemes.length);
        addToast(`${schemes.length} matching schemes found! 🎉`, 'success');
      }
    } catch {
      addMessage('bot', t.errorGeneric);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleFileUpload = async (file) => {
    addMessage('user', `📎 Uploading: ${file.name}`);
    setTyping(true);
    try {
      const data = await uploadDocument(getUserId(), file, 'chat_upload');
      const text = data?.documents_saved?.[0]?.extracted_text || '';
      addMessage('bot', `✅ **${file.name}** uploaded successfully!\n\n${text ? `Extracted information:\n${text.slice(0, 300)}${text.length > 300 ? '...' : ''}` : 'Document saved to your profile.'}`);
      incrementDocsCount();
      addToast('Document uploaded successfully ✅', 'success');
    } catch {
      addMessage('bot', `❌ Failed to upload ${file.name}. Please try again.`);
      addToast('Upload failed. Please try again.', 'error');
    } finally {
      setTyping(false);
    }
  };

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);
  const handleDrop      = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []); // eslint-disable-line

  const handleTranscribed = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;
  const lastBotMsgIdx = [...messages].reverse().findIndex(m => m.role === 'bot');
  const lastBotId = lastBotMsgIdx >= 0 ? messages[messages.length - 1 - lastBotMsgIdx]?.id : null;

  return (
    <>
      <MySchemesDrawer open={schemesDrawerOpen} onClose={() => setSchemesDrawerOpen(false)} />

      <div
        className="flex flex-col h-full relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(26,35,126,0.88)', backdropFilter: 'blur(10px)' }}
            >
              <div className="text-center text-white">
                <div className="text-5xl mb-3">📄</div>
                <p className="font-bold text-xl">{t.dropOverlay}</p>
                <p className="text-blue-200 text-sm mt-1 font-medium">PDF, JPG, PNG accepted</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-5 py-3.5 flex items-center justify-between rounded-t-[20px]"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.85)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #1a237e, #4f46e5)', boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}
              >
                <span className="text-white font-black text-sm">य</span>
              </div>
              <span className="pulse-glow absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="font-black text-base leading-tight tracking-tight gradient-text">Yogya AI</h2>
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} style={{ color: '#FF6F00' }} />
                <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Powered by RAG + Qwen LLM</span>
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <span className="pulse-glow w-2 h-2 bg-emerald-400 rounded-full inline-block" />
            Online
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar
          onSchemesClick={() => setSchemesDrawerOpen(true)}
          onDocsClick={() => docsScrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: 'rgba(248,249,255,0.35)' }}>
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="floating w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-5"
                style={{ background: 'linear-gradient(135deg, #1a237e, #4f46e5)', boxShadow: '0 12px 40px rgba(79,70,229,0.3)' }}
              >
                <span className="text-white font-black text-3xl">य</span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h3 className="font-black text-xl mb-2 tracking-tight gradient-text">Ask me anything</h3>
                <p className="text-sm max-w-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>
                  Tell me your situation and I'll find every government scheme you qualify for.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map(s => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => send(s)}
                      className="text-xs px-3.5 py-1.5 rounded-full font-medium transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        border: '1.5px solid rgba(26,35,126,0.15)',
                        color: '#1a237e',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={msg.id}>
                  <ChatBubble message={msg} />

                  {/* Scheme cards below bot message */}
                  {msg.role === 'bot' && msg.schemes?.length > 0 && (
                    <div className="ml-11 mb-3 space-y-2">
                      {msg.schemes.map((scheme, si) => (
                        <SchemeCard key={scheme.id} scheme={scheme} index={si} />
                      ))}
                    </div>
                  )}

                  {/* Quick replies only below last bot message */}
                  {msg.role === 'bot' && msg.id === lastBotId && !typing && (
                    <div className="ml-11 mb-3">
                      <QuickReplies onSend={send} />
                    </div>
                  )}
                </div>
              ))}
              {typing && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ── Input area ── */}
        <div
          className="flex-shrink-0 px-4 pb-4 pt-3"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.85)',
          }}
        >
          <div
            className="flex items-end gap-2 rounded-2xl px-3 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.92)',
              border: '1.5px solid rgba(26,35,126,0.1)',
              boxShadow: '0 2px 16px rgba(26,35,126,0.06), inset 0 1px 0 rgba(255,255,255,1)',
            }}
          >
            <VoiceInput onTranscribed={handleTranscribed} />

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t.chatPlaceholder}
              rows={1}
              className="flex-1 resize-none bg-transparent border-none outline-none text-sm py-1.5 max-h-28 leading-relaxed"
              style={{
                color: '#1e293b',
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden',
              }}
            />

            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(26,35,126,0.06)', color: '#1a237e' }}
            >
              <Paperclip size={15} />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => { if (e.target.files[0]) { handleFileUpload(e.target.files[0]); e.target.value = ''; } }}
            />

            <motion.button
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="btn-glow w-10 h-10 flex items-center justify-center disabled:opacity-40"
              style={{ borderRadius: '50%', padding: 0 }}
            >
              <Send size={15} />
            </motion.button>
          </div>

          <p
            className="text-center text-[10px] mt-2 font-medium"
            style={{
              background: 'linear-gradient(90deg, #1a237e, #FF6F00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Drag & drop files here · Powered by RAG + Qwen LLM
          </p>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onUpload={handleFileUpload}
          onRefresh={() => {}}
        />
      </div>
    </>
  );
}
