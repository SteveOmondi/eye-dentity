import { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { hostingApi, type HostingPlan } from '../api/hosting';

export const HostingPlanStep = () => {
  const { formData, updateFormData } = useFormStore();
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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    updateFormData({ selectedPlan: planId });
  };

  const selectedPlan = plans.find((p) => p.id === formData.selectedPlan);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-2 border-wizard-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-wizard-accent animate-pulse">Loading Hosting Plans</p>
      </div>
    );
  }

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Power <span className="text-wizard-accent">Engines</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Select a neural engine to power your digital existence. Guaranteed uptime and atmospheric performance.
        </p>
      </div>

      {error && (
        <div className="mb-10 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
          Engine Failure: {error}
        </div>
      )}

      {/* Hosting Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const isSelected = formData.selectedPlan === plan.id;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`group relative rounded-[2.5rem] p-10 cursor-pointer transition-all duration-700 backdrop-blur-2xl border flex flex-col overflow-hidden ${isSelected
                ? 'bg-wizard-accent/[0.03] border-wizard-accent shadow-[0_0_50px_rgba(196,240,66,0.1)] scale-[1.03]'
                : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:scale-[1.01]'
                }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-0 right-0">
                  <span className="bg-wizard-accent text-black px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest">
                    OPTIMAL
                  </span>
                </div>
              )}

              {/* Background Glow */}
              <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[80px] transition-opacity duration-1000 ${isSelected ? 'bg-wizard-accent/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`} />

              <div className="flex flex-col h-full relative z-10">
                <div className="mb-10">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 transition-colors ${isSelected ? 'text-wizard-accent' : 'text-gray-500'}`}>
                    {plan.name} CORE
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter font-mono">${plan.price.toFixed(0)}</span>
                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">/ CYC</span>
                  </div>
                </div>

                <div className="space-y-5 mb-10 flex-1">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-wizard-accent shadow-[0_0_10px_rgba(196,240,66,0.8)]' : 'bg-gray-700'}`} />
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight group-hover:text-gray-300 leading-tight transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Resource Metrics */}
                <div className="pt-8 border-t border-white/5 mb-8">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">DATA MASS</span>
                      <span className="text-xs font-black text-white uppercase">{plan.resources.storage}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">LINK SPEED</span>
                      <span className="text-xs font-black text-white uppercase">{plan.resources.bandwidth}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">CPU MATRIX</span>
                      <span className="text-xs font-black text-white uppercase">{plan.resources.cpu.split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">V-MEM</span>
                      <span className="text-xs font-black text-white uppercase">{plan.resources.ram}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all ${isSelected
                    ? 'bg-wizard-accent text-black shadow-[0_0_30px_rgba(196,240,66,0.3)]'
                    : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:bg-white hover:text-black hover:border-white'
                    }`}
                >
                  {isSelected ? 'ENGINE ACTIVE' : 'ENGAGE CORE'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Email Hosting Add-on */}
      {selectedPlan && (selectedPlan.id === 'pro' || selectedPlan.id === 'premium') && (
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-wizard-accent/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
          <div className="relative glass-card border border-white/5 rounded-[2.5rem] p-10 overflow-hidden transform group-hover:scale-[1.01] transition-all duration-500">
            <label className="flex items-center gap-10 cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailHosting}
                  onChange={(e) => updateFormData({ emailHosting: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="w-16 h-8 bg-white/[0.05] border border-white/5 rounded-full transition-all peer-checked:bg-wizard-accent/20 peer-checked:border-wizard-accent/30" />
                <div className="absolute left-1.5 w-5 h-5 bg-gray-600 rounded-full transition-all peer-checked:left-9 peer-checked:bg-wizard-accent peer-checked:shadow-[0_0_15px_rgba(196,240,66,0.8)]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-wizard-accent block mb-2">Neural Messaging (Email)</span>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">Establish encrypted communication channels matching your primary node identifier.</p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
