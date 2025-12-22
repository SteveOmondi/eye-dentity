import { useState } from 'react';

interface BuilderModeSelectorProps {
    onModeSelect: (mode: 'form' | 'chat') => void;
}

export const BuilderModeSelector = ({ onModeSelect }: BuilderModeSelectorProps) => {
    const [selectedMode, setSelectedMode] = useState<'form' | 'chat' | null>(null);

    const handleSelect = (mode: 'form' | 'chat') => {
        setSelectedMode(mode);
        setTimeout(() => onModeSelect(mode), 300);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] bg-mesh-gradient flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(157,80,187,0.05)_0%,transparent_50%)]" />

            <div className="max-w-5xl w-full relative z-10 animate-fade-up">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                        Select Your <span className="text-wizard-accent">Protocol</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
                        Choose your configuration interface
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Chat Mode */}
                    <div
                        onClick={() => handleSelect('chat')}
                        className={`glass-card rounded-[3rem] p-10 transition-all duration-500 cursor-pointer border relative group overflow-hidden ${selectedMode === 'chat'
                            ? 'border-wizard-accent/50 scale-[1.02] shadow-[0_0_50px_rgba(196,240,66,0.1)]'
                            : 'border-white/5 hover:border-wizard-accent/30 hover:scale-[1.01]'
                            }`}
                    >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-wizard-accent/10 blur-[60px] group-hover:bg-wizard-accent/20 transition-all" />

                        <div className="flex items-center justify-center w-20 h-20 bg-wizard-accent/10 border border-wizard-accent/30 rounded-2xl mb-8 group-hover:shadow-[0_0_20px_rgba(196,240,66,0.2)] transition-all">
                            <svg
                                className="w-10 h-10 text-wizard-accent"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                            </svg>
                        </div>

                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                            AI Forge
                        </h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            Initiate a high-bandwidth neural handshake for automated structure generation.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                'Natural Language Synthesis',
                                'Heuristic Parameter Discovery',
                                'Hyper-Accelerated Workflow',
                                'Smart Metadata Extraction'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 group/item">
                                    <div className="w-5 h-5 bg-wizard-accent/10 border border-wizard-accent/20 rounded-lg flex items-center justify-center text-wizard-accent group-hover/item:bg-wizard-accent group-hover/item:text-black transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] group-hover/item:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-wizard-accent/10 border border-wizard-accent/20 rounded-2xl p-4 text-center">
                            <span className="text-[10px] font-black text-wizard-accent uppercase tracking-widest">
                                ⭐ Primary Protocol Recommended
                            </span>
                        </div>
                    </div>

                    {/* Form Mode */}
                    <div
                        onClick={() => handleSelect('form')}
                        className={`glass-card rounded-[3rem] p-10 transition-all duration-500 cursor-pointer border relative group overflow-hidden ${selectedMode === 'form'
                            ? 'border-wizard-purple/50 scale-[1.02] shadow-[0_0_50px_rgba(157,80,187,0.1)]'
                            : 'border-white/5 hover:border-wizard-purple/30 hover:scale-[1.01]'
                            }`}
                    >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-wizard-purple/10 blur-[60px] group-hover:bg-wizard-purple/20 transition-all" />

                        <div className="flex items-center justify-center w-20 h-20 bg-wizard-purple/10 border border-wizard-purple/30 rounded-2xl mb-8 group-hover:shadow-[0_0_20px_rgba(157,80,187,0.2)] transition-all">
                            <svg
                                className="w-10 h-10 text-wizard-purple"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>

                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                            Core Grid
                        </h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            Execute structured data entry for maximum component granularity and control.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                'Deterministic Input Fields',
                                'Granular State Management',
                                'Linear Configuration Flow',
                                'Persistent Session Tracking'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 group/item">
                                    <div className="w-5 h-5 bg-wizard-purple/10 border border-wizard-purple/20 rounded-lg flex items-center justify-center text-wizard-purple group-hover/item:bg-wizard-purple group-hover/item:text-white transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] group-hover/item:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Standard Manual Execution
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex items-center justify-center gap-4 text-gray-600">
                    <div className="h-px w-12 bg-white/5" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                        Protocols are swappable during configuration
                    </p>
                    <div className="h-px w-12 bg-white/5" />
                </div>
            </div>
        </div>
    );
};
