import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Copy, Volume2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatMessage(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j} className="font-semibold" style={{ color: '#1a237e' }}>{p.slice(2, -2)}</strong>
        : p
    );
    return <span key={i}>{formatted}{i < lines.length - 1 ? <br /> : null}</span>;
  });
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function HoverActions({ content, messageId }) {
  const { addToast, language } = useApp();
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      addToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(content.replace(/\*\*/g, ''));
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (language === 'hi' && hindiVoice) utt.voice = hindiVoice;
    else if (englishVoice) utt.voice = englishVoice;
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
    addToast('Reading aloud...', 'info');
  };

  const handleReact = (type) => {
    setReaction(type);
    addToast(type === 'up' ? '👍 Thanks for the feedback!' : '👎 We\'ll improve this', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1 mb-1"
    >
      {[
        { icon: reaction === 'up' ? <ThumbsUp size={11} style={{ fill: '#1a237e', color: '#1a237e' }} /> : <ThumbsUp size={11} />, action: () => handleReact('up'), title: 'Helpful' },
        { icon: reaction === 'down' ? <ThumbsDown size={11} style={{ fill: '#dc2626', color: '#dc2626' }} /> : <ThumbsDown size={11} />, action: () => handleReact('down'), title: 'Not helpful' },
        { icon: copied ? <Check size={11} style={{ color: '#16a34a' }} /> : <Copy size={11} />, action: handleCopy, title: 'Copy' },
        { icon: <Volume2 size={11} />, action: handleSpeak, title: 'Read aloud' },
      ].map((btn, i) => (
        <button
          key={i}
          title={btn.title}
          onClick={btn.action}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(26,35,126,0.1)', color: '#64748b' }}
        >
          {btn.icon}
        </button>
      ))}
    </motion.div>
  );
}

export { formatMessage };

export default function ChatBubble({ message }) {
  const [hovered, setHovered] = useState(false);
  const isBot = message.role === 'bot';

  if (isBot) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -14, y: 6 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start gap-3 mb-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md mt-0.5"
          style={{
            background: 'linear-gradient(135deg, #1a237e, #4f46e5)',
            boxShadow: '0 2px 12px rgba(79,70,229,0.35)',
          }}
        >
          <span className="text-white font-bold text-xs">य</span>
        </div>

        <div className="flex flex-col gap-0.5 max-w-[82%]">
          <span className="text-xs font-bold pl-1 tracking-tight gradient-text">Yogya AI</span>

          {/* Hover toolbar */}
          <AnimatePresence>
            {hovered && <HoverActions content={message.content} messageId={message.id} />}
          </AnimatePresence>

          <div className="glass-bubble px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal" style={{ color: '#334155' }}>
              {formatMessage(message.content)}
            </p>
          </div>
          <span className="text-[10px] pl-1" style={{ color: '#94a3b8' }}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 14, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end mb-3"
    >
      <div className="flex flex-col items-end gap-0.5 max-w-[75%]">
        <div
          className="px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, #FF6F00, #FF8F00)',
            borderRadius: '18px 18px 4px 18px',
            boxShadow: '0 4px 16px rgba(255,111,0,0.28)',
          }}
        >
          <p className="text-sm text-white leading-relaxed font-medium">{message.content}</p>
        </div>
        <div className="flex items-center gap-1 pr-1">
          <span className="text-[10px]" style={{ color: '#94a3b8' }}>{formatTimestamp(message.timestamp)}</span>
          <span className="text-[10px]" style={{ color: '#3b82f6' }}>✓✓</span>
        </div>
      </div>
    </motion.div>
  );
}
