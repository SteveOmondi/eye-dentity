import { useState, useEffect, useRef } from 'react';
import { chatApi, type Message, type LLMProvider } from '../api/chat';
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
                const session = await chatApi.startChatSession('claude');
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
        <div className="flex flex-col h-screen max-h-[800px] bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">AI Profile Builder</h2>
                        <p className="text-sm text-purple-100">
                            Let's have a conversation to build your professional website
                        </p>
                    </div>
                    {onSwitchToForm && (
                        <button
                            onClick={onSwitchToForm}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                        >
                            Switch to Form
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{progress}% Complete</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        message={message}
                        isLatest={index === messages.length - 1}
                    />
                ))}

                <TypingIndicator show={isTyping} />

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {isComplete && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                        <p className="text-sm font-medium">
                            ✓ Profile information collected! Ready to proceed to template selection.
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Data Preview (Collapsible) */}
            {Object.keys(collectedData).length > 0 && (
                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                    <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                            📋 Collected Information ({Object.keys(collectedData).length} fields)
                        </summary>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(collectedData).map(([key, value]) => (
                                <div key={key} className="bg-white px-3 py-2 rounded border border-gray-200">
                                    <span className="font-medium text-gray-600">{key}:</span>{' '}
                                    <span className="text-gray-800">
                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isTyping || isComplete}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        rows={2}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping || isComplete}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isTyping ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                Send
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};
