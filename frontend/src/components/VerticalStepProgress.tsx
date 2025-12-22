// Removed unused import


interface Step {
    number: number;
    title: string;
    description: string;
}

interface VerticalStepProgressProps {
    currentStep: number;
    steps: Step[];
}

export const VerticalStepProgress = ({ currentStep, steps }: VerticalStepProgressProps) => {
    return (
        <div className="flex flex-col py-10 h-full relative">
            {/* Vertical Line Container */}
            <div className="absolute left-[1.125rem] top-14 bottom-14 w-px bg-white/5" />

            {/* Active Line Progress with Glow */}
            <div
                className="absolute left-[1.125rem] top-14 w-px bg-wizard-accent transition-all duration-1000 shadow-[0_0_15px_rgba(196,240,66,0.5)]"
                style={{
                    height: `${((currentStep - 1) / (steps.length - 1)) * 80}%`, // Calibrated for the list spacing
                    maxHeight: 'calc(100% - 8rem)'
                }}
            />

            <div className="flex flex-col justify-between h-full relative z-10 w-full space-y-12">
                {steps.map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;

                    return (
                        <div key={step.number} className="flex items-start gap-8 group cursor-pointer relative">
                            {/* Dot Architecture */}
                            <div className="relative flex items-center justify-center mt-1.5">
                                <div
                                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-500 relative z-20 ${isCurrent
                                            ? 'bg-wizard-accent border-wizard-accent shadow-[0_0_20px_rgba(196,240,66,0.8)]'
                                            : isCompleted
                                                ? 'bg-wizard-accent/20 border-wizard-accent/40 shadow-[0_0_10px_rgba(196,240,66,0.2)]'
                                                : 'bg-transparent border-white/10 group-hover:border-white/30'
                                        }`}
                                >
                                    {isCompleted && !isCurrent && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-1.5 h-1.5 text-wizard-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Radial Glow for current step */}
                                {isCurrent && (
                                    <>
                                        <div className="absolute w-8 h-8 rounded-full bg-wizard-accent/10 animate-pulse-slow" />
                                        <div className="absolute w-12 h-12 rounded-full border border-wizard-accent/20 animate-ping opacity-20" />
                                    </>
                                )}
                            </div>

                            {/* Content Layer */}
                            <div className={`flex flex-col transition-all duration-500 ${isCurrent ? 'transform translate-x-2' : 'opacity-40 group-hover:opacity-70'}`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isCurrent ? 'text-wizard-accent' : 'text-gray-500'}`}>
                                    Sequence {step.number.toString().padStart(2, '0')}
                                </h4>
                                <span className={`text-sm font-black uppercase tracking-tight ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                                    {step.title}
                                </span>
                                {isCurrent && (
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-2 animate-fade-in leading-relaxed max-w-[180px]">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
