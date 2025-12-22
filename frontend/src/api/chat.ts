import { apiClient } from './client';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface ChatSession {
    id: string;
    sessionToken?: string;
    messages: Message[];
    collectedData: Record<string, any>;
    progress: number;
    isComplete: boolean;
}

export type LLMProvider = 'claude' | 'openai' | 'gemini';

/**
 * Start a new chat session
 */
export const startChatSession = async (
    provider: LLMProvider = 'gemini'
): Promise<ChatSession> => {
    const response = await apiClient.post('/chat/start', { provider });
    return response.data.session;
};

/**
 * Send a message in a chat session
 */
export const sendChatMessage = async (
    sessionId: string,
    message: string
): Promise<ChatSession> => {
    const response = await apiClient.post('/chat/message', {
        sessionId,
        message,
    });
    return response.data.session;
};

/**
 * Get a chat session by ID
 */
export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
    const response = await apiClient.get(`/chat/session/${sessionId}`);
    return response.data.session;
};

/**
 * Get user's chat sessions
 */
export const getUserChatSessions = async (): Promise<ChatSession[]> => {
    const response = await apiClient.get('/chat/sessions');
    return response.data.sessions;
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/chat/session/${sessionId}`);
};

export const chatApi = {
    startChatSession,
    sendChatMessage,
    getChatSession,
    getUserChatSessions,
    deleteChatSession,
};
