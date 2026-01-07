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

            <div className="max-w-6xl w-full relative z-10 animate-fade-up">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                        Select Your <span className="text-wizard-accent">Path</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
                        Choose how you want to build your digital identity
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Chat Mode */}
                    <div
                        onClick={() => handleSelect('chat')}
                        className={`glass-card rounded-[3rem] p-12 transition-all duration-500 cursor-pointer border relative group overflow-hidden ${selectedMode === 'chat'
                            ? 'border-wizard-purple/50 scale-[1.02] shadow-[0_0_50px_rgba(157,80,187,0.1)]'
                            : 'border-white/5 hover:border-wizard-purple/30 hover:scale-[1.01]'
                            }`}
                    >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-wizard-purple/10 blur-[60px] group-hover:bg-wizard-purple/20 transition-all" />

                        <div className="flex items-center justify-center w-20 h-20 bg-wizard-purple/10 border border-wizard-purple/30 rounded-2xl mb-8 group-hover:shadow-[0_0_20px_rgba(157,80,187,0.2)] transition-all overflow-hidden p-2">
                            <img src="/donald.png" alt="Donald" className="w-full h-full object-cover rounded-xl" />
                        </div>

                        <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">
                            Build with <span className="text-wizard-accent">Donald</span>
                        </h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            The easiest way to build your brand. Just chat with Donald and watch him bring your story to life.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                'Relaxed, natural conversation',
                                'Import your resume instantly',
                                'Blazing fast setup',
                                'Smart branding suggestions'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 group/item">
                                    <div className="w-5 h-5 bg-wizard-purple/10 border border-wizard-purple/20 rounded-lg flex items-center justify-center text-wizard-purple group-hover/item:bg-wizard-purple group-hover/item:text-white transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] group-hover/item:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </div>

                        <div className="bg-wizard-purple/10 border border-wizard-purple/20 rounded-2xl p-5 text-center">
                            <span className="text-[10px] font-black text-wizard-purple uppercase tracking-widest">
                                ✨ Let's Chat
                            </span>
                        </div>
                    </div>

                    {/* Form Mode */}
                    <div
                        onClick={() => handleSelect('form')}
                        className={`glass-card rounded-[3rem] p-12 transition-all duration-500 cursor-pointer border relative group overflow-hidden ${selectedMode === 'form'
                            ? 'border-white/20 scale-[1.02] shadow-[0_0_50px_rgba(255,255,255,0.05)]'
                            : 'border-white/5 hover:border-white/20 hover:scale-[1.01]'
                            }`}
                    >
                        <div className="flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-2xl mb-8">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">
                            The Pro <span className="text-gray-400">Grid</span>
                        </h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            Total creative control over every detail. Perfect for hand-crafting your professional presence.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                'Simple, structured setup',
                                'Fast-track with your CV',
                                'Customize every single detail',
                                'Everything saved as you go'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 group/item list-none">
                                    <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 group-hover/item:bg-white/10 group-hover/item:text-white transition-all">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] group-hover/item:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                🛠️ Build Manually
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
