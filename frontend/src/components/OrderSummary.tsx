import { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { hostingApi, type HostingPlan } from '../api/hosting';
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

  const calculatePaystackFee = (subtotal: number) => {
    const feePercentage = 0.015;
    const fixedFee = 25;
    return Math.round((subtotal * feePercentage + fixedFee) * 100) / 100;
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    if (formData.domainPrice) subtotal += formData.domainPrice;
    if (selectedPlan) subtotal += selectedPlan.price;
    if (formData.emailHosting) subtotal += 5.99;
    return subtotal;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const paystackFee = calculatePaystackFee(subtotal);
    return subtotal + paystackFee;
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const handleProceedToPayment = async () => {
    try {
      setProcessing(true);
      setError('');

      if (!formData.domain || !formData.domainPrice || !formData.selectedPlan || !selectedPlan) {
        setError('Missing required order information');
        return;
      }

      const response = await paymentApi.createCheckoutSession({
        domain: formData.domain,
        domainPrice: formData.domainPrice,
        hostingPlan: formData.selectedPlan,
        hostingPrice: selectedPlan.price,
        emailHosting: formData.emailHosting,
        emailHostingPrice: formData.emailHosting ? 5.99 : 0,
        metadata: {
          templateId: formData.selectedTemplate || undefined,
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

      const { error: redirectError } = await redirectToCheckout(response.sessionId);
      if (redirectError) setError(redirectError);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-2 border-wizard-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-wizard-accent animate-pulse">Generating Summary</p>
      </div>
    );
  }

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Final <span className="text-wizard-accent">Calibration</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Review your digital configuration before initiating the final deployment sequence.
        </p>
      </div>

      {error && (
        <div className="mb-10 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
          Deployment Error: {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Order Details Column */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          {/* Section: Identity */}
          <div className="glass-card border border-white/5 rounded-[2.5rem] p-10 group hover:border-white/10 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-wizard-accent/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-wizard-accent rounded-full shadow-[0_0_15px_rgba(196,240,66,0.5)]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Identity</h3>
              </div>
              <button onClick={() => handleEdit(1)} className="text-[9px] font-black uppercase tracking-[0.2em] text-wizard-accent/60 hover:text-wizard-accent transition-colors">Reconfigure</button>
            </div>

            <div className="grid gap-10 relative z-10">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 p-1 relative group/photo">
                  <div className="absolute inset-0 bg-wizard-accent/10 blur-xl opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 bg-black">
                    {formData.profilePhotoUrl ? (
                      <img src={formData.profilePhotoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-wizard-accent/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tighter uppercase">{formData.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent mt-2">{formData.profession.replace(/-/g, ' ')}</p>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 grid md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">Communication Node</p>
                  <p className="text-sm text-gray-300 font-bold">{formData.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">Direct Uplink</p>
                  <p className="text-sm text-gray-300 font-bold">{formData.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Design */}
          <div className="glass-card border border-white/5 rounded-[2.5rem] p-10 group hover:border-white/10 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-wizard-accent/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-wizard-accent rounded-full shadow-[0_0_15px_rgba(196,240,66,0.5)]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Visual Matrix</h3>
              </div>
              <button onClick={() => handleEdit(4)} className="text-[9px] font-black uppercase tracking-[0.2em] text-wizard-accent/60 hover:text-wizard-accent transition-colors">Recalibrate</button>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-10 p-8 bg-white/[0.02] rounded-3xl border border-white/5 relative z-10">
              <div className="flex items-center gap-8">
                {formData.selectedColorScheme && (
                  <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-2xl border-2 border-black rotate-[-12deg] shadow-xl" style={{ backgroundColor: formData.selectedColorScheme.primary }} />
                    <div className="w-14 h-14 rounded-2xl border-2 border-black rotate-0 shadow-xl" style={{ backgroundColor: formData.selectedColorScheme.secondary }} />
                    <div className="w-14 h-14 rounded-2xl border-2 border-black rotate-[12deg] shadow-xl" style={{ backgroundColor: formData.selectedColorScheme.accent }} />
                  </div>
                )}
                <div className="ml-4">
                  <p className="text-lg text-white font-black tracking-tighter uppercase">{formData.selectedColorScheme?.name} PALETTE</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent mt-1">Chromatic Harmony Locked</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 mb-2">Base Archetype</p>
                <p className="text-sm text-gray-300 font-bold uppercase tracking-widest bg-white/[0.05] px-4 py-2 rounded-xl border border-white/10 inline-block">Active Engine v1.02</p>
              </div>
            </div>
          </div>

          {/* Section: Technicals */}
          <div className="glass-card border border-white/5 rounded-[2.5rem] p-10 group hover:border-white/10 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-wizard-accent/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-wizard-accent rounded-full shadow-[0_0_15px_rgba(196,240,66,0.5)]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Core Detail</h3>
              </div>
              <button onClick={() => handleEdit(5)} className="text-[9px] font-black uppercase tracking-[0.2em] text-wizard-accent/60 hover:text-wizard-accent transition-colors">Sync</button>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group/item hover:bg-wizard-accent/[0.02] hover:border-wizard-accent/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-wizard-accent/10 border border-wizard-accent/20 flex items-center justify-center shadow-[0_0_30px_rgba(196,240,66,0.1)] group-hover/item:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-1.343 3-3s-1.343-3-3-3m0 6c-1.657 0-3-1.343-3-3s1.343-3-3-3m6 0H9" /></svg>
                  </div>
                  <div>
                    <p className="text-xl font-black text-white tracking-tighter uppercase">{formData.domain}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent mt-1">Digital Domain Registry</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white tracking-tighter">${formData.domainPrice?.toFixed(2)}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">/ CYCLE</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group/item hover:bg-wizard-accent/[0.02] hover:border-wizard-accent/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div>
                    <p className="text-xl font-black text-white tracking-tighter uppercase">{selectedPlan?.name} NODE</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mt-1">Processor Performance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white tracking-tighter">${selectedPlan?.price.toFixed(2)}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">/ CYCLE</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Totals Column */}
        <div className="lg:col-span-12 xl:col-span-5 relative">
          <div className="sticky top-0">
            <div className="absolute -inset-1 bg-gradient-to-b from-wizard-accent/10 to-transparent blur-3xl opacity-30" />
            <div className="relative glass-card border border-wizard-accent/20 rounded-[3rem] p-12 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
              {/* Receipt Aesthetic */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-wizard-accent/40 to-transparent" />

              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-wizard-accent mb-12 text-center opacity-80">Configuration Receipt</h3>

              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-center group/line">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover/line:text-gray-400 transition-colors">Domain Registry</span>
                  <div className="h-px flex-1 border-t border-dashed border-white/10 mx-4" />
                  <span className="text-sm font-black text-white tracking-tighter font-mono">${formData.domainPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center group/line">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover/line:text-gray-400 transition-colors">Hosting Engine</span>
                  <div className="h-px flex-1 border-t border-dashed border-white/10 mx-4" />
                  <span className="text-sm font-black text-white tracking-tighter font-mono">${selectedPlan?.price.toFixed(2)}</span>
                </div>
                {formData.emailHosting && (
                  <div className="flex justify-between items-center group/line">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover/line:text-gray-400 transition-colors">Neural Email</span>
                    <div className="h-px flex-1 border-t border-dashed border-white/10 mx-4" />
                    <span className="text-sm font-black text-white tracking-tighter font-mono">$5.99</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-8 border-t border-white/5 opacity-60">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 italic">Processing Tax / Protocol</span>
                  <div className="h-px flex-1 border-t border-dashed border-white/5 mx-4" />
                  <span className="text-xs font-black text-gray-500 font-mono">${calculatePaystackFee(calculateSubtotal()).toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-12 p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] relative overflow-hidden group/total">
                <div className="absolute -inset-1 bg-gradient-to-r from-wizard-accent/5 via-transparent to-transparent opacity-0 group-hover/total:opacity-100 transition-opacity duration-1000" />
                <div className="relative z-10">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Total Credits</span>
                    <div className="h-px flex-1 border-t border-dashed border-white/10 mx-6 opacity-30" />
                    <span className="text-wizard-accent text-[9px] font-black uppercase tracking-[0.2em]">Ready</span>
                  </div>
                  <div className="text-center mt-6">
                    <p className="text-7xl font-black text-white tracking-tighter leading-none font-mono relative">
                      <span className="text-2xl align-top mr-1 opacity-40 text-wizard-accent">$</span>{calculateTotal().toFixed(2)}
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-wizard-accent/20 blur-md rounded-full" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <button
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="w-full relative group/btn overflow-hidden bg-wizard-accent hover:bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] py-7 rounded-[1.5rem] transition-all shadow-[0_30px_60px_rgba(196,240,66,0.2)] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative z-10 flex items-center justify-center gap-4">
                    {processing ? (
                      <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Initiate Deployment</span>
                        <svg className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </div>
                </button>

                <div className="text-center">
                  <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em] leading-relaxed animate-pulse">
                    Awaiting Manual Authorization Sequence
                  </p>
                </div>
              </div>

              <div className="mt-14 pt-10 border-t border-white/5">
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-full border border-white/5 group/secure hover:border-wizard-accent/30 transition-colors">
                    <svg className="w-5 h-5 text-wizard-accent opacity-60 group-hover/secure:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover/secure:text-gray-300 transition-colors">Encoded by Paystack Secure-Link</span>
                  </div>
                  <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" className="h-6" alt="M-Pesa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 self-center" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="MasterCard" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

