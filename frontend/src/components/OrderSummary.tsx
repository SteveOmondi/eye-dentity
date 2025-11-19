import { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { hostingApi, HostingPlan } from '../api/hosting';
import { paymentApi } from '../api/payment';
import { redirectToCheckout } from '../utils/stripe';

export const OrderSummary = () => {
  const { formData, setCurrentStep } = useFormStore();
  const [selectedPlan, setSelectedPlan] = useState<HostingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.selectedPlan) {
      fetchPlanDetails();
    }
  }, [formData.selectedPlan]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await hostingApi.getPlanById(formData.selectedPlan!);
      setSelectedPlan(response.plan);
    } catch (err) {
      console.error('Failed to fetch plan details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;

    // Domain price (first year)
    if (formData.domainPrice) {
      total += formData.domainPrice;
    }

    // Hosting plan (monthly, showing first month)
    if (selectedPlan) {
      total += selectedPlan.price;
    }

    // Email hosting add-on (if applicable)
    if (formData.emailHosting) {
      total += 5.99; // Example email hosting price
    }

    return total;
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const handleProceedToPayment = async () => {
    try {
      setProcessing(true);
      setError('');

      // Validate required data
      if (!formData.domain || !formData.domainPrice || !formData.selectedPlan || !selectedPlan) {
        setError('Missing required order information');
        return;
      }

      // Create checkout session
      const response = await paymentApi.createCheckoutSession({
        domain: formData.domain,
        domainPrice: formData.domainPrice,
        hostingPlan: formData.selectedPlan,
        hostingPrice: selectedPlan.price,
        emailHosting: formData.emailHosting,
        emailHostingPrice: formData.emailHosting ? 5.99 : 0,
        metadata: {
          templateId: formData.selectedTemplate,
          colorScheme: formData.selectedColorScheme,
          profileData: {
            name: formData.name,
            email: formData.email,
            profession: formData.profession,
            phone: formData.phone,
            bio: formData.bio,
            services: formData.services,
            logoUrl: formData.logoUrl,
            profilePhotoUrl: formData.profilePhotoUrl,
          },
        },
      });

      // Redirect to Stripe Checkout
      const { error: redirectError } = await redirectToCheckout(response.sessionId);

      if (redirectError) {
        setError(redirectError);
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Review Your Order</h2>
      <p className="text-gray-600 mb-8">
        Review your selections before proceeding to payment
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <button
                onClick={() => handleEdit(1)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>{' '}
                <span className="font-medium">{formData.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-medium">{formData.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Profession:</span>{' '}
                <span className="font-medium capitalize">{formData.profession.replace(/-/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Website Template
              </h3>
              <button
                onClick={() => handleEdit(4)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-4">
              {formData.selectedColorScheme && (
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: formData.selectedColorScheme.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: formData.selectedColorScheme.secondary }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: formData.selectedColorScheme.accent }}
                  />
                </div>
              )}
              <span className="text-sm font-medium">
                {formData.selectedColorScheme?.name} Color Scheme
              </span>
            </div>
          </div>

          {/* Domain */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Domain Name</h3>
              <button
                onClick={() => handleEdit(5)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-lg">{formData.domain}</span>
            </div>
          </div>

          {/* Hosting Plan */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Hosting Plan
              </h3>
              <button
                onClick={() => handleEdit(6)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            {selectedPlan && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg">{selectedPlan.name}</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${selectedPlan.price.toFixed(2)}/mo
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedPlan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {formData.emailHosting && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">+ Professional Email Hosting</span>
                      <span className="font-medium">$5.99/mo</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Total */}
        <div className="md:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Domain ({formData.domain})</span>
                <span className="font-medium">
                  ${formData.domainPrice?.toFixed(2) || '0.00'}/yr
                </span>
              </div>

              {selectedPlan && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Hosting ({selectedPlan.name})
                  </span>
                  <span className="font-medium">
                    ${selectedPlan.price.toFixed(2)}/mo
                  </span>
                </div>
              )}

              {formData.emailHosting && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email Hosting</span>
                  <span className="font-medium">$5.99/mo</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Due Today</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Domain billed annually. Hosting billed monthly.
              </p>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={processing}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>

            <button
              onClick={() => setCurrentStep(6)}
              className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Go Back
            </button>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
