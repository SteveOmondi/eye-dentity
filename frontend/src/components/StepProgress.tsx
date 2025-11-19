interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: 'Info', description: 'Your details' },
  { number: 2, title: 'Bio', description: 'Your story' },
  { number: 3, title: 'Branding', description: 'Visuals' },
  { number: 4, title: 'Template', description: 'Design' },
  { number: 5, title: 'Domain', description: 'Website URL' },
  { number: 6, title: 'Hosting', description: 'Choose plan' },
  { number: 7, title: 'Review', description: 'Finalize' },
];

export const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  return (
    <div className="w-full py-6 px-4 bg-white border-b">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    step.number < currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step.number === currentStep
                      ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step.number < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>

                {/* Step Label - Hidden on mobile, shown on desktop */}
                <div className="hidden md:block mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      step.number <= currentStep
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connecting Lines */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Mobile Step Title */}
        <div className="md:hidden mt-4 text-center">
          <div className="text-sm font-medium text-gray-900">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {steps[currentStep - 1]?.description}
          </div>
        </div>
      </div>
    </div>
  );
};
