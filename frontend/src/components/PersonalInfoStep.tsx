import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { PROFESSIONS } from '../utils/constants';

export const PersonalInfoStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Tell Us About Yourself</h2>
      <p className="text-gray-600 mb-8">
        Let's start with some basic information to create your professional website.
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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Profession Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profession *
          </label>
          <select
            value={formData.profession}
            onChange={(e) => updateFormData({ profession: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.profession ? 'border-red-500' : 'border-gray-300'
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

        {/* Phone Input (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
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
