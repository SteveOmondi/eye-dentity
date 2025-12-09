import { useState } from 'react';
import { useFormStore } from '../store/formStore';

export const BioServicesStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [newService, setNewService] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      updateFormData({
        services: [...formData.services, newService.trim()],
      });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    updateFormData({
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      updateFormData({
        specializations: [...formData.specializations, newSpecialization.trim()],
      });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    updateFormData({
      specializations: formData.specializations.filter((_, i) => i !== index),
    });
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !formData.serviceAreas.includes(newServiceArea.trim())) {
      updateFormData({
        serviceAreas: [...formData.serviceAreas, newServiceArea.trim()],
      });
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (index: number) => {
    updateFormData({
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index),
    });
  };

  const handleNext = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Tell Your Story</h2>
      <p className="text-gray-600 mb-8">
        Share your professional background, expertise, and the value you provide to clients.
      </p>

      <div className="space-y-6">
        {/* Bio Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tell us about your experience, qualifications, and what makes you unique..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.bio.length} characters (Recommended: 150-300)
          </p>
        </div>

        {/* Mission Statement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mission Statement
          </label>
          <textarea
            value={formData.missionStatement}
            onChange={(e) => updateFormData({ missionStatement: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="What drives your work? What's your commitment to clients?"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your professional mission or philosophy
          </p>
        </div>

        {/* Services Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services You Offer
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addService();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Legal Consultation, Tax Planning, etc."
            />
            <button
              onClick={addService}
              type="button"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Services List */}
          {formData.services.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <span className="text-gray-700">{service}</span>
                  <button
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.services.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No services added yet. Add at least one service to help clients understand what you offer.
            </p>
          )}
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specializations
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialization();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Corporate Law, Estate Planning"
            />
            <button
              onClick={addSpecialization}
              type="button"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.specializations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {spec}
                  <button
                    onClick={() => removeSpecialization(index)}
                    className="text-purple-600 hover:text-purple-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Service Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Areas (Geographic)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newServiceArea}
              onChange={(e) => setNewServiceArea(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addServiceArea();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., New York, New Jersey, Connecticut"
            />
            <button
              onClick={addServiceArea}
              type="button"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.serviceAreas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.serviceAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {area}
                  <button
                    onClick={() => removeServiceArea(index)}
                    className="text-green-600 hover:text-green-800 font-bold"
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
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
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
