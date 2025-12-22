import type { Message } from '../api/chat';

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

export const ChatMessage = ({ message, isLatest }: ChatMessageProps) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center my-6">
                <div className="bg-white/5 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full backdrop-blur-md">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8 group`}>
            <div className={`relative max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Protocol Header for Assistant */}
                {!isUser && (
                    <div className="flex items-center gap-3 mb-3 ml-2">
                        <div className="w-8 h-8 bg-wizard-accent/10 border border-wizard-accent/20 rounded-xl flex items-center justify-center text-wizard-accent shadow-[0_0_20px_rgba(196,240,66,0.1)] group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">NEURAL_ASST</span>
                            <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest animate-pulse">Data Uplink Active</span>
                        </div>
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={`relative rounded-3xl px-7 py-5 backdrop-blur-3xl transition-all duration-500 ${isUser
                        ? 'bg-wizard-accent/[0.03] border border-wizard-accent/20 text-white rounded-tr-sm hover:border-wizard-accent/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                        : 'bg-white/[0.02] border border-white/5 text-gray-300 rounded-tl-sm hover:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.3)]'
                        } ${isLatest && !isUser ? 'animate-fade-up' : ''}`}
                >
                    {/* Interior Decorative Accent */}
                    <div className={`absolute top-4 ${isUser ? 'right-4' : 'left-4'} w-1 h-1 rounded-full ${isUser ? 'bg-wizard-accent/50' : 'bg-white/20'}`} />

                    <p className="text-[13px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">
                        {message.content}
                    </p>

                    {/* Timestamp & Meta */}
                    {message.timestamp && (
                        <div className={`mt-4 flex items-center gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`h-[1px] w-4 ${isUser ? 'bg-wizard-accent/20' : 'bg-white/10'}`} />
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })} [UTC]
                            </p>
                        </div>
                    )}
                </div>

                {/* Ambient Glow for User Messages */}
                {isUser && (
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-wizard-accent/5 blur-2xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
        </div>
    );
};

interface TypingIndicatorProps {
    show: boolean;
}

export const TypingIndicator = ({ show }: TypingIndicatorProps) => {
    if (!show) return null;

    return (
        <div className="flex justify-start mb-8 animate-fade-in">
            <div className="flex flex-col items-start gap-3 ml-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-wizard-accent/5 border border-wizard-accent/20 rounded-xl flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-wizard-accent rounded-full animate-ping" />
                    </div>
                    <div className="flex gap-1.5 px-5 py-3 bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-sm">
                        <div className="w-1 h-1 bg-wizard-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-wizard-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-wizard-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
