import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { uploadDocument } from '../../utils/api';

function DocUpload({ label, hint, docType, userId, lang, onUploaded }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [showText, setShowText] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const l = (en, hi) => lang === 'en' ? en : hi;

  const handleFile = async (file) => {
    setFileName(file.name);
    setStatus('uploading');
    setErrorMsg('');

    const fd = new FormData();
    fd.append('user_id', userId);
    fd.append('doc_type', docType);
    fd.append('file', file);

    try {
      const { data } = await uploadDocument(fd);
      const extracted = data.documents_saved?.[0]?.extracted_text || data.extracted_text || '';
      setExtractedText(extracted);
      setStatus('done');
      if (onUploaded) onUploaded(docType, extracted);
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err.response?.data?.message ||
        l('Upload failed. Please try again.', 'अपलोड विफल। कृपया पुनः प्रयास करें।')
      );
    }
  };

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) handleFile(accepted[0]);
  }, [userId, docType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'done',
  });

  return (
    <div className="border-2 rounded-2xl overflow-hidden transition-all bg-white"
      style={{ borderColor: status === 'done' ? '#22c55e' : status === 'error' ? '#ef4444' : '#e5e7eb' }}>
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 flex items-start gap-3">
        <FileText size={20} className="text-[#1a237e] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">{label}</h4>
          {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
          <p className="text-xs text-gray-400 mt-1">{l('Accepted: PDF, JPG, PNG', 'स्वीकृत: PDF, JPG, PNG')}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div className="px-5 py-4">
        {status !== 'done' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-[#1a237e] bg-[#1a237e]/5' : 'border-gray-200 hover:border-[#1a237e]/50 hover:bg-gray-50'
            } ${status === 'uploading' ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            {status === 'uploading' ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="text-[#1a237e] animate-spin" />
                <p className="text-sm text-[#1a237e] font-medium">
                  {l('Processing document...', 'दस्तावेज़ संसाधित हो रहा है...')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? l('Drop the file here', 'फ़ाइल यहां छोड़ें')
                    : l('Drag & drop or click to upload', 'खींचें & छोड़ें या अपलोड करने के लिए क्लिक करें')}
                </p>
                {fileName && <p className="text-xs text-gray-400">{fileName}</p>}
              </div>
            )}
          </div>
        )}

        {/* Success state */}
        {status === 'done' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-700">
                  {l('Document processed successfully', 'दस्तावेज़ सफलतापूर्वक संसाधित')}
                </p>
                <p className="text-xs text-green-600 truncate">{fileName}</p>
              </div>
            </div>

            {extractedText && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowText(!showText)}
                  className="flex items-center gap-2 text-xs text-[#1a237e] font-medium hover:underline"
                >
                  {showText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {l('View extracted text', 'निकाला गया टेक्स्ट देखें')}
                </button>
                <AnimatePresence>
                  {showText && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 max-h-32 overflow-y-auto font-mono leading-relaxed">
                        {extractedText}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{errorMsg}</p>
              <button
                type="button"
                onClick={() => { setStatus('idle'); setFileName(''); }}
                className="text-xs underline mt-1"
              >
                {l('Try again', 'पुनः प्रयास करें')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Step5Documents({ needCategory, userId, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;

  const commonDocs = [
    { label: l('Aadhaar Card', 'आधार कार्ड'), hint: l('Upload front side of your Aadhaar card', 'अपने आधार कार्ड का फ्रंट साइड अपलोड करें'), docType: 'aadhaar' },
    { label: l('PAN Card (optional)', 'PAN कार्ड (वैकल्पिक)'), hint: l('Upload your PAN card', 'अपना PAN कार्ड अपलोड करें'), docType: 'pan' },
    { label: l('Income Certificate', 'आय प्रमाण पत्र'), hint: l('Upload income certificate from tahsildar', 'तहसीलदार से आय प्रमाण पत्र अपलोड करें'), docType: 'income_certificate' },
  ];

  const categoryDocs = {
    education: [
      { label: l('Marksheet / Transcripts', 'मार्कशीट / ट्रांसक्रिप्ट'), hint: l('Latest marksheet', 'नवीनतम मार्कशीट'), docType: 'marksheet' },
      { label: l('Admission / Bonafide Certificate', 'प्रवेश / बोनाफाइड प्रमाणपत्र'), hint: l('Current enrollment certificate', 'वर्तमान नामांकन प्रमाणपत्र'), docType: 'bonafide' },
      { label: l('Caste Certificate (if SC/ST/OBC)', 'जाति प्रमाण पत्र (SC/ST/OBC के लिए)'), hint: l('Required for reserved category scholarships', 'आरक्षित श्रेणी छात्रवृत्ति के लिए आवश्यक'), docType: 'caste_certificate' },
    ],
    agriculture: [
      { label: l('Land Record / Khata / Patta', 'भूमि रिकॉर्ड / खाता / पट्टा'), hint: l('Official land ownership document', 'आधिकारिक भूमि स्वामित्व दस्तावेज़'), docType: 'land_record' },
      { label: l('Kisan Credit Card', 'किसान क्रेडिट कार्ड'), hint: l('If you have a KCC', 'यदि आपके पास KCC है'), docType: 'kisan_credit_card' },
      { label: l('Caste Certificate (if SC/ST)', 'जाति प्रमाण पत्र (SC/ST के लिए)'), hint: l('For reserved category benefits', 'आरक्षित श्रेणी लाभ के लिए'), docType: 'caste_certificate' },
    ],
    health: [
      { label: l('Ration Card', 'राशन कार्ड'), hint: l('BPL or APL ration card', 'BPL या APL राशन कार्ड'), docType: 'ration_card' },
      { label: l('Medical Certificate (optional)', 'चिकित्सा प्रमाणपत्र (वैकल्पिक)'), hint: l('For specific health conditions', 'विशिष्ट स्वास्थ्य स्थितियों के लिए'), docType: 'medical_certificate' },
    ],
    housing: [
      { label: l('Address Proof', 'पते का प्रमाण'), hint: l('Utility bill or voter ID', 'बिजली बिल या मतदाता ID'), docType: 'address_proof' },
      { label: l('Land Ownership Document', 'भूमि स्वामित्व दस्तावेज़'), hint: l('Plot or land documents', 'प्लॉट या भूमि दस्तावेज़'), docType: 'land_ownership' },
    ],
    social_welfare: [
      { label: l('Death Certificate of Spouse (if widow)', 'पति/पत्नी का मृत्यु प्रमाणपत्र (विधवा के लिए)'), hint: l('Required for widow pension schemes', 'विधवा पेंशन योजनाओं के लिए आवश्यक'), docType: 'death_certificate' },
      { label: l('Caste Certificate', 'जाति प्रमाण पत्र'), hint: l('For caste-based welfare schemes', 'जाति-आधारित कल्याण योजनाओं के लिए'), docType: 'caste_certificate' },
      { label: l('Birth Certificate', 'जन्म प्रमाण पत्र'), hint: l('For age verification', 'आयु सत्यापन के लिए'), docType: 'birth_certificate' },
    ],
    business: [
      { label: l('Udyam / MSME Certificate', 'उद्यम / MSME प्रमाणपत्र'), hint: l('MSME registration certificate', 'MSME पंजीकरण प्रमाणपत्र'), docType: 'udyam_certificate' },
      { label: l('GST Certificate', 'GST प्रमाणपत्र'), hint: l('GST registration certificate', 'GST पंजीकरण प्रमाणपत्र'), docType: 'gst_certificate' },
      { label: l('Bank Statement (last 6 months)', 'बैंक स्टेटमेंट (पिछले 6 महीने)'), hint: l('Recent bank account statement', 'हाल का बैंक खाता विवरण'), docType: 'bank_statement' },
    ],
    jobs: [
      { label: l('Degree / Skill Certificate', 'डिग्री / कौशल प्रमाणपत्र'), hint: l('Highest educational certificate', 'उच्चतम शैक्षिक प्रमाणपत्र'), docType: 'degree_certificate' },
      { label: l('Resume (PDF)', 'रेज़्यूमे (PDF)'), hint: l('Your latest resume', 'आपका नवीनतम रेज़्यूमे'), docType: 'resume' },
    ],
  };

  const extraDocs = categoryDocs[needCategory] || [];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <p className="font-semibold mb-1">
          {l('Important: Document Upload', 'महत्वपूर्ण: दस्तावेज़ अपलोड')}
        </p>
        <p className="text-xs leading-relaxed">
          {l(
            'Upload clear photos or PDFs of your documents. Our AI will extract information automatically to verify your eligibility.',
            'अपने दस्तावेज़ों की स्पष्ट फ़ोटो या PDF अपलोड करें। हमारा AI पात्रता सत्यापित करने के लिए स्वचालित रूप से जानकारी निकालेगा।'
          )}
        </p>
      </div>

      {/* Common Documents */}
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1a237e] text-white text-xs flex items-center justify-center">1</span>
          {l('Common Documents (Required for All)', 'सामान्य दस्तावेज़ (सभी के लिए आवश्यक)')}
        </h3>
        <div className="space-y-4">
          {commonDocs.map((doc) => (
            <DocUpload key={doc.docType} {...doc} userId={userId} lang={lang} />
          ))}
        </div>
      </div>

      {/* Category-specific documents */}
      {extraDocs.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FF6F00] text-white text-xs flex items-center justify-center">2</span>
            {l('Category-Specific Documents', 'श्रेणी-विशिष्ट दस्तावेज़')}
          </h3>
          <div className="space-y-4">
            {extraDocs.map((doc) => (
              <DocUpload key={doc.docType} {...doc} userId={userId} lang={lang} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
