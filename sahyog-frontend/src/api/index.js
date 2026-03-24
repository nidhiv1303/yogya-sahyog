const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

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

export const sendChatMessage = async (user_id, message) => {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return { reply: data.reply || '', schemes: data.schemes || [] };
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
