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
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" {...register(name)} className="sr-only peer" />
        <div className="w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-[#1a237e] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

/* ─────────────────── EDUCATION ─────────────────── */
function EducationFields({ register, errors, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('Education Level *', 'शिक्षा स्तर *')}>
        <SelectWrapper>
          <select {...register('education_level', { required: true })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white">
            <option value="">{l('Select level', 'स्तर चुनें')}</option>
            {['School', 'Undergraduate', 'Postgraduate', 'Doctorate', 'Diploma'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </SelectWrapper>
        {errors.education_level && <Err msg={l('Required', 'आवश्यक')} />}
      </Field>
      <Field label={l('Institution Name', 'संस्था का नाम')}>
        <input type="text" {...register('institution_name')} placeholder={l('Your school/college', 'आपका स्कूल/कॉलेज')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Course Name', 'पाठ्यक्रम का नाम')}>
        <input type="text" {...register('course_name')} placeholder={l('e.g. B.Tech, MBA', 'जैसे B.Tech, MBA')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Course Year', 'पाठ्यक्रम वर्ष')}>
        <input type="text" {...register('course_year')} placeholder={l('e.g. 1st, 2nd', 'जैसे 1st, 2nd')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Board or University', 'बोर्ड या विश्वविद्यालय')}>
        <input type="text" {...register('board_university')} placeholder="e.g. CBSE, Mumbai University"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Marks Percentage (%)', 'अंक प्रतिशत (%)')}>
        <input type="number" {...register('marks_percentage', { min: 0, max: 100 })} placeholder="75"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Annual Family Income (₹)', 'वार्षिक पारिवारिक आय (₹)')}>
        <input type="number" {...register('annual_family_income')} placeholder="250000"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Parental Occupation', 'माता-पिता का व्यवसाय')}>
        <input type="text" {...register('parental_occupation')} placeholder={l('e.g. Farmer, Teacher', 'जैसे किसान, शिक्षक')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
    </div>
  );
}

/* ─────────────────── AGRICULTURE ─────────────────── */
function AgricultureFields({ register, watch, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  const hasLivestock = watch('livestock');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('Land Area (acres)', 'भूमि क्षेत्र (एकड़)')}>
        <input type="number" {...register('land_area_acres')} placeholder="2.5"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Land Ownership', 'भूमि स्वामित्व')}>
        <SelectWrapper>
          <select {...register('land_ownership')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white">
            <option value="">{l('Select', 'चुनें')}</option>
            {['Owned', 'Leased', 'Shared'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </SelectWrapper>
      </Field>
      <Field label={l('Crop Type', 'फसल का प्रकार')}>
        <input type="text" {...register('crop_type')} placeholder={l('e.g. Wheat, Rice, Cotton', 'जैसे गेहूं, चावल, कपास')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Farmer ID', 'किसान आईडी')}>
        <input type="text" {...register('farmer_id')} placeholder={l('Enter Farmer ID', 'किसान आईडी दर्ज करें')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Kisan Credit Card Number', 'किसान क्रेडिट कार्ड नंबर')}>
        <input type="text" {...register('kisan_credit_card')} placeholder={l('Enter KCC number', 'KCC नंबर दर्ज करें')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Annual Farm Income (₹)', 'वार्षिक कृषि आय (₹)')}>
        <input type="number" {...register('annual_farm_income')} placeholder="80000"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Ration Card Number', 'राशन कार्ड नंबर')}>
        <input type="text" {...register('ration_card_number')} placeholder={l('Enter ration card no.', 'राशन कार्ड नंबर दर्ज करें')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <div className="flex flex-col gap-4 pt-2">
        <div className="bg-gray-50 rounded-xl p-4">
          <Toggle label={l('Irrigation Facility', 'सिंचाई सुविधा')} name="irrigation_facility" register={register} />
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <Toggle label={l('Has Livestock', 'पशुधन है')} name="livestock" register={register} />
        </div>
        {hasLivestock && (
          <Field label={l('Livestock Count', 'पशुधन संख्या')}>
            <input type="number" {...register('livestock_count')} placeholder="5"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
          </Field>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── HEALTH ─────────────────── */
function HealthFields({ register, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('Number of Children', 'बच्चों की संख्या')}>
        <input type="number" {...register('num_children')} placeholder="2"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('ABHA ID', 'ABHA आईडी')}>
        <input type="text" {...register('abha_id')} placeholder={l('Enter ABHA ID', 'ABHA आईडी दर्ज करें')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <div className="sm:col-span-2">
        <Field label={l('Existing Health Conditions', 'मौजूदा स्वास्थ्य स्थितियां')}>
          <textarea {...register('health_conditions')} rows={3}
            placeholder={l('List any chronic illnesses, disabilities, etc.', 'कोई भी पुरानी बीमारी, विकलांगता आदि लिखें')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm resize-none" />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Has Spouse', 'पति/पत्नी है')} name="has_spouse" register={register} /></div>
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Pregnancy Status', 'गर्भावस्था की स्थिति')} name="pregnancy_status" register={register} /></div>
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Has Health Insurance', 'स्वास्थ्य बीमा है')} name="health_insurance" register={register} /></div>
      </div>
    </div>
  );
}

/* ─────────────────── HOUSING ─────────────────── */
function HousingFields({ register, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('House Type', 'घर का प्रकार')}>
        <SelectWrapper>
          <select {...register('house_type')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white">
            <option value="">{l('Select type', 'प्रकार चुनें')}</option>
            {['Pucca', 'Semi-Pucca', 'Kutcha'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </SelectWrapper>
      </Field>
      <Field label={l('Number of Rooms', 'कमरों की संख्या')}>
        <input type="number" {...register('num_rooms')} placeholder="2"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Household Income (₹)', 'घरेलू आय (₹)')}>
        <input type="number" {...register('household_income')} placeholder="150000"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Years at Current Address', 'वर्तमान पते पर वर्ष')}>
        <input type="number" {...register('years_at_address')} placeholder="5"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <div className="sm:col-span-2">
        <Field label={l('Current Address', 'वर्तमान पता')}>
          <textarea {...register('current_address')} rows={3} placeholder={l('Enter your full address', 'अपना पूरा पता दर्ज करें')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm resize-none" />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Own a House', 'घर का मालिक हूं')} name="owns_house" register={register} /></div>
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Has Pucca House', 'पक्का मकान है')} name="has_pucca_house" register={register} /></div>
      </div>
    </div>
  );
}

/* ─────────────────── SOCIAL WELFARE ─────────────────── */
function SocialWelfareFields({ register, watch, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  const isWidow = watch('widow_status');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('Number of Daughters', 'बेटियों की संख्या')}>
        <input type="number" {...register('num_daughters')} placeholder="2"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Number of Sons', 'बेटों की संख्या')}>
        <input type="number" {...register('num_sons')} placeholder="1"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Minority Community Name', 'अल्पसंख्यक समुदाय का नाम')}>
        <input type="text" {...register('minority_community_name')} placeholder={l('e.g. Muslim, Sikh', 'जैसे मुस्लिम, सिख')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Widow Status', 'विधवा की स्थिति')} name="widow_status" register={register} /></div>
        {isWidow && (
          <Field label={l('Year of Spouse Death', 'पति/पत्नी की मृत्यु का वर्ष')}>
            <input type="number" {...register('year_spouse_death')} placeholder="2020"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
          </Field>
        )}
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Receiving Any Pension', 'कोई पेंशन प्राप्त हो रही है')} name="receiving_pension" register={register} /></div>
      </div>
    </div>
  );
}

/* ─────────────────── BUSINESS ─────────────────── */
function BusinessFields({ register, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('Business Type', 'व्यवसाय का प्रकार')}>
        <SelectWrapper>
          <select {...register('business_type')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white">
            <option value="">{l('Select type', 'प्रकार चुनें')}</option>
            {['Manufacturing', 'Services', 'Trading', 'Agriculture', 'Technology'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </SelectWrapper>
      </Field>
      <Field label={l('Udyam / MSME Number', 'उद्यम / MSME नंबर')}>
        <input type="text" {...register('udyam_number')} placeholder="UDYAM-XX-00-0000000"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('GST Number', 'GST नंबर')}>
        <input type="text" {...register('gst_number')} placeholder="22AAAAA0000A1Z5"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Years in Operation', 'संचालन में वर्ष')}>
        <input type="number" {...register('years_in_operation')} placeholder="3"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Annual Turnover (₹)', 'वार्षिक कारोबार (₹)')}>
        <input type="number" {...register('annual_turnover')} placeholder="500000"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Number of Employees', 'कर्मचारियों की संख्या')}>
        <input type="number" {...register('num_employees')} placeholder="10"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Women-Owned Business', 'महिला स्वामित्व व्यवसाय')} name="women_owned" register={register} /></div>
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('SC/ST Owned Business', 'SC/ST स्वामित्व व्यवसाय')} name="sc_st_owned" register={register} /></div>
        <div className="bg-gray-50 rounded-xl p-4"><Toggle label={l('Has Existing Loan', 'मौजूदा ऋण है')} name="has_existing_loan" register={register} /></div>
      </div>
    </div>
  );
}

/* ─────────────────── JOBS ─────────────────── */
function JobsFields({ register, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={l('Highest Qualification', 'उच्चतम योग्यता')}>
        <SelectWrapper>
          <select {...register('highest_qualification')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white">
            <option value="">{l('Select', 'चुनें')}</option>
            {['10th Pass', '12th Pass', 'Diploma', 'Graduate', 'Postgraduate', 'PhD'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </SelectWrapper>
      </Field>
      <Field label={l('Field of Study', 'अध्ययन का क्षेत्र')}>
        <input type="text" {...register('field_of_study')} placeholder={l('e.g. Engineering, Arts', 'जैसे इंजीनियरिंग, कला')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Employment Status', 'रोजगार की स्थिति')}>
        <SelectWrapper>
          <select {...register('employment_status')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm appearance-none bg-white">
            <option value="">{l('Select', 'चुनें')}</option>
            {['Unemployed', 'Underemployed', 'Fresher', 'Experienced'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </SelectWrapper>
      </Field>
      <Field label={l('Years of Experience', 'अनुभव के वर्ष')}>
        <input type="number" {...register('years_of_experience')} placeholder="2"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Preferred Sector', 'पसंदीदा क्षेत्र')}>
        <input type="text" {...register('preferred_sector')} placeholder={l('e.g. IT, Government, Manufacturing', 'जैसे IT, सरकारी, निर्माण')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <Field label={l('Preferred Location', 'पसंदीदा स्थान')}>
        <input type="text" {...register('preferred_location')} placeholder={l('e.g. Delhi, Remote', 'जैसे दिल्ली, रिमोट')}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm" />
      </Field>
      <div className="sm:col-span-2">
        <Field label={l('Skills (comma separated)', 'कौशल (अल्पविराम से अलग)')}>
          <textarea {...register('skills')} rows={2} placeholder={l('e.g. Python, Excel, Welding, Sewing', 'जैसे Python, Excel, वेल्डिंग, सिलाई')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm resize-none" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label={l('Certifications', 'प्रमाणपत्र')}>
          <textarea {...register('certifications')} rows={2} placeholder={l('List your certifications...', 'अपने प्रमाणपत्र सूचीबद्ध करें...')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1a237e] focus:outline-none text-sm resize-none" />
        </Field>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN EXPORT ─────────────────── */
export default function Step4CategoryDetails({ register, errors, watch, needCategory, lang }) {
  const categoryTitles = {
    education: { en: 'Education Details', hi: 'शिक्षा विवरण' },
    agriculture: { en: 'Agriculture Details', hi: 'कृषि विवरण' },
    health: { en: 'Health Details', hi: 'स्वास्थ्य विवरण' },
    housing: { en: 'Housing Details', hi: 'आवास विवरण' },
    social_welfare: { en: 'Social Welfare Details', hi: 'सामाजिक कल्याण विवरण' },
    business: { en: 'Business Details', hi: 'व्यवसाय विवरण' },
    jobs: { en: 'Employment Details', hi: 'रोजगार विवरण' },
  };

  const title = categoryTitles[needCategory];

  return (
    <div>
      <div className="mb-6 p-4 rounded-xl bg-[#1a237e]/5 border border-[#1a237e]/20">
        <h3 className="font-bold text-[#1a237e]">
          {lang === 'en' ? title?.en : title?.hi}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          {lang === 'en'
            ? 'Fill in the details relevant to your selected category'
            : 'अपनी चुनी हुई श्रेणी से संबंधित विवरण भरें'}
        </p>
      </div>

      {needCategory === 'education' && <EducationFields register={register} errors={errors} lang={lang} />}
      {needCategory === 'agriculture' && <AgricultureFields register={register} watch={watch} lang={lang} />}
      {needCategory === 'health' && <HealthFields register={register} lang={lang} />}
      {needCategory === 'housing' && <HousingFields register={register} lang={lang} />}
      {needCategory === 'social_welfare' && <SocialWelfareFields register={register} watch={watch} lang={lang} />}
      {needCategory === 'business' && <BusinessFields register={register} lang={lang} />}
      {needCategory === 'jobs' && <JobsFields register={register} lang={lang} />}
    </div>
  );
}
