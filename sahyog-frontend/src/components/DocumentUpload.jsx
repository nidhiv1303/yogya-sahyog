import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { uploadDocument } from '../api';
import { useApp } from '../context/AppContext';

function SuccessCheckmark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <motion.circle
        cx="10" cy="10" r="9"
        stroke="#16a34a" strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.path
        d="M6 10l3 3 5-5"
        stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.35, ease: 'easeOut' }}
      />
    </svg>
  );
}

export default function DocumentUpload({ label, description, doc_type, onUploaded }) {
  const { getUserId, t, addToast, incrementDocsCount } = useApp();
  const [status, setStatus] = useState('idle');
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [extracted, setExtracted] = useState('');
  const [showExtracted, setShowExtracted] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [shake, setShake] = useState(false);

  const processFile = async (file) => {
    setFileName(file.name);
    setStatus('uploading');
    setError('');
    setProgress(0);

    // Show image preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    }

    // Fake progress animation
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 85));
    }, 100);

    try {
      const data = await uploadDocument(getUserId(), file, doc_type);
      clearInterval(progressInterval);
      setProgress(100);
      const text = data?.documents_saved?.[0]?.extracted_text || data?.extracted_text || '';
      setExtracted(text);
      setTimeout(() => {
        setStatus('done');
        addToast(`${label} uploaded successfully ✅`, 'success');
        incrementDocsCount();
        if (onUploaded) onUploaded(doc_type, text);
      }, 200);
    } catch (err) {
      clearInterval(progressInterval);
      setStatus('error');
      setError(err.message || t.uploadFail);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      addToast(`Failed to upload ${label}`, 'error');
    }
  };

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) processFile(accepted[0]);
  }, []); // eslint-disable-line

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'done',
  });

  const reset = (e) => {
    e.stopPropagation();
    setStatus('idle');
    setFileName('');
    setExtracted('');
    setError('');
    setFilePreview(null);
    setProgress(0);
  };

  return (
    <motion.div
      animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden transition-all"
      style={status === 'done' ? {
        background: 'rgba(240,253,244,0.9)',
        border: '1.5px solid rgba(22,163,74,0.3)',
        boxShadow: '0 2px 12px rgba(22,163,74,0.08)',
      } : status === 'error' ? {
        background: 'rgba(254,242,242,0.9)',
        border: '1.5px solid rgba(220,38,38,0.25)',
      } : isDragActive ? {
        background: 'rgba(255,255,255,0.9)',
        border: '1.5px solid rgba(255,111,0,0.5)',
        boxShadow: '0 0 0 3px rgba(255,111,0,0.1)',
      } : {
        background: 'rgba(255,255,255,0.7)',
        border: '1.5px dashed rgba(26,35,126,0.18)',
      }}
    >
      <div className="p-3.5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={status === 'done' ? { background: 'rgba(22,163,74,0.12)' } : { background: 'rgba(26,35,126,0.07)' }}
          >
            {status === 'done'
              ? <SuccessCheckmark />
              : <FileText size={15} style={{ color: '#1a237e' }} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: '#1e293b' }}>{label}</p>
            {description && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{description}</p>}
          </div>
          {status === 'done' && (
            <button onClick={reset} className="p-1 rounded-full hover:bg-black/5 transition-colors" style={{ color: '#94a3b8' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Progress bar during upload */}
        {status === 'uploading' && (
          <div className="mb-2.5">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(26,35,126,0.08)' }}>
              <motion.div
                className="h-full rounded-full shimmer"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #1a237e, #FF6F00)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <p className="text-[10px] mt-1 font-medium" style={{ color: '#1a237e' }}>{t.uploadProcessing}</p>
          </div>
        )}

        {/* Drop zone — idle/error state */}
        {status !== 'done' && (
          <div
            {...getRootProps()}
            className="rounded-xl p-3 text-center transition-all"
            style={{
              background: isDragActive ? 'rgba(255,111,0,0.04)' : 'rgba(26,35,126,0.02)',
              border: '1px dashed rgba(26,35,126,0.12)',
            }}
          >
            <input {...getInputProps()} />
            {status === 'uploading' ? (
              <div className="flex flex-col items-center gap-1.5">
                <Loader2 size={18} className="animate-spin" style={{ color: '#1a237e' }} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Upload size={16} style={{ color: isDragActive ? '#FF6F00' : '#94a3b8' }} />
                </motion.div>
                <p className="text-[11px] font-medium" style={{ color: isDragActive ? '#FF6F00' : '#94a3b8' }}>
                  {isDragActive ? 'Drop here' : t.uploadDrop}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success state */}
        {status === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {/* Image preview */}
            {filePreview && (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={filePreview}
                alt="Preview"
                className="w-full h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>{t.uploadSuccess}</span>
            </div>
            <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{fileName}</p>
            {extracted && (
              <div>
                <button
                  onClick={() => setShowExtracted(s => !s)}
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: '#1a237e' }}
                >
                  {showExtracted ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  {t.viewExtracted}
                </button>
                <AnimatePresence>
                  {showExtracted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-1.5 p-2.5 rounded-xl text-[10px] max-h-24 overflow-y-auto leading-relaxed font-mono"
                        style={{ background: 'rgba(26,35,126,0.04)', color: '#475569', border: '1px solid rgba(26,35,126,0.07)' }}
                      >
                        {extracted}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs mt-1.5"
          >
            <AlertCircle size={12} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span style={{ color: '#dc2626' }}>{error}</span>
            <button onClick={reset} className="underline ml-1 font-semibold" style={{ color: '#1a237e' }}>Retry</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
