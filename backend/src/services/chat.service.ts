import { prisma } from '../config/database';
import {
    sendMessage,
    extractDataFromResponse,
    calculateProgress,
    type LLMProvider,
    type Message,
} from './llm-provider.service';

export interface ChatSession {
    id: string;
    sessionToken: string;
    messages: Message[];
    collectedData: Record<string, any>;
    provider: LLMProvider;
    isComplete: boolean;
    completionProgress: number;
    currentTopic: string | null;
}

/**
 * System prompt for the conversational profile builder
 */
const SYSTEM_PROMPT = `You are a friendly and professional AI assistant helping users build their professional website. Your goal is to collect comprehensive information through natural conversation.

CONVERSATION GUIDELINES:
1. Ask ONE question at a time
2. Be conversational, warm, and encouraging
3. Extract information from natural responses
4. Ask clarifying follow-up questions when needed
5. Adapt questions based on the user's profession
6. Confirm collected data before moving to next topic

REQUIRED DATA TO COLLECT:
- Name, Email, Company Name, Professional Tagline
- Profession, Years of Experience, Location
- Professional Bio, Mission Statement
- Services Offered, Specializations, Service Areas
- Languages Spoken (optional)

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "message": "Your conversational response to the user",
  "extractedData": {
    "fieldName": "value extracted from user's response"
  },
  "nextTopic": "topic to ask about next",
  "isComplete": false
}

IMPORTANT:
- Be natural and conversational in your "message"
- Only extract data that the user explicitly provided
- Don't make assumptions
- When you have all required data, set "isComplete": true`;

/**
 * Start a new chat session
 */
export async function startChatSession(
    provider: LLMProvider = 'gemini',
    userId?: string
): Promise<ChatSession> {
    const session = await prisma.chatSession.create({
        data: {
            userId,
            provider,
            mode: 'chat',
            messages: [],
            collectedData: {},
            completionProgress: 0,
        },
    });

    // Get initial greeting from AI
    const initialMessage = await sendMessage(
        provider,
        [],
        SYSTEM_PROMPT + '\n\nStart the conversation by greeting the user and asking for their profession.',
        userId
    );

    const parsedResponse = parseAIResponse(initialMessage);

    const messages: Message[] = [
        {
            role: 'assistant',
            content: parsedResponse.message,
            timestamp: new Date(),
        },
    ];

    await prisma.chatSession.update({
        where: { id: session.id },
        data: {
            messages: JSON.stringify(messages),
            currentTopic: parsedResponse.nextTopic || 'profession',
        },
    });

    return {
        id: session.id,
        sessionToken: session.sessionToken,
        messages,
        collectedData: {},
        provider,
        isComplete: false,
        completionProgress: 0,
        currentTopic: parsedResponse.nextTopic || 'profession',
    };
}

/**
 * Process user message and get AI response
 */
export async function processMessage(
    sessionId: string,
    userMessage: string
): Promise<ChatSession> {
    console.log('--- processMessage START ---');
    console.log('SessionID:', sessionId);
    console.log('UserMessage:', userMessage);

    const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new Error('Chat session not found');
    }

    console.log('Session found, parsing messages...');
    const messages: Message[] = JSON.parse(session.messages as string);
    const collectedData: Record<string, any> = JSON.parse(session.collectedData as string);
    console.log('Messages parsed. Count:', messages.length);

    // Add user message
    messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
    });

    // Get AI response
    const contextPrompt = `
Current collected data: ${JSON.stringify(collectedData, null, 2)}
Current topic: ${session.currentTopic || 'unknown'}

Continue the conversation naturally. Extract any new information from the user's response and ask the next relevant question.
`;

    console.log('Calling sendMessage...');
    const aiResponse = await sendMessage(
        session.provider as LLMProvider,
        messages,
        SYSTEM_PROMPT + '\n\n' + contextPrompt,
        session.userId || undefined
    );
    console.log('sendMessage returned. Response length:', aiResponse?.length || 0);

    const parsedResponse = parseAIResponse(aiResponse);

    // Add AI message
    messages.push({
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date(),
    });

    // Merge extracted data
    const updatedData = {
        ...collectedData,
        ...parsedResponse.extractedData,
    };

    // Calculate progress
    const progress = calculateProgress(updatedData);
    const isComplete = parsedResponse.isComplete || progress >= 100;

    // Update session
    await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
            messages: JSON.stringify(messages),
            collectedData: JSON.stringify(updatedData),
            currentTopic: parsedResponse.nextTopic,
            completionProgress: progress,
            isComplete,
            completedAt: isComplete ? new Date() : null,
        },
    });

    return {
        id: session.id,
        sessionToken: session.sessionToken,
        messages,
        collectedData: updatedData,
        provider: session.provider as LLMProvider,
        isComplete,
        completionProgress: progress,
        currentTopic: parsedResponse.nextTopic || null,
    };
}

/**
 * Get chat session by ID or token
 */
export async function getChatSession(
    sessionIdOrToken: string
): Promise<ChatSession | null> {
    const session = await prisma.chatSession.findFirst({
        where: {
            OR: [
                { id: sessionIdOrToken },
                { sessionToken: sessionIdOrToken },
            ],
        },
    });

    if (!session) {
        return null;
    }

    return {
        id: session.id,
        sessionToken: session.sessionToken,
        messages: JSON.parse(session.messages as string),
        collectedData: JSON.parse(session.collectedData as string),
        provider: session.provider as LLMProvider,
        isComplete: session.isComplete,
        completionProgress: session.completionProgress,
        currentTopic: session.currentTopic,
    };
}

/**
 * Parse AI response to extract structured data
 */
function parseAIResponse(response: string): {
    message: string;
    extractedData: Record<string, any>;
    nextTopic?: string;
    isComplete: boolean;
} {
    try {
        // Try to parse as JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                message: parsed.message || response,
                extractedData: parsed.extractedData || {},
                nextTopic: parsed.nextTopic,
                isComplete: parsed.isComplete || false,
            };
        }
    } catch (error) {
        console.error('Failed to parse AI response:', error);
    }

    // Fallback: treat entire response as message
    return {
        message: response,
        extractedData: {},
        isComplete: false,
    };
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
    await prisma.chatSession.delete({
        where: { id: sessionId },
    });
}

/**
 * Get user's chat sessions
 */
export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
    const sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    return sessions.map((session) => ({
        id: session.id,
        sessionToken: session.sessionToken,
        messages: JSON.parse(session.messages as string),
        collectedData: JSON.parse(session.collectedData as string),
        provider: session.provider as LLMProvider,
        isComplete: session.isComplete,
        completionProgress: session.completionProgress,
        currentTopic: session.currentTopic,
    }));
}
