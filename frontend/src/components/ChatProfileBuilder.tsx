import { useState, useEffect, useRef } from 'react';
import { chatApi, type Message } from '../api/chat';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { useFormStore } from '../store/formStore';

interface ChatProfileBuilderProps {
    onComplete?: () => void;
    onSwitchToForm?: () => void;
}

export const ChatProfileBuilder = ({
    onComplete,
    onSwitchToForm,
}: ChatProfileBuilderProps) => {
    const { updateFormData } = useFormStore();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [progress, setProgress] = useState(0);
    const [collectedData, setCollectedData] = useState<Record<string, any>>({});
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Start chat session on mount
    useEffect(() => {
        const startChat = async () => {
            try {
                const session = await chatApi.startChatSession('gemini');
                setSessionId(session.id);
                setMessages(session.messages);
                setProgress(session.progress);
            } catch (err: any) {
                setError(err.message || 'Failed to start chat session');
            }
        };

        startChat();
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !sessionId || isTyping) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date(),
        };

        // Add user message immediately
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        setError(null);

        try {
            const session = await chatApi.sendChatMessage(sessionId, userMessage.content);

            // Update messages with AI response
            setMessages(session.messages);
            setProgress(session.progress);
            setCollectedData(session.collectedData);
            setIsComplete(session.isComplete);

            // Update form store with collected data
            updateFormData(session.collectedData);

            // If complete, notify parent
            if (session.isComplete && onComplete) {
                setTimeout(() => onComplete(), 1000);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
            // Remove the user message if failed
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[75vh] min-h-[600px] glass-card border border-white/5 rounded-[3rem] overflow-hidden relative group animate-fade-up">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-wizard-accent/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-wizard-purple/5 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 px-10 py-8 border-b border-white/5 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-wizard-accent/10 border border-wizard-accent/20 rounded-2xl flex items-center justify-center text-wizard-accent shadow-[0_0_20px_rgba(196,240,66,0.1)]">
                            <span className="text-xl font-black">E</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Neural <span className="text-wizard-accent">Forge</span></h2>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Initialize Configuration Protocol</p>
                        </div>
                    </div>
                    {onSwitchToForm && (
                        <button
                            onClick={onSwitchToForm}
                            className="px-6 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-[0.2em] transition-all"
                        >
                            Switch to Grid
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-wizard-accent uppercase tracking-[0.3em]">Synapse Sync</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{progress}%</span>
                            <div className="w-1.5 h-1.5 bg-wizard-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(196,240,66,0.8)]" />
                        </div>
                    </div>
                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-wizard-accent h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(196,240,66,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar relative z-10">
                {messages.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                        <div className="w-1 bg-wizard-accent/20 h-20 mb-6 rounded-full" />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Awaiting Link Integration</p>
                    </div>
                )}

                <div className="space-y-2">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message}
                            isLatest={index === messages.length - 1}
                        />
                    ))}
                </div>

                <TypingIndicator show={isTyping} />

                {error && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-5 rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                        Protocol Breach: {error}
                    </div>
                )}

                {isComplete && (
                    <div className="mt-8 bg-wizard-accent/10 border border-wizard-accent/30 text-wizard-accent px-8 py-6 rounded-[2.5rem] flex items-center gap-6 animate-fade-up">
                        <div className="w-10 h-10 rounded-xl bg-wizard-accent flex items-center justify-center text-black">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                                Synaptic Transmission Complete
                            </p>
                            <p className="text-[8px] font-bold text-wizard-accent/60 uppercase tracking-widest mt-1">
                                Identity Forge stabilized. Initializing Branding Matrix.
                            </p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Data Preview */}
            {Object.keys(collectedData).length > 0 && (
                <div className="px-10 py-5 border-t border-white/5 bg-white/[0.01] relative z-10 backdrop-blur-md">
                    <details className="group">
                        <summary className="list-none cursor-pointer flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-wizard-accent/40" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Collected Datagrams</span>
                            </div>
                            <span className="text-[8px] font-black text-wizard-accent border border-wizard-accent/20 px-3 py-1 rounded-lg uppercase tracking-widest group-open:bg-wizard-accent group-open:text-black transition-all">
                                {Object.keys(collectedData).length} Segments
                            </span>
                        </summary>
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-up max-h-40 overflow-y-auto custom-scrollbar pr-4">
                            {Object.entries(collectedData).map(([key, value]) => (
                                <div key={key} className="bg-white/[0.02] border border-white/5 px-4 py-3 rounded-2xl">
                                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.2em] block mb-1">{key}</span>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight line-clamp-2">
                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}

            {/* Input Area */}
            <div className="px-8 py-8 border-t border-white/5 bg-[#0d0d0d]/40 backdrop-blur-2xl relative z-10">
                <div className="relative">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Uplink transmission content..."
                        disabled={isTyping || isComplete}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-[13px] text-white placeholder:text-gray-600 focus:outline-none focus:border-wizard-accent/40 focus:bg-wizard-accent/[0.02] transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar"
                        rows={1}
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-3">
                        <p className="hidden sm:block text-[8px] font-black text-gray-700 uppercase tracking-[0.2em]">SHIFT+ENTER FOR LINE</p>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping || isComplete}
                            className="w-12 h-12 bg-wizard-accent/10 border border-wizard-accent/20 rounded-2xl flex items-center justify-center text-wizard-accent hover:bg-wizard-accent hover:text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(196,240,66,0.05)]"
                        >
                            {isTyping ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
