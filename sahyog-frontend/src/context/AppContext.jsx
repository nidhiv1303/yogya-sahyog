import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AppContext = createContext();

export const translations = {
  en: {
    appName: 'Yogya', appTagline: 'AI Government Scheme Navigator',
    home: 'Home', findSchemes: 'Find Schemes', dashboard: 'Dashboard',
    welcomeTitle: 'Welcome to Yogya', welcomeSubtitle: 'Your AI guide to government schemes',
    emailPlaceholder: 'Enter your email address', continueBtn: 'Continue',
    chatGreeting: `Namaste! 🙏 I am Yogya, your personal AI guide for government schemes.\n\nTell me about your situation in your own words — where you live, your occupation, your family situation, or what kind of help you are looking for. I will find all the schemes you qualify for.`,
    chatPlaceholder: 'Type your situation or ask anything...',
    sendBtn: 'Send', voiceBtn: 'Voice', uploadBtn: 'Upload',
    profileTitle: 'My Profile', documentsTitle: 'Documents',
    completeProfile: 'Complete Profile', profileComplete: 'Profile Complete',
    language: 'हिंदी',
    errorGeneric: 'Something went wrong. Please try again.',
    errorEmail: 'Please enter a valid email address',
    uploadDrop: 'Drag & drop or click to upload',
    uploadProcessing: 'Processing document...',
    uploadSuccess: 'Document processed successfully',
    uploadFail: 'Upload failed. Try again.',
    viewExtracted: 'View extracted text',
    typing: 'Yogya is thinking...',
    voiceComingSoon: 'Voice input coming soon!',
    dropOverlay: 'Drop file to upload document',
    saveProfile: 'Save Profile', saving: 'Saving...', saved: 'Profile saved!',
    basicInfo: 'Basic Info', socialFinancial: 'Social & Financial',
    categoryDetails: 'Category Details', needHelp: 'What help do you need?',
    submissionId: 'Submission ID', viewJSON: 'View Raw JSON',
  },
  hi: {
    appName: 'योग्य', appTagline: 'AI सरकारी योजना नेविगेटर',
    home: 'होम', findSchemes: 'योजनाएं खोजें', dashboard: 'डैशबोर्ड',
    welcomeTitle: 'योग्य में आपका स्वागत है', welcomeSubtitle: 'सरकारी योजनाओं के लिए आपका AI गाइड',
    emailPlaceholder: 'अपना ईमेल दर्ज करें', continueBtn: 'जारी रखें',
    chatGreeting: `नमस्ते! 🙏 मैं योग्य हूं, सरकारी योजनाओं के लिए आपका AI गाइड।\n\nमुझे अपनी स्थिति के बारे में बताएं — आप कहां रहते हैं, आपका पेशा, परिवार की स्थिति, या आपको किस तरह की मदद चाहिए। मैं आपके लिए सभी पात्र योजनाएं खोजूंगा।`,
    chatPlaceholder: 'अपनी स्थिति बताएं या कुछ भी पूछें...',
    sendBtn: 'भेजें', voiceBtn: 'आवाज़', uploadBtn: 'अपलोड',
    profileTitle: 'मेरी प्रोफाइल', documentsTitle: 'दस्तावेज़',
    completeProfile: 'प्रोफाइल पूरी करें', profileComplete: 'प्रोफाइल पूर्ण',
    language: 'English',
    errorGeneric: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
    errorEmail: 'कृपया वैध ईमेल दर्ज करें',
    uploadDrop: 'खींचें & छोड़ें या अपलोड करें',
    uploadProcessing: 'दस्तावेज़ संसाधित हो रहा है...',
    uploadSuccess: 'दस्तावेज़ सफलतापूर्वक संसाधित',
    uploadFail: 'अपलोड विफल। पुनः प्रयास करें।',
    viewExtracted: 'निकाला गया टेक्स्ट देखें',
    typing: 'योग्य सोच रहा है...',
    voiceComingSoon: 'आवाज़ इनपुट जल्द आएगा!',
    dropOverlay: 'दस्तावेज़ अपलोड करने के लिए फ़ाइल छोड़ें',
    saveProfile: 'प्रोफाइल सेव करें', saving: 'सेव हो रहा है...', saved: 'प्रोफाइल सेव हो गई!',
    basicInfo: 'बुनियादी जानकारी', socialFinancial: 'सामाजिक और वित्तीय',
    categoryDetails: 'श्रेणी विवरण', needHelp: 'आपको किस मदद की जरूरत है?',
    submissionId: 'सबमिशन ID', viewJSON: 'रॉ JSON देखें',
  },
};

export function AppProvider({ children }) {
  const [userId, setUserIdState] = useState(localStorage.getItem('yogya_user_id') || '');
  const [language, setLanguage] = useState('en');
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yogya_general_payload') || '{}'); } catch { return {}; }
  });
  const [categoryProfile, setCategoryProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yogya_category_payload') || '{}'); } catch { return {}; }
  });
  const [messages, setMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [schemesDrawerOpen, setSchemesDrawerOpen] = useState(false);
  const [docsCount, setDocsCount] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  // Keep user_id in sync with Firebase auth session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const stored = localStorage.getItem('yogya_user_id');
        if (stored !== user.uid) {
          localStorage.setItem('yogya_user_id', user.uid);
          localStorage.setItem('yogya_email', user.email || '');
          setUserIdState(user.uid);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Saved schemes from localStorage
  const getSavedSchemes = () => {
    const uid = localStorage.getItem('yogya_user_id');
    if (!uid) return [];
    try { return JSON.parse(localStorage.getItem(`yogya_schemes_${uid}`) || '[]'); } catch { return []; }
  };
  const [savedSchemes, setSavedSchemes] = useState(getSavedSchemes);

  const t = translations[language];

  const updateProfile = (data) => {
    setProfile(p => {
      const updated = { ...p, ...data };
      localStorage.setItem('yogya_general_payload', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCategoryProfile = (data) => {
    setCategoryProfile(p => {
      const updated = { ...p, ...data };
      localStorage.setItem('yogya_category_payload', JSON.stringify(updated));
      return updated;
    });
  };

  // addMessage: supports extra fields (schemes, typewriter)
  const addMessage = useCallback((role, content, extras = {}) => {
    setMessages(m => [...m, {
      id: Date.now() + Math.random(),
      role,
      content,
      schemes: [],
      ...extras,
      timestamp: new Date(),
    }]);
  }, []);

  const getUserId = () => localStorage.getItem('yogya_user_id') || userId;

  const setUserId = (id) => {
    localStorage.setItem('yogya_user_id', id);
    setUserIdState(id);
  };

  // Toast system
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // Saved schemes
  const saveScheme = useCallback((scheme) => {
    const uid = localStorage.getItem('yogya_user_id');
    if (!uid) return;
    setSavedSchemes(prev => {
      if (prev.find(s => s.id === scheme.id)) return prev;
      const next = [...prev, scheme];
      localStorage.setItem(`yogya_schemes_${uid}`, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeScheme = useCallback((schemeId) => {
    const uid = localStorage.getItem('yogya_user_id');
    setSavedSchemes(prev => {
      const next = prev.filter(s => s.id !== schemeId);
      if (uid) localStorage.setItem(`yogya_schemes_${uid}`, JSON.stringify(next));
      return next;
    });
  }, []);

  const incrementDocsCount = useCallback(() => setDocsCount(c => c + 1), []);

  const isProfileComplete = !!(profile.full_name && profile.state && categoryProfile.need);

  const completionPct = (() => {
    const fields = ['full_name', 'age', 'gender', 'state', 'annual_income', 'employment_type', 'caste_category'];
    const filled = fields.filter(f => profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  })();

  return (
    <AppContext.Provider value={{
      userId, language, setLanguage, t, profile, updateProfile,
      categoryProfile, updateCategoryProfile,
      messages, addMessage, setMessages,
      isProfileComplete, completionPct,
      getUserId, setUserId,
      toasts, addToast, removeToast,
      savedSchemes, saveScheme, removeScheme,
      schemesDrawerOpen, setSchemesDrawerOpen,
      docsCount, incrementDocsCount,
      matchedCount, setMatchedCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
