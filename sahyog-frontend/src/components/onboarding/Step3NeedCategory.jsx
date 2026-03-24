import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { NEED_CATEGORIES } from '../../utils/constants';

export default function Step3NeedCategory({ selected, onSelect, lang }) {
  const l = (en, hi) => lang === 'en' ? en : hi;

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        {l('Select the area where you need the most help. We\'ll find matching government schemes for you.',
          'वह क्षेत्र चुनें जहां आपको सबसे अधिक मदद की जरूरत है। हम आपके लिए मिलती-जुलती सरकारी योजनाएं खोजेंगे।')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NEED_CATEGORIES.map((cat, i) => {
          const isSelected = selected === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(cat.id)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-[#1a237e] bg-[#1a237e]/5 shadow-md'
                  : `border-gray-200 ${cat.bg} hover:border-[#1a237e]/40 hover:shadow-sm`
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 size={20} className="text-[#1a237e]" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className={`font-bold text-base mb-1 ${isSelected ? 'text-[#1a237e]' : 'text-gray-800'}`}>
                    {lang === 'en' ? cat.title : cat.titleHi}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {lang === 'en' ? cat.desc : cat.descHi}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      {!selected && (
        <p className="mt-4 text-xs text-amber-600 flex items-center gap-1.5">
          ⚠️ {l('Please select a category to continue', 'जारी रखने के लिए एक श्रेणी चुनें')}
        </p>
      )}
    </div>
  );
}
