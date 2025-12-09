import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { PROFESSIONS } from '../utils/constants';

export const PersonalInfoStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newLanguage, setNewLanguage] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.profession) {
      newErrors.profession = 'Please select a profession';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company/Business name is required';
    }

    if (!formData.tagline.trim()) {
      newErrors.tagline = 'Professional tagline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setCurrentStep(2);
    }
  };

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
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Tell Us About Yourself</h2>
      <p className="text-gray-600 mb-8">
        Let's start with your professional information to create a stunning website that showcases your expertise.
      </p>

      <div className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company/Business Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Doe Law Firm"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        {/* Professional Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Tagline *
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => updateFormData({ tagline: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.tagline ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Expert Tax Attorney with 15+ Years Experience"
          />
          {errors.tagline && (
            <p className="text-red-500 text-sm mt-1">{errors.tagline}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            A compelling one-liner that describes your expertise
          </p>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Profession Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profession *
          </label>
          <select
            value={formData.profession}
            onChange={(e) => updateFormData({ profession: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.profession ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Select your profession</option>
            <optgroup label="Professional">
              {PROFESSIONS.filter((p) => p.category === 'professional').map((prof) => (
                <option key={prof.value} value={prof.value}>
                  {prof.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Healthcare">
              {PROFESSIONS.filter((p) => p.category === 'healthcare').map((prof) => (
                <option key={prof.value} value={prof.value}>
                  {prof.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Creative">
              {PROFESSIONS.filter((p) => p.category === 'creative').map((prof) => (
                <option key={prof.value} value={prof.value}>
                  {prof.label}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.profession && (
            <p className="text-red-500 text-sm mt-1">{errors.profession}</p>
          )}
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={formData.yearsOfExperience || ''}
            onChange={(e) => updateFormData({ yearsOfExperience: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="15"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="New York, NY"
          />
          <p className="text-sm text-gray-500 mt-1">
            City, State/Country
          </p>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages Spoken
          </label>
          <div className="flex gap-2">
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., English, Spanish"
            />
            <button
              onClick={addLanguage}
              type="button"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Languages List */}
          {formData.languages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.languages.map((language, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {language}
                  <button
                    onClick={() => removeLanguage(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
};
