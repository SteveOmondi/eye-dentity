import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormStore } from '../store/formStore';
import { VerticalStepProgress } from './VerticalStepProgress';
import { PersonalInfoStep } from './PersonalInfoStep';
import { BioServicesStep } from './BioServicesStep';
import { BrandingStep } from './BrandingStep';
import { TemplateSelectionStep } from './TemplateSelectionStep';
import { DomainSearchStep } from './DomainSearchStep';
import { HostingPlanStep } from './HostingPlanStep';
import { OrderSummary } from './OrderSummary';
import { BuilderModeSelector } from './BuilderModeSelector';
import { ChatProfileBuilder } from './ChatProfileBuilder';
import { ApiKeySettings } from './ApiKeySettings';
import { ThemeToggle } from './ThemeToggle';
import { STEPS } from '../utils/constants';

export const WebsiteBuilderForm = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep } = useFormStore();
  const [builderMode, setBuilderMode] = useState<'form' | 'chat' | null>(null);
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Show mode selector if mode not chosen
  if (builderMode === null) {
    return <BuilderModeSelector onModeSelect={setBuilderMode} />;
  }

  // Show chat builder if chat mode selected and in early steps
  if (builderMode === 'chat' && currentStep <= 2) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex flex-col relative overflow-hidden font-sans">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(196,240,66,0.03)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-wizard-accent/5 blur-[150px] pointer-events-none" />

        {/* Header - Minimal version for Chat */}
        <header className="px-10 md:px-16 py-8 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-wizard-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(196,240,66,0.3)]">
              <span className="text-black font-black text-xl">E</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase group-hover:text-wizard-accent transition-colors">EYE-DENTITY</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setBuilderMode('form')}
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-text-primary border border-white/5 hover:border-wizard-accent/30 rounded-xl transition-all hover:bg-wizard-accent/5 bg-white/[0.02] backdrop-blur-md"
            >
              Switch to Grid
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Content Area */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-5xl">
            <ChatProfileBuilder
              onComplete={() => setCurrentStep(3)} // Move to branding step after chat
              onSwitchToForm={() => setBuilderMode('form')}
            />
          </div>
        </main>

        <ApiKeySettings
          isOpen={showApiKeySettings}
          onClose={() => setShowApiKeySettings(false)}
        />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PersonalInfoStep />;
      case 2: return <BioServicesStep />;
      case 3: return <BrandingStep />;
      case 4: return <TemplateSelectionStep />;
      case 5: return <DomainSearchStep />;
      case 6: return <HostingPlanStep />;
      case 7: return <OrderSummary />;
      default: return <PersonalInfoStep />;
    }
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col md:flex-row overflow-hidden font-sans relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--wizard-accent-muted)_0%,transparent_50%)] pointer-events-none" />

      {/* Left Section: Branding & Progress (30%) */}
      <aside className="w-full md:w-1/3 glass-card border-r border-white/5 flex flex-col p-10 md:p-16 relative z-10">
        {/* Logo Layer */}
        <div className="flex items-center gap-5 mb-20 relative z-10 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-14 h-14 bg-wizard-accent rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(196,240,66,0.3)] group-hover:scale-110 transition-transform duration-500">
            <span className="text-black font-black text-3xl">E</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase group-hover:text-wizard-accent transition-colors">EYE-DENTITY</h1>
            <p className="text-wizard-accent text-[8px] uppercase tracking-[0.4em] font-black opacity-80">NEURAL ARCHITECTURE</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex-1 relative z-10">
          <VerticalStepProgress currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Status / Support */}
        <div className="mt-auto pt-10 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-white/5 overflow-hidden">
                  <div className="w-full h-full bg-mesh-gradient opacity-50" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              2,048+ Identities Forged
            </p>
          </div>
          <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.3em] leading-relaxed">
            System status: <span className="text-wizard-accent">OPTIMAL</span><br />
            Latency: <span className="text-white">12MS</span>
          </p>
        </div>

        {/* Background Decorative Glow (Purple/Blue base) */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-wizard-purple/10 blur-[120px] pointer-events-none opacity-50" />
      </aside>

      {/* Right Section: Form Content (70%) */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation / Background Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-wizard-accent/5 blur-[150px] pointer-events-none" />

        {/* Header with Mode Switch */}
        <header className="px-10 md:px-16 py-8 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-wizard-accent shadow-[0_0_20px_rgba(196,240,66,0.05)]">
              {builderMode === 'chat' ? 'Neural Link Active' : 'Manual Override'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentStep <= 2 && (
              <button
                onClick={() => setBuilderMode(builderMode === 'chat' ? 'form' : 'chat')}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-text-primary border border-white/5 hover:border-wizard-accent/30 rounded-xl transition-all hover:bg-wizard-accent/5"
              >
                Switch to {builderMode === 'chat' ? 'Grid' : 'Forge'}
              </button>
            )}
            <ThemeToggle />
            <button className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
              <svg className="w-5 h-5 text-gray-500 group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </header>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto px-10 md:px-32 py-16 custom-scrollbar relative z-10 select-none">
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-up" key={currentStep}>
              {renderStep()}
            </div>
          </div>
        </div>

        {/* Navigation Controls (Stylized Arrows) */}
        <div className="px-10 md:px-32 py-10 flex items-center justify-between border-t border-white/5 bg-white/[0.02] backdrop-blur-2xl relative z-20">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white disabled:opacity-0 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-wizard-accent/50 group-hover:bg-wizard-accent/5 transition-all">
              <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="hidden sm:inline">Initialize Backstep</span>
          </button>

          <div className="flex items-center gap-3">
            {STEPS.map(s => (
              <div
                key={s.number}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${s.number === currentStep
                  ? 'w-10 bg-wizard-accent shadow-[0_0_15px_rgba(196,240,66,0.3)]'
                  : s.number < currentStep ? 'bg-wizard-accent/40' : 'bg-white/10'}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === 7}
            className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent hover:text-white disabled:opacity-0 transition-all group"
          >
            <span className="hidden sm:inline">Advancing Sequence</span>
            <div className="w-14 h-14 rounded-2xl bg-wizard-accent/10 border border-wizard-accent/20 flex items-center justify-center group-hover:bg-wizard-accent group-hover:text-black transition-all shadow-[0_0_20px_rgba(196,240,66,0.1)] group-hover:shadow-[0_0_30px_rgba(196,240,66,0.3)]">
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </main>

      {/* Modals & Overlays */}
      <ApiKeySettings
        isOpen={showApiKeySettings}
        onClose={() => setShowApiKeySettings(false)}
      />
    </div>
  );
};

