import { useFormStore } from '../store/formStore';
import { StepProgress } from './StepProgress';
import { PersonalInfoStep } from './PersonalInfoStep';
import { BioServicesStep } from './BioServicesStep';
import { BrandingStep } from './BrandingStep';
import { TemplateSelectionStep } from './TemplateSelectionStep';
import { DomainSearchStep } from './DomainSearchStep';
import { HostingPlanStep } from './HostingPlanStep';
import { OrderSummary } from './OrderSummary';

const TOTAL_STEPS = 7;

export const WebsiteBuilderForm = () => {
  const { currentStep } = useFormStore();

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

            {/* Exit/Save Draft Button */}
            <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* Step Progress Indicator */}
      <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto">
          {renderStep()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Eye-Dentity. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Help
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
