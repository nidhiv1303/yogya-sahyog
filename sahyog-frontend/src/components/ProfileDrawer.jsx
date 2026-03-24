import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { saveGeneralInfo, saveCategoryDetails } from '../api';
import { INDIAN_STATES, NEED_CATEGORIES } from '../utils/constants';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm bg-white/80 transition-colors" />
  );
}

function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm bg-white/80 appearance-none transition-colors">
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative" onClick={() => onChange(!value)}>
        <div className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-[#1a237e]' : 'bg-gray-200'}`} />
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

const TABS = ['basicInfo', 'socialFinancial', 'categoryDetails'];

export default function ProfileDrawer({ open, onClose }) {
  const { t, profile, updateProfile, categoryProfile, updateCategoryProfile, getUserId } = useApp();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const p = profile;
  const cp = categoryProfile;

  const set = (k, v) => updateProfile({ [k]: v });
  const setC = (k, v) => updateCategoryProfile({ [k]: v });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const uid = getUserId();
      await saveGeneralInfo({ user_id: uid, ...profile });
      if (cp.need) await saveCategoryDetails({ user_id: uid, ...cp });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } catch (err) {
      setError(err.message || t.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const tabLabels = [t.basicInfo, t.socialFinancial, t.categoryDetails];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 h-full w-full max-w-md bg-[#F8F9FF] z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer header */}
            <div className="bg-gradient-to-r from-[#1a237e] to-[#283593] px-5 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-black text-white text-lg">{t.profileTitle}</h2>
                <p className="text-blue-200 text-xs mt-0.5">Complete your profile for better scheme matches</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
              {tabLabels.map((label, i) => (
                <button key={i} onClick={() => setTab(i)}
                  className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                    tab === i ? 'text-[#1a237e] border-b-2 border-[#1a237e]' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Tab 1: Basic Info */}
              {tab === 0 && (
                <div className="space-y-4">
                  <Field label="Full Name">
                    <Input value={p.full_name || ''} onChange={e => set('full_name', e.target.value)} placeholder="Enter your full name" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Age">
                      <Input type="number" value={p.age || ''} onChange={e => set('age', e.target.value)} placeholder="25" />
                    </Field>
                    <Field label="Gender">
                      <Select value={p.gender || ''} onChange={e => set('gender', e.target.value)}>
                        <option value="">Select</option>
                        {['Male', 'Female', 'Other'].map(v => <option key={v}>{v}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <Field label="State">
                    <Select value={p.state || ''} onChange={e => set('state', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="District">
                    <Input value={p.district || ''} onChange={e => set('district', e.target.value)} placeholder="Your district" />
                  </Field>
                  <Field label="Village / City">
                    <Input value={p.village_city || ''} onChange={e => set('village_city', e.target.value)} placeholder="Village or city name" />
                  </Field>
                  <Field label="Area Type">
                    <div className="flex gap-4 mt-1">
                      {['Rural', 'Urban'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" value={opt} checked={p.area_type === opt} onChange={() => set('area_type', opt)} className="accent-[#1a237e]" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Marital Status">
                    <Select value={p.marital_status || ''} onChange={e => set('marital_status', e.target.value)}>
                      <option value="">Select</option>
                      {['Single', 'Married', 'Widow', 'Divorced'].map(v => <option key={v}>{v}</option>)}
                    </Select>
                  </Field>
                </div>
              )}

              {/* Tab 2: Social & Financial */}
              {tab === 1 && (
                <div className="space-y-4">
                  <Field label="Caste Category">
                    <Select value={p.caste_category || ''} onChange={e => set('caste_category', e.target.value)}>
                      <option value="">Select</option>
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map(v => <option key={v}>{v}</option>)}
                    </Select>
                  </Field>
                  <Field label="Religion">
                    <Select value={p.religion || ''} onChange={e => set('religion', e.target.value)}>
                      <option value="">Select</option>
                      {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'].map(v => <option key={v}>{v}</option>)}
                    </Select>
                  </Field>
                  <Field label="Annual Income (₹)">
                    <Input type="number" value={p.annual_income || ''} onChange={e => set('annual_income', e.target.value)} placeholder="120000" />
                  </Field>
                  <Field label="Employment Type">
                    <Select value={p.employment_type || ''} onChange={e => set('employment_type', e.target.value)}>
                      <option value="">Select</option>
                      {['Salaried', 'Farmer', 'Daily Wage', 'Unemployed', 'Business', 'Student'].map(v => <option key={v}>{v}</option>)}
                    </Select>
                  </Field>
                  <Field label="Family Size">
                    <Input type="number" value={p.family_size || ''} onChange={e => set('family_size', e.target.value)} placeholder="4" />
                  </Field>
                  <Field label="Aadhaar Number">
                    <Input value={p.aadhaar_number || ''} onChange={e => set('aadhaar_number', e.target.value)} placeholder="12-digit Aadhaar" maxLength={12} />
                  </Field>
                  <Field label="Bank Account Number">
                    <Input value={p.bank_account_number || ''} onChange={e => set('bank_account_number', e.target.value)} placeholder="Account number" />
                  </Field>
                  <Field label="Bank IFSC Code">
                    <Input value={p.bank_ifsc_code || ''} onChange={e => set('bank_ifsc_code', e.target.value)} placeholder="SBIN0001234" className="uppercase" />
                  </Field>
                  <div className="space-y-3 pt-1">
                    <Toggle label="BPL Card Holder" value={!!p.bpl_card_holder} onChange={v => set('bpl_card_holder', v)} />
                    <Toggle label="Disability" value={!!p.disability} onChange={v => set('disability', v)} />
                    <Toggle label="Minority Status" value={!!p.minority_status} onChange={v => set('minority_status', v)} />
                  </div>

                  {/* Need category */}
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{t.needHelp}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {NEED_CATEGORIES.map(cat => (
                        <button key={cat.id} type="button"
                          onClick={() => setC('need', cat.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            cp.need === cat.id
                              ? 'border-[#1a237e] bg-[#1a237e]/5'
                              : 'border-gray-200 bg-white/60 hover:border-[#1a237e]/40'
                          }`}>
                          <span className="text-lg block mb-1">{cat.icon}</span>
                          <span className="text-xs font-semibold text-gray-700 leading-tight block">{cat.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Category Details */}
              {tab === 2 && (
                <div className="space-y-4">
                  {!cp.need ? (
                    <div className="text-center py-10">
                      <p className="text-gray-400 text-sm">Select your need category in the Social & Financial tab first.</p>
                      <button onClick={() => setTab(1)} className="mt-3 text-[#1a237e] text-sm font-semibold hover:underline">
                        Go to Social & Financial →
                      </button>
                    </div>
                  ) : (
                    <CategoryFields need={cp.need} cp={cp} setC={setC} />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 bg-white flex-shrink-0">
              {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
              {saved && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mb-2">
                  <CheckCircle2 size={16} /> {t.saved}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#1a237e] to-[#283593] hover:from-[#283593] hover:to-[#1a237e] disabled:opacity-60 text-white font-bold transition-all shadow-lg"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> {t.saving}</> : <><Save size={16} /> {t.saveProfile}</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CategoryFields({ need, cp, setC }) {
  const Input = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <input type={type} value={cp[field] || ''} onChange={e => setC(field, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm bg-white/80" />
    </div>
  );

  if (need === 'education') return (
    <div className="space-y-3">
      <Input label="Education Level" field="education_level" />
      <Input label="Institution Name" field="institution_name" />
      <Input label="Course Name" field="course_name" />
      <Input label="Marks %" field="marks_percentage" type="number" placeholder="75" />
      <Input label="Annual Family Income" field="annual_family_income" type="number" />
    </div>
  );

  if (need === 'agriculture') return (
    <div className="space-y-3">
      <Input label="Land Area (acres)" field="land_area_acres" type="number" />
      <Input label="Crop Type" field="crop_type" placeholder="Wheat, Rice..." />
      <Input label="Farmer ID" field="farmer_id" />
      <Input label="Annual Farm Income" field="annual_farm_income" type="number" />
      <Input label="Ration Card Number" field="ration_card_number" />
    </div>
  );

  if (need === 'health') return (
    <div className="space-y-3">
      <Input label="Number of Children" field="num_children" type="number" />
      <Input label="ABHA ID" field="abha_id" />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Health Conditions</label>
        <textarea value={cp.health_conditions || ''} onChange={e => setC('health_conditions', e.target.value)} rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm bg-white/80 resize-none" />
      </div>
    </div>
  );

  if (need === 'housing') return (
    <div className="space-y-3">
      <Input label="Household Income" field="household_income" type="number" />
      <Input label="Number of Rooms" field="num_rooms" type="number" />
      <Input label="Years at Address" field="years_at_address" type="number" />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Current Address</label>
        <textarea value={cp.current_address || ''} onChange={e => setC('current_address', e.target.value)} rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm bg-white/80 resize-none" />
      </div>
    </div>
  );

  if (need === 'business') return (
    <div className="space-y-3">
      <Input label="Udyam / MSME Number" field="udyam_number" />
      <Input label="GST Number" field="gst_number" />
      <Input label="Annual Turnover" field="annual_turnover" type="number" />
      <Input label="Number of Employees" field="num_employees" type="number" />
    </div>
  );

  if (need === 'jobs') return (
    <div className="space-y-3">
      <Input label="Highest Qualification" field="highest_qualification" />
      <Input label="Field of Study" field="field_of_study" />
      <Input label="Years of Experience" field="years_of_experience" type="number" />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Skills</label>
        <textarea value={cp.skills || ''} onChange={e => setC('skills', e.target.value)} rows={2} placeholder="Python, Excel, Welding..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm bg-white/80 resize-none" />
      </div>
    </div>
  );

  if (need === 'social_welfare') return (
    <div className="space-y-3">
      <Input label="Number of Daughters" field="num_daughters" type="number" />
      <Input label="Number of Sons" field="num_sons" type="number" />
      <Input label="Minority Community" field="minority_community_name" />
    </div>
  );

  return <p className="text-gray-400 text-sm text-center py-6">Select a category to see relevant fields.</p>;
}
