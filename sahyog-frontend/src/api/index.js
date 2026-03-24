const BASE = 'http://localhost:3000';

const post = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// Accepts { firebase_uid, email, username, phone, state_residence, language_pref }
export const registerUser = (data) =>
  post('/api/auth/register', data);

export const saveGeneralInfo = (data) =>
  post('/api/profile/general', data);

export const saveCategoryDetails = (data) =>
  post('/api/profile/category', data);

export const uploadDocument = async (user_id, file, doc_type) => {
  const form = new FormData();
  form.append('user_id', user_id);
  form.append('files', file);
  form.append('doc_type', doc_type || 'document');
  const res = await fetch(`${BASE}/api/profile/documents`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
  return res.json();
};

export const getCitizenData = async (user_id) => {
  const res = await fetch(`${BASE}/api/citizen-data/${user_id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// Chat — mocked until RAG teammate connects endpoint
const MOCK_REPLIES = [
  {
    keywords: ['farmer', 'kisan', 'agriculture', 'crop', 'खेती', 'किसान'],
    reply: `Based on your agriculture profile, here are schemes you may qualify for:\n\n**PM-KISAN** — ₹6,000/year direct benefit transfer to farmer families\n\n**Pradhan Mantri Fasal Bima Yojana** — Crop insurance at subsidised premiums\n\n**PM Krishi Sinchai Yojana** — Irrigation subsidies and water conservation\n\n**Kisan Credit Card** — Flexible credit up to ₹3 lakh at 4% interest\n\nPlease complete your agriculture details in the profile panel for precise matching.`,
  },
  {
    keywords: ['education', 'student', 'scholarship', 'school', 'college', 'पढ़ाई', 'शिक्षा'],
    reply: `For education, you may be eligible for:\n\n**National Scholarship Portal** — Merit and means-based scholarships\n\n**PM Vidya Lakshmi** — Education loans up to ₹10 lakh at low interest\n\n**Beti Bachao Beti Padhao** — Schemes for girl child education\n\n**Pre/Post Matric Scholarship** — For SC/ST/OBC students\n\nShare your income details and caste category for better matching.`,
  },
  {
    keywords: ['health', 'hospital', 'ayushman', 'medical', 'स्वास्थ्य', 'अस्पताल'],
    reply: `Health-related schemes you may qualify for:\n\n**Ayushman Bharat PM-JAY** — Free hospital cover up to ₹5 lakh/family/year\n\n**Pradhan Mantri Suraksha Bima** — Accident insurance ₹2 lakh for ₹20/year\n\n**Janani Suraksha Yojana** — Cash benefit for institutional delivery\n\n**ABHA Health ID** — Digital health record for all government hospitals\n\nPlease share your income and family details for eligibility confirmation.`,
  },
  {
    keywords: ['house', 'home', 'housing', 'pmay', 'ghar', 'घर', 'मकान'],
    reply: `Housing schemes you may be eligible for:\n\n**PM Awas Yojana (Urban)** — Subsidy up to ₹2.67 lakh on home loans\n\n**PM Awas Yojana (Rural)** — ₹1.2–1.3 lakh for rural house construction\n\n**Rajiv Awas Yojana** — Affordable housing for urban poor\n\nUpdate your housing details in your profile for precise eligibility check.`,
  },
  {
    keywords: ['job', 'employment', 'skill', 'work', 'rojgar', 'रोजगार', 'काम'],
    reply: `Employment and skill development schemes:\n\n**PM Kaushal Vikas Yojana** — Free skill training + certification\n\n**NREGA** — 100 days guaranteed rural employment ₹220+/day\n\n**PM Rozgar Protsahan Yojana** — Employer contribution subsidy\n\n**Startup India** — If interested in self employment\n\nShare your qualification and location for best matches.`,
  },
  {
    keywords: ['business', 'loan', 'msme', 'startup', 'व्यवसाय', 'लोन'],
    reply: `Business and entrepreneurship schemes:\n\n**PM Mudra Yojana** — Loans ₹10,000 to ₹10 lakh (no collateral)\n\n**Startup India** — Tax exemptions, fast-track registration\n\n**Stand-Up India** — ₹10 lakh to ₹1 crore for SC/ST/Women entrepreneurs\n\n**CGTMSE** — Credit guarantee for MSME loans\n\nShare your business type and turnover for accurate results.`,
  },
];

const DEFAULT_REPLY = `Thank you for sharing that. I'm analyzing your profile against 650+ government schemes in our database.\n\nTo give you the most accurate results, please:\n\n1. **Complete your profile** in the left panel (tap My Profile)\n2. **Upload your documents** — Aadhaar, income certificate\n3. **Select your need category** — education, health, housing, etc.\n\nThe more details you share, the better I can match schemes for you. What specific area are you looking for help in?`;

export const sendChatMessage = async (user_id, message) => {
  const { getSchemesForMessage } = await import('../utils/mockSchemes.js');
  return new Promise((resolve) => {
    const lower = message.toLowerCase();
    const matched = MOCK_REPLIES.find(r =>
      r.keywords.some(k => lower.includes(k))
    );
    const schemes = getSchemesForMessage(message);
    setTimeout(() => {
      resolve({ reply: matched ? matched.reply : DEFAULT_REPLY, schemes });
    }, 1200 + Math.random() * 800);
  });
};

export const transcribeVoice = async (audioBlob) => {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');
  const res = await fetch(`${BASE}/api/voice/transcribe`, {
    method: 'POST',
    body: form,
  });
  return res.json();
};
