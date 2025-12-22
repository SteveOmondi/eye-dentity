import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { domainApi } from '../api/domain';

interface Suggestion {
  domain: string;
  available: boolean;
  price?: number;
}

export const DomainSearchStep = () => {
  const { formData, updateFormData } = useFormStore();
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

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Nexus <span className="text-wizard-accent">Address</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Acquire your unique digital identifier. This node will serve as the primary link to your digital entity.
        </p>
      </div>

      {error && (
        <div className="mb-10 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
          Signal Interruption: {error}
        </div>
      )}

      {/* Domain Search Container */}
      <div className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-wizard-accent/10 to-transparent blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
        <div className="relative flex gap-4 p-2 bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="ENTER IDENTITY NAME..."
            className="flex-1 bg-transparent px-8 py-5 text-white text-lg font-black tracking-tight placeholder:text-white/10 focus:outline-none uppercase"
          />
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-10 py-5 bg-wizard-accent text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(196,240,66,0.2)] disabled:opacity-50"
          >
            {checking ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Scanning</span>
              </div>
            ) : (
              'Verify Node'
            )}
          </button>
        </div>
        <div className="mt-4 px-2 flex items-center justify-between">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-1 h-1 bg-wizard-accent rounded-full animate-pulse" /> Protocol: High-Fidelity Domain Retrieval
          </p>
          <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em]">
            GLOBAL AVAILABILITY CHECKER
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Availability Success Result */}
        {formData.domain && formData.domainAvailable && (
          <div className="glass-card border border-wizard-accent/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between animate-fade-in group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-wizard-accent/5 blur-[100px] pointer-events-none group-hover:bg-wizard-accent/10 transition-colors" />

            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 rounded-[1.5rem] bg-wizard-accent/10 border border-wizard-accent/20 flex items-center justify-center shadow-[0_0_40px_rgba(196,240,66,0.1)] group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{formData.domain}</h3>
                <p className="text-wizard-accent text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-wizard-accent rounded-full animate-ping" /> NODE SECURED & READY
                </p>
              </div>
            </div>
            {formData.domainPrice && (
              <div className="text-center md:text-right mt-8 md:mt-0 relative z-10 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-4xl font-black text-white tracking-tighter">${formData.domainPrice.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">CREDITS / CYCLE</p>
              </div>
            )}
          </div>
        )}

        {/* Domain Taken Result */}
        {formData.domain && !formData.domainAvailable && (
          <div className="glass-card border border-white/5 rounded-[2.5rem] p-10 flex items-center gap-8 animate-fade-in opacity-80 group">
            <div className="w-20 h-20 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white/30 tracking-tighter uppercase line-through">{formData.domain}</h3>
              <p className="text-red-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-2">LINKAGE UNAVAILABLE: NODE OCCUPIED</p>
            </div>
          </div>
        )}

        {/* Suggestions Section */}
        {(suggestions.length > 0 || loadingSuggestions) && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-6 mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 whitespace-nowrap">Suggested Coordinates</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {loadingSuggestions ? (
              <div className="flex flex-col items-center py-16 glass-card border border-white/5 rounded-[2rem]">
                <div className="w-12 h-12 border-2 border-wizard-accent border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">DECODING ALTERNATIVE DOMAINS...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.domain}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="group flex flex-col md:flex-row items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-wizard-accent/40 hover:bg-wizard-accent/[0.01] transition-all text-left relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-wizard-accent/0 via-wizard-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-6">
                      <div className="w-3 h-3 rounded-full bg-wizard-accent/20 group-hover:bg-wizard-accent transition-colors shadow-[0_0_15px_rgba(196,240,66,0)] group-hover:shadow-[0_0_15px_rgba(196,240,66,0.5)]" />
                      <span className="text-xl font-black text-white tracking-tight uppercase">{suggestion.domain}</span>
                    </div>
                    {suggestion.price && (
                      <div className="relative text-center md:text-right mt-4 md:mt-0 flex items-center gap-4">
                        <span className="text-xl font-black text-wizard-accent tracking-tighter">${suggestion.price.toFixed(2)}</span>
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">/ CYCLE</span>
                        <div className="w-10 h-10 rounded-xl bg-wizard-accent/10 border border-wizard-accent/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                          <svg className="w-5 h-5 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

