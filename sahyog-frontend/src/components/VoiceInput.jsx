import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { transcribeVoice } from '../api';

export default function VoiceInput({ onTranscribed }) {
  const [state, setState] = useState('idle'); // idle | recording | processing | error
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunks.current = [];

      // Pick a MIME type the browser supports
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
        .find(m => MediaRecorder.isTypeSupported(m)) || '';

      mediaRecorder.current = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorder.current.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        stopStream();
        setState('processing');
        try {
          const blob = new Blob(chunks.current, { type: mimeType || 'audio/webm' });
          const { text } = await transcribeVoice(blob);
          if (text?.trim()) {
            onTranscribed(text.trim());
          } else {
            setErrorMsg('No speech detected. Try again.');
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setErrorMsg('Transcription failed. Is the backend running?');
        } finally {
          setState('idle');
        }
      };

      mediaRecorder.current.start(250); // collect chunks every 250ms
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      setState('error');
      setErrorMsg('Microphone access denied.');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    stopStream();
  }, []);

  const handleClick = () => {
    if (state === 'idle' || state === 'error') startRecording();
    else if (state === 'recording') stopRecording();
  };

  return (
    <div className="relative flex items-center flex-shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'processing'}
        title={state === 'recording' ? 'Stop recording' : 'Voice input'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          state === 'recording'
            ? 'bg-red-500 text-white mic-pulse'
            : state === 'processing'
            ? 'bg-amber-100 text-amber-500 cursor-not-allowed'
            : state === 'error'
            ? 'bg-red-100 text-red-400'
            : 'bg-gray-100 hover:bg-[#1a237e]/10 text-gray-500 hover:text-[#1a237e]'
        }`}
      >
        {state === 'processing' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === 'recording' ? (
          <MicOff size={16} />
        ) : (
          <Mic size={16} />
        )}
      </button>

      {/* Recording timer */}
      {state === 'recording' && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
          ● {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </span>
      )}

      {/* Processing label */}
      {state === 'processing' && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
          Transcribing...
        </span>
      )}

      {/* Error toast */}
      {errorMsg && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap z-50 shadow-xl max-w-[200px] text-center leading-relaxed">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
