import { AlertCircle, ChevronDown } from 'lucide-react';
import { INDIAN_STATES } from '../../utils/constants';

export default function Step1Personal({ register, errors, lang }) {
  const label = (en, hi) => lang === 'en' ? en : hi;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('Full Name', 'पूरा नाम')} *
          </label>
          <input
            type="text"
            {...register('full_name', { required: label('Full name is required', 'पूरा नाम आवश्यक है') })}
            placeholder={label('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors"
          />
          {errors.full_name && <Err msg={errors.full_name.message} />}
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('Age', 'आयु')} *
          </label>
          <input
            type="number"
            {...register('age', {
              required: label('Age is required', 'आयु आवश्यक है'),
              min: { value: 1, message: label('Invalid age', 'अमान्य आयु') },
              max: { value: 120, message: label('Invalid age', 'अमान्य आयु') }
            })}
            placeholder="25"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors"
          />
          {errors.age && <Err msg={errors.age.message} />}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('Gender', 'लिंग')} *
          </label>
          <SelectWrapper>
            <select
              {...register('gender', { required: label('Please select gender', 'लिंग चुनें') })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors appearance-none bg-white"
            >
              <option value="">{label('Select gender', 'लिंग चुनें')}</option>
              <option value="Male">{label('Male', 'पुरुष')}</option>
              <option value="Female">{label('Female', 'महिला')}</option>
              <option value="Other">{label('Other', 'अन्य')}</option>
            </select>
          </SelectWrapper>
          {errors.gender && <Err msg={errors.gender.message} />}
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('Marital Status', 'वैवाहिक स्थिति')} *
          </label>
          <SelectWrapper>
            <select
              {...register('marital_status', { required: true })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors appearance-none bg-white"
            >
              <option value="">{label('Select status', 'स्थिति चुनें')}</option>
              <option value="Single">{label('Single', 'अविवाहित')}</option>
              <option value="Married">{label('Married', 'विवाहित')}</option>
              <option value="Widow">{label('Widow/Widower', 'विधवा/विधुर')}</option>
              <option value="Divorced">{label('Divorced', 'तलाकशुदा')}</option>
            </select>
          </SelectWrapper>
          {errors.marital_status && <Err msg={label('Please select marital status', 'वैवाहिक स्थिति चुनें')} />}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('State', 'राज्य')} *
          </label>
          <SelectWrapper>
            <select
              {...register('state', { required: label('Please select state', 'राज्य चुनें') })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors appearance-none bg-white"
            >
              <option value="">{label('Select state', 'राज्य चुनें')}</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </SelectWrapper>
          {errors.state && <Err msg={errors.state.message} />}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('District', 'जिला')} *
          </label>
          <input
            type="text"
            {...register('district', { required: label('District is required', 'जिला आवश्यक है') })}
            placeholder={label('Enter your district', 'अपना जिला दर्ज करें')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors"
          />
          {errors.district && <Err msg={errors.district.message} />}
        </div>

        {/* Village/City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('Village / City', 'गांव / शहर')} *
          </label>
          <input
            type="text"
            {...register('village_city', { required: label('Village/City is required', 'गांव/शहर आवश्यक है') })}
            placeholder={label('Enter village or city', 'गांव या शहर दर्ज करें')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm transition-colors"
          />
          {errors.village_city && <Err msg={errors.village_city.message} />}
        </div>

        {/* Area Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label('Area Type', 'क्षेत्र प्रकार')} *
          </label>
          <div className="flex gap-4 mt-1">
            {[
              { val: 'Rural', en: 'Rural', hi: 'ग्रामीण' },
              { val: 'Urban', en: 'Urban', hi: 'शहरी' },
            ].map(opt => (
              <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={opt.val}
                  {...register('area_type', { required: true })}
                  className="w-4 h-4 accent-[#1a237e]"
                />
                <span className="text-sm text-gray-700 font-medium">{label(opt.en, opt.hi)}</span>
              </label>
            ))}
          </div>
          {errors.area_type && <Err msg={label('Please select area type', 'क्षेत्र प्रकार चुनें')} />}
        </div>
      </div>
    </div>
  );
}

function Err({ msg }) {
  return (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle size={12} />
      {msg}
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
