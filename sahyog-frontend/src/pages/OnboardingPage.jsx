import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { saveGeneralProfile, saveCategoryProfile } from '../utils/api';

import Step1Personal from '../components/onboarding/Step1Personal';
import Step2Social from '../components/onboarding/Step2Social';
import Step3NeedCategory from '../components/onboarding/Step3NeedCategory';
import Step4CategoryDetails from '../components/onboarding/Step4CategoryDetails';
import Step5Documents from '../components/onboarding/Step5Documents';

const STEPS = [
  { id: 1, key: 'personal' },
  { id: 2, key: 'social' },
  { id: 3, key: 'need' },
  { id: 4, key: 'category' },
  { id: 5, key: 'documents' },
];

const stepTitles = {
  en: ['Personal Details', 'Social & Financial', 'What Help Do You Need?', 'Category Details', 'Upload Documents'],
  hi: ['व्यक्तिगत विवरण', 'सामाजिक और वित्तीय', 'आपको किस मदद की जरूरत है?', 'श्रेणी विवरण', 'दस्तावेज़ अपलोड करें'],
};

export default function OnboardingPage() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [needCategory, setNeedCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(1);

  const userId = localStorage.getItem('yogya_user_id');

  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId, navigate]);

  const {
    register, handleSubmit, watch, trigger,
    formState: { errors },
    getValues,
  } = useForm({ mode: 'onBlur' });

  const goNext = async () => {
    let valid = true;
    if (currentStep === 1) valid = await trigger(['full_name', 'age', 'gender', 'marital_status', 'state', 'district', 'village_city', 'area_type']);
    if (currentStep === 2) valid = await trigger(['caste_category', 'religion', 'family_size', 'num_dependents', 'annual_income', 'employment_type']);
    if (currentStep === 3) { if (!needCategory) return; }

    if (valid) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(s => s - 1);
  };

  const onSubmit = async (formData) => {
    if (!needCategory) return;
    setSubmitting(true);
    setError('');

    try {
      // Build general profile payload
      const generalPayload = {
        user_id: userId,
        full_name: formData.full_name,
        age: Number(formData.age),
        gender: formData.gender,
        marital_status: formData.marital_status,
        state: formData.state,
        district: formData.district,
        village_city: formData.village_city,
        area_type: formData.area_type,
        caste_category: formData.caste_category,
        religion: formData.religion,
        minority_status: formData.minority_status || false,
        disability: formData.disability || false,
        disability_type: formData.disability_type || '',
        family_size: Number(formData.family_size),
        num_dependents: Number(formData.num_dependents),
        annual_income: Number(formData.annual_income),
        employment_type: formData.employment_type,
        bpl_card_holder: formData.bpl_card_holder || false,
        aadhaar_number: formData.aadhaar_number || '',
        bank_account_number: formData.bank_account_number || '',
        bank_ifsc_code: formData.bank_ifsc_code || '',
      };

      await saveGeneralProfile(generalPayload);

      // Build category payload — only the category-relevant fields + need
      const categoryFieldKeys = [
        // education
        'education_level','institution_name','course_name','course_year','board_university','marks_percentage','annual_family_income','parental_occupation',
        // agriculture
        'land_area_acres','land_ownership','crop_type','irrigation_facility','farmer_id','kisan_credit_card','livestock','livestock_count','annual_farm_income','ration_card_number',
        // health
        'has_spouse','num_children','health_conditions','pregnancy_status','abha_id','health_insurance',
        // housing
        'owns_house','house_type','has_pucca_house','num_rooms','household_income','current_address','years_at_address',
        // social_welfare
        'widow_status','year_spouse_death','num_daughters','num_sons','minority_community_name','receiving_pension',
        // business
        'business_type','udyam_number','gst_number','years_in_operation','annual_turnover','num_employees','women_owned','sc_st_owned','has_existing_loan',
        // jobs
        'highest_qualification','field_of_study','skills','certifications','employment_status','years_of_experience','preferred_sector','preferred_location',
      ];
      const categoryFields = {};
      categoryFieldKeys.forEach(k => {
        if (formData[k] !== undefined && formData[k] !== '') {
          categoryFields[k] = formData[k];
        }
      });
      const categoryPayload = { user_id: userId, need: needCategory, ...categoryFields };
      await saveCategoryProfile(categoryPayload);

      // Save to localStorage so Results page always has the data regardless of API response shape
      localStorage.setItem('yogya_general_payload', JSON.stringify(generalPayload));
      localStorage.setItem('yogya_category_payload', JSON.stringify(categoryPayload));

      navigate('/processing');
    } catch (err) {
      setError(err.response?.data?.message || t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const titles = stepTitles[lang];

  const variants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 60 : -60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-white to-[#fff8f0]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0B1340] flex items-center justify-center">
              <span className="text-white font-bold text-xs">य</span>
            </div>
            <span className="font-bold text-[#1a237e] text-base">Yogya</span>
          </Link>
          <button onClick={toggleLang}
            className="px-3 py-1 rounded-full border-2 border-[#FF6F00] text-[#FF6F00] text-xs font-semibold">
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress section */}
        <div className="mb-8">
          {/* Step labels */}
          <div className="flex justify-between items-start mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step.id < currentStep
                    ? 'bg-[#0B1340] text-white'
                    : step.id === currentStep
                    ? 'bg-[#FF6F00] text-white ring-4 ring-[#FF6F00]/20'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <span className={`text-[10px] mt-1.5 text-center hidden sm:block font-medium ${
                  step.id === currentStep ? 'text-[#FF6F00]' : step.id < currentStep ? 'text-[#1a237e]' : 'text-gray-400'
                }`}>
                  {titles[step.id - 1]}
                </span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#1a237e] to-[#FF6F00] rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">
            {lang === 'en' ? `Step ${currentStep} of ${STEPS.length}` : `चरण ${currentStep} / ${STEPS.length}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#1a237e] to-[#283593] text-white">
            <h2 className="text-xl font-bold">{titles[currentStep - 1]}</h2>
            <p className="text-blue-200 text-sm mt-1">
              {lang === 'en'
                ? 'Fill in the information below to help us find your schemes'
                : 'हमें आपकी योजनाएं खोजने में मदद के लिए नीचे जानकारी भरें'}
            </p>
          </div>

          {/* Step content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6 min-h-[400px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {currentStep === 1 && (
                    <Step1Personal register={register} errors={errors} lang={lang} />
                  )}
                  {currentStep === 2 && (
                    <Step2Social register={register} errors={errors} watch={watch} lang={lang} />
                  )}
                  {currentStep === 3 && (
                    <Step3NeedCategory selected={needCategory} onSelect={setNeedCategory} lang={lang} />
                  )}
                  {currentStep === 4 && (
                    <Step4CategoryDetails
                      register={register} errors={errors} watch={watch}
                      needCategory={needCategory} lang={lang}
                    />
                  )}
                  {currentStep === 5 && (
                    <Step5Documents needCategory={needCategory} userId={userId} lang={lang} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {error && (
              <div className="mx-6 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1a237e] hover:text-[#1a237e] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
                {t.backBtn}
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentStep === 3 && !needCategory}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1340] hover:bg-[#0d1257] disabled:bg-gray-300 text-white font-bold text-sm transition-all"
                >
                  {t.nextBtn}
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6F00] hover:bg-[#E65100] disabled:bg-gray-300 text-white font-bold text-sm transition-all shadow-lg shadow-orange-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {lang === 'en' ? 'Submitting...' : 'सबमिट हो रहा है...'}
                    </>
                  ) : (
                    <>
                      {t.submitBtn}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {lang === 'en'
            ? 'Your data is encrypted and protected. We never share your information.'
            : 'आपका डेटा एन्क्रिप्टेड और सुरक्षित है। हम आपकी जानकारी कभी साझा नहीं करते।'}
        </p>
      </div>
    </div>
  );
}
