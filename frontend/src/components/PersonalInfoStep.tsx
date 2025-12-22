import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { PROFESSIONS } from '../utils/constants';

export const PersonalInfoStep = () => {
  const { formData, updateFormData } = useFormStore();
  const [errors] = useState<Record<string, string>>({});
  const [newLanguage, setNewLanguage] = useState('');

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      updateFormData({
        languages: [...formData.languages, newLanguage.trim()],
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    updateFormData({
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Identity <span className="text-wizard-accent">Parameters</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Calibrate your core professional data to establish a high-fidelity digital presence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Name Input */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Full Identity *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className={`w-full bg-white/[0.02] border px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all ${errors.name ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]'
              }`}
            placeholder="e.g. MARCUS AURELIUS"
          />
          {errors.name && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">{errors.name}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Organization *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            className={`w-full bg-white/[0.02] border px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all ${errors.companyName ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]'
              }`}
            placeholder="e.g. STOIC SOLUTIONS"
          />
          {errors.companyName && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">{errors.companyName}</p>
          )}
        </div>

        {/* Professional Tagline */}
        <div className="md:col-span-2 space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Core Proposition *
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => updateFormData({ tagline: e.target.value })}
            className={`w-full bg-white/[0.02] border px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all ${errors.tagline ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]'
              }`}
            placeholder="Expert Attorney with 15+ Years specialized in Intellectual Property"
          />
          <div className="flex justify-between items-center px-1">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              Brief mission statement of your expertise
            </p>
            {errors.tagline && <span className="text-red-500 text-[9px] font-black uppercase tracking-widest">{errors.tagline}</span>}
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Comm Link *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className={`w-full bg-white/[0.02] border px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all ${errors.email ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]'
              }`}
            placeholder="ARCHITECT@EYE-DENTITY.COM"
          />
        </div>

        {/* Phone Input */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Direct Line
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="w-full bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Profession Dropdown */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Sector *
          </label>
          <div className="relative group">
            <select
              value={formData.profession}
              onChange={(e) => updateFormData({ profession: e.target.value })}
              className={`w-full bg-[#141414] border px-6 py-5 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all cursor-pointer ${errors.profession ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]'}`}
            >
              <option value="" className="bg-[#141414]">IDENTIFY SECTOR</option>
              {Array.from(new Set(PROFESSIONS.map(p => p.category))).map(category => (
                <optgroup
                  key={category}
                  label={category.toUpperCase().replace('-', ' & ')}
                  className="bg-[#141414] text-wizard-accent font-black text-[10px] tracking-widest"
                >
                  {PROFESSIONS.filter(p => p.category === category).map((prof) => (
                    <option key={prof.value} value={prof.value} className="bg-[#141414] text-white">
                      {prof.label.toUpperCase()}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-wizard-accent transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Runtime (Years)
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={formData.yearsOfExperience || ''}
            onChange={(e) => updateFormData({ yearsOfExperience: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            placeholder="15"
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Node Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="w-full bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            placeholder="e.g. NEW YORK, NY"
          />
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80">
            Syntax / Languages
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLanguage();
                }
              }}
              className="flex-1 bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)]"
              placeholder="e.g. ENGLISH, SPANISH"
            />
            <button
              onClick={addLanguage}
              type="button"
              className="px-10 py-5 bg-wizard-accent text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(196,240,66,0.3)]"
            >
              Sync
            </button>
          </div>

          {/* Languages List */}
          {formData.languages.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {formData.languages.map((language, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-3 bg-wizard-accent/5 border border-wizard-accent/20 text-wizard-accent px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest group/item hover:bg-wizard-accent/10 transition-colors"
                >
                  {language}
                  <button
                    onClick={() => removeLanguage(index)}
                    className="text-wizard-accent/40 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
