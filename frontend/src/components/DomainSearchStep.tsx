import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { domainApi } from '../api/domain';

interface Suggestion {
  domain: string;
  available: boolean;
  price?: number;
}

export const DomainSearchStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [searchInput, setSearchInput] = useState(formData.domain || '');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleCheck = async () => {
    if (!searchInput.trim()) {
      setError('Please enter a domain name');
      return;
    }

    setError('');
    setChecking(true);
    setSuggestions([]);

    try {
      const result = await domainApi.checkAvailability(searchInput);

      if (result.available) {
        updateFormData({
          domain: result.domain,
          domainAvailable: true,
          domainPrice: result.price || null,
        });
      } else {
        updateFormData({
          domain: result.domain,
          domainAvailable: false,
          domainPrice: null,
        });

        // Fetch suggestions for unavailable domains
        fetchSuggestions(searchInput);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check domain availability');
    } finally {
      setChecking(false);
    }
  };

  const fetchSuggestions = async (baseName: string) => {
    setLoadingSuggestions(true);
    try {
      const result = await domainApi.suggestDomains(baseName);
      setSuggestions(result.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSearchInput(suggestion.domain);
    updateFormData({
      domain: suggestion.domain,
      domainAvailable: true,
      domainPrice: suggestion.price || null,
    });
    setSuggestions([]);
  };

  const handleNext = () => {
    if (!formData.domain) {
      setError('Please select a domain');
      return;
    }
    if (!formData.domainAvailable) {
      setError('Selected domain is not available');
      return;
    }
    setCurrentStep(6); // Move to hosting plan selection
  };

  const handleBack = () => {
    setCurrentStep(4);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Choose Your Domain</h2>
      <p className="text-gray-600 mb-8">
        Select a memorable domain name for your professional website
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Domain Search */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter your desired domain name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCheck();
              }
            }}
            placeholder="example.com"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking...
              </span>
            ) : (
              'Check Availability'
            )}
          </button>
        </div>

        {/* Domain Tips */}
        <div className="mt-3 text-sm text-gray-500">
          <p>💡 Tips: Keep it short, memorable, and easy to spell</p>
        </div>
      </div>

      {/* Availability Result */}
      {formData.domain && formData.domainAvailable && (
        <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <svg
              className="w-8 h-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-xl font-bold text-green-900">
                {formData.domain} is available!
              </h3>
              <p className="text-green-700">
                {formData.domainPrice && `$${formData.domainPrice.toFixed(2)}/year`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Domain Taken */}
      {formData.domain && !formData.domainAvailable && (
        <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-xl font-bold text-red-900">
                {formData.domain} is already taken
              </h3>
              <p className="text-red-700">Try one of our suggestions below</p>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {(suggestions.length > 0 || loadingSuggestions) && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Available Alternatives</h3>
          {loadingSuggestions ? (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Finding available domains...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.domain}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
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
                    <span className="font-semibold text-gray-900">
                      {suggestion.domain}
                    </span>
                  </div>
                  {suggestion.price && (
                    <span className="text-blue-600 font-semibold">
                      ${suggestion.price.toFixed(2)}/year
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
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
          disabled={!formData.domain || !formData.domainAvailable}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Hosting →
        </button>
      </div>
    </div>
  );
};
