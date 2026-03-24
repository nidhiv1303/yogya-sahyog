import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navbar
    home: 'Home',
    findSchemes: 'Find Schemes',
    language: 'हिंदी',
    // Hero
    heroTitle: 'Yogya — योग्य',
    heroSubtitle: 'AI That Navigates Government Schemes So Citizens Don\'t Have To',
    findMySchemes: 'Find My Schemes',
    learnMore: 'Learn More',
    // Stats
    stat1: '650+',
    stat1Label: 'Government Schemes',
    stat1Desc: 'Across central and state governments',
    stat2: '73%',
    stat2Label: 'Never Claim Benefits',
    stat2Desc: 'Eligible citizens who miss out',
    stat3: '10M+',
    stat3Label: 'Citizens We Aim to Help',
    stat3Desc: 'With AI-powered scheme matching',
    // Problem
    problemTitle: 'The Problem We Solve',
    problem1: 'India has 650+ government welfare schemes',
    problem2: '73% of eligible citizens never claim them',
    problem3: 'We change that with AI',
    // How it works
    howTitle: 'How Sahyog Works',
    step1Title: 'Register',
    step1Desc: 'Sign up with your email address',
    step2Title: 'Tell Us About You',
    step2Desc: 'Share your personal and financial details',
    step3Title: 'Upload Documents',
    step3Desc: 'Upload your Aadhaar, income certificate and more',
    step4Title: 'Get Matched',
    step4Desc: 'AI instantly finds schemes you qualify for',
    // Register
    welcomeTitle: 'Welcome to Sahyog',
    welcomeSubtitle: 'Enter your email to get started — we\'ll find the government schemes you deserve',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email address',
    continueBtn: 'Continue',
    // Onboarding
    step1OnboardingTitle: 'Personal Details',
    step2OnboardingTitle: 'Social & Financial Details',
    step3OnboardingTitle: 'What Help Do You Need?',
    step4OnboardingTitle: 'Category Details',
    step5OnboardingTitle: 'Upload Documents',
    nextBtn: 'Next',
    backBtn: 'Back',
    submitBtn: 'Find My Schemes',
    // Results
    profileReady: 'Your Profile is Ready!',
    processingMsg: 'Your data is being processed by our AI...',
    // Errors
    errorGeneric: 'Something went wrong. Please try again.',
    errorEmail: 'Please enter a valid email address',
    errorRequired: 'This field is required',
    // Footer
    footerText: 'Built with love for Indian Citizens',
    footerTeam: 'Team Bit_By_Bit | IAR Udaan Hackathon 2026',
  },
  hi: {
    // Navbar
    home: 'होम',
    findSchemes: 'योजनाएं खोजें',
    language: 'English',
    // Hero
    heroTitle: 'योग्य — Yogya',
    heroSubtitle: 'AI जो सरकारी योजनाओं में मार्गदर्शन करे, ताकि नागरिकों को न करना पड़े',
    findMySchemes: 'मेरी योजनाएं खोजें',
    learnMore: 'और जानें',
    // Stats
    stat1: '650+',
    stat1Label: 'सरकारी योजनाएं',
    stat1Desc: 'केंद्र और राज्य सरकारों में',
    stat2: '73%',
    stat2Label: 'कभी लाभ नहीं उठाते',
    stat2Desc: 'पात्र नागरिक जो वंचित रह जाते हैं',
    stat3: '1 करोड़+',
    stat3Label: 'नागरिकों की मदद का लक्ष्य',
    stat3Desc: 'AI-संचालित योजना मिलान के साथ',
    // Problem
    problemTitle: 'हम क्या समस्या हल करते हैं',
    problem1: 'भारत में 650+ सरकारी कल्याण योजनाएं हैं',
    problem2: '73% पात्र नागरिक कभी इनका लाभ नहीं उठाते',
    problem3: 'हम इसे AI से बदल रहे हैं',
    // How it works
    howTitle: 'योग्य कैसे काम करता है',
    step1Title: 'रजिस्टर करें',
    step1Desc: 'अपने ईमेल से साइन अप करें',
    step2Title: 'अपने बारे में बताएं',
    step2Desc: 'अपनी व्यक्तिगत और वित्तीय जानकारी साझा करें',
    step3Title: 'दस्तावेज़ अपलोड करें',
    step3Desc: 'आधार, आय प्रमाण पत्र और अन्य अपलोड करें',
    step4Title: 'मैच पाएं',
    step4Desc: 'AI तुरंत उन योजनाओं को खोजता है जिनके लिए आप पात्र हैं',
    // Register
    welcomeTitle: 'सहयोग में आपका स्वागत है',
    welcomeSubtitle: 'शुरू करने के लिए अपना ईमेल दर्ज करें — हम आपके लिए सरकारी योजनाएं खोजेंगे',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'अपना ईमेल पता दर्ज करें',
    continueBtn: 'जारी रखें',
    // Onboarding
    step1OnboardingTitle: 'व्यक्तिगत विवरण',
    step2OnboardingTitle: 'सामाजिक और वित्तीय विवरण',
    step3OnboardingTitle: 'आपको किस मदद की जरूरत है?',
    step4OnboardingTitle: 'श्रेणी विवरण',
    step5OnboardingTitle: 'दस्तावेज़ अपलोड करें',
    nextBtn: 'अगला',
    backBtn: 'पीछे',
    submitBtn: 'मेरी योजनाएं खोजें',
    // Results
    profileReady: 'आपकी प्रोफाइल तैयार है!',
    processingMsg: 'हमारा AI आपके डेटा की प्रक्रिया कर रहा है...',
    // Errors
    errorGeneric: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
    errorEmail: 'कृपया एक वैध ईमेल पता दर्ज करें',
    errorRequired: 'यह फ़ील्ड आवश्यक है',
    // Footer
    footerText: 'भारतीय नागरिकों के लिए प्यार से बनाया गया',
    footerTeam: 'टीम योग्य | IAR उड़ान हैकाथॉन 2026',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
