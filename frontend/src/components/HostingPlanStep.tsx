import { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { hostingApi, type HostingPlan } from '../api/hosting';

export const HostingPlanStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await hostingApi.getPlans();
      setPlans(response.plans || []);
    } catch (err) {
      setError('Failed to load hosting plans');
      console.error('Hosting plans fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    updateFormData({ selectedPlan: planId });
  };

  const handleNext = () => {
    if (!formData.selectedPlan) {
      setError('Please select a hosting plan');
      return;
    }
    setCurrentStep(7); // Move to order summary
  };

  const handleBack = () => {
    setCurrentStep(5);
  };

  const selectedPlan = plans.find((p) => p.id === formData.selectedPlan);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading hosting plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Select Your Hosting Plan</h2>
      <p className="text-gray-600 mb-8">
        Choose the plan that best fits your needs. You can upgrade anytime.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Hosting Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isSelected = formData.selectedPlan === plan.id;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`relative rounded-xl border-2 cursor-pointer transition-all ${isSelected
                  ? 'border-blue-500 ring-4 ring-blue-100 shadow-xl'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <div className="p-6">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Resources */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                    Resources
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>💾 {plan.resources.storage}</div>
                    <div>📊 {plan.resources.bandwidth}</div>
                    <div>⚡ {plan.resources.cpu}</div>
                    <div>🧠 {plan.resources.ram}</div>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Email Hosting Option */}
      {selectedPlan && (selectedPlan.id === 'pro' || selectedPlan.id === 'premium') && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailHosting}
              onChange={(e) => updateFormData({ emailHosting: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-semibold text-gray-900">
                Add Professional Email Hosting
              </span>
              <p className="text-sm text-gray-600">
                Get professional email addresses with your domain (e.g., info@{formData.domain})
              </p>
            </div>
          </label>
        </div>
      )}

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
          disabled={!formData.selectedPlan}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Review Order →
        </button>
      </div>
    </div>
  );
};
