import { useState } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

function Err({ msg }) {
  return (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle size={12} />{msg}
    </p>
  );
}

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Toggle({ label, name, register }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" {...register(name)} className="sr-only peer" />
        <div className="w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-[#1a237e] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

export default function Step2Social({ register, errors, watch, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  const hasDisability = watch('disability');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Caste */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Caste Category', 'जाति श्रेणी')} *
          </label>
          <SelectWrapper>
            <select
              {...register('caste_category', { required: true })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white"
            >
              <option value="">{l('Select category', 'श्रेणी चुनें')}</option>
              {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </SelectWrapper>
          {errors.caste_category && <Err msg={l('Please select caste category', 'जाति श्रेणी चुनें')} />}
        </div>

        {/* Religion */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Religion', 'धर्म')} *
          </label>
          <SelectWrapper>
            <select
              {...register('religion', { required: true })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white"
            >
              <option value="">{l('Select religion', 'धर्म चुनें')}</option>
              {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </SelectWrapper>
          {errors.religion && <Err msg={l('Please select religion', 'धर्म चुनें')} />}
        </div>

        {/* Family Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Family Size', 'परिवार का आकार')} *
          </label>
          <input
            type="number"
            {...register('family_size', { required: true, min: 1 })}
            placeholder="4"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm"
          />
          {errors.family_size && <Err msg={l('Family size is required', 'परिवार का आकार आवश्यक है')} />}
        </div>

        {/* Dependents */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Number of Dependents', 'आश्रितों की संख्या')} *
          </label>
          <input
            type="number"
            {...register('num_dependents', { required: true, min: 0 })}
            placeholder="2"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm"
          />
          {errors.num_dependents && <Err msg={l('Number of dependents is required', 'आश्रितों की संख्या आवश्यक है')} />}
        </div>

        {/* Annual Income */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Annual Income (₹)', 'वार्षिक आय (₹)')} *
          </label>
          <input
            type="number"
            {...register('annual_income', { required: true, min: 0 })}
            placeholder="120000"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm"
          />
          {errors.annual_income && <Err msg={l('Annual income is required', 'वार्षिक आय आवश्यक है')} />}
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Employment Type', 'रोजगार प्रकार')} *
          </label>
          <SelectWrapper>
            <select
              {...register('employment_type', { required: true })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white"
            >
              <option value="">{l('Select type', 'प्रकार चुनें')}</option>
              {['Salaried', 'Farmer', 'Daily Wage', 'Unemployed', 'Business', 'Student'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </SelectWrapper>
          {errors.employment_type && <Err msg={l('Please select employment type', 'रोजगार प्रकार चुनें')} />}
        </div>

        {/* Aadhaar */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Aadhaar Number', 'आधार नंबर')}
          </label>
          <input
            type="text"
            {...register('aadhaar_number', {
              pattern: { value: /^\d{12}$/, message: l('Enter 12-digit Aadhaar number', '12 अंकों का आधार नंबर दर्ज करें') }
            })}
            placeholder="XXXX XXXX XXXX"
            maxLength={12}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm"
          />
          {errors.aadhaar_number && <Err msg={errors.aadhaar_number.message} />}
        </div>

        {/* Bank Account */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Bank Account Number', 'बैंक खाता नंबर')}
          </label>
          <input
            type="text"
            {...register('bank_account_number')}
            placeholder={l('Enter account number', 'खाता नंबर दर्ज करें')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm"
          />
        </div>

        {/* IFSC */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Bank IFSC Code', 'बैंक IFSC कोड')}
          </label>
          <input
            type="text"
            {...register('bank_ifsc_code', {
              pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: l('Invalid IFSC code', 'अमान्य IFSC कोड') }
            })}
            placeholder="SBIN0001234"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm uppercase"
          />
          {errors.bank_ifsc_code && <Err msg={errors.bank_ifsc_code.message} />}
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <div className="bg-gray-50 rounded-xl p-4">
          <Toggle label={l('Minority Status', 'अल्पसंख्यक दर्जा')} name="minority_status" register={register} />
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <Toggle label={l('BPL Card Holder', 'BPL कार्ड धारक')} name="bpl_card_holder" register={register} />
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <Toggle label={l('Disability', 'विकलांगता')} name="disability" register={register} />
        </div>
      </div>

      {/* Disability type (conditional) */}
      {hasDisability && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {l('Disability Type', 'विकलांगता का प्रकार')}
          </label>
          <input
            type="text"
            {...register('disability_type')}
            placeholder={l('e.g. Visual, Physical, Hearing', 'जैसे दृष्टि, शारीरिक, श्रवण')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm"
          />
        </div>
      )}
    </div>
  );
}
