import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { StepProgress } from './StepProgress';
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

const TOTAL_STEPS = 7;

export const WebsiteBuilderForm = () => {
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
      <>
        <ChatProfileBuilder
          onComplete={() => setCurrentStep(3)} // Move to branding step after chat
          onSwitchToForm={() => setBuilderMode('form')}
        />
        <ApiKeySettings
          isOpen={showApiKeySettings}
          onClose={() => setShowApiKeySettings(false)}
        />
      </>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <BioServicesStep />;
      case 3:
        return <BrandingStep />;
      case 4:
        return <TemplateSelectionStep />;
      case 5:
        return <DomainSearchStep />;
      case 6:
        return <HostingPlanStep />;
      case 7:
        return <OrderSummary />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Eye-Dentity</h1>
                <p className="text-sm text-gray-500">AI Website Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Mode Badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {builderMode === 'chat' ? '💬 Chat Mode' : '📝 Form Mode'}
              </div>

              {/* Switch Mode Button */}
              {currentStep <= 2 && (
                <button
                  onClick={() => setBuilderMode(builderMode === 'chat' ? 'form' : 'chat')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Switch to {builderMode === 'chat' ? 'Form' : 'Chat'}
                </button>
              )}

              {/* API Key Settings */}
              {builderMode === 'chat' && (
                <button
                  onClick={() => setShowApiKeySettings(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  API Keys
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Progress */}
        <div className="mb-8">
          <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStep()}
        </div>
      </main>

      {/* API Key Settings Modal */}
      <ApiKeySettings
        isOpen={showApiKeySettings}
        onClose={() => setShowApiKeySettings(false)}
      />
    </div>
  );
};
