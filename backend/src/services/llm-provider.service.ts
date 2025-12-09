import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getApiKey } from './api-key.service';

export type LLMProvider = 'claude' | 'openai' | 'gemini';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface LLMResponse {
    message: string;
    extractedData?: Record<string, any>;
    nextTopic?: string;
    progress?: number;
}

/**
 * Send message to LLM and get response
 */
export async function sendMessage(
    provider: LLMProvider,
    messages: Message[],
    systemPrompt: string,
    userId?: string
): Promise<string> {
    // Get user's API key if provided, otherwise use platform key
    let apiKey: string | undefined;

    if (userId) {
        const userKey = await getApiKey(userId, provider);
        if (userKey) {
            apiKey = userKey;
        }
    }

    // Fallback to platform keys
    if (!apiKey) {
        apiKey = getPlatformApiKey(provider);
    }

    if (!apiKey) {
        throw new Error(`No API key available for provider: ${provider}`);
    }

    switch (provider) {
        case 'claude':
            return await sendMessageToClaude(messages, systemPrompt, apiKey);
        case 'openai':
            return await sendMessageToOpenAI(messages, systemPrompt, apiKey);
        case 'gemini':
            throw new Error('Gemini provider not yet implemented');
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

/**
 * Send message to Claude
 */
async function sendMessageToClaude(
    messages: Message[],
    systemPrompt: string,
    apiKey: string
): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    // Convert messages to Claude format
    const claudeMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: claudeMessages,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
}

/**
 * Send message to OpenAI
 */
async function sendMessageToOpenAI(
    messages: Message[],
    systemPrompt: string,
    apiKey: string
): Promise<string> {
    const openai = new OpenAI({ apiKey });

    // Convert messages to OpenAI format
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
        })),
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 2048,
    });

    return response.choices[0]?.message?.content || '';
}

/**
 * Get platform API key from environment
 */
function getPlatformApiKey(provider: LLMProvider): string | undefined {
    switch (provider) {
        case 'claude':
            return process.env.ANTHROPIC_API_KEY;
        case 'openai':
            return process.env.OPENAI_API_KEY;
        case 'gemini':
            return process.env.GEMINI_API_KEY;
        default:
            return undefined;
    }
}

/**
 * Extract structured data from AI response
 */
export function extractDataFromResponse(response: string): Record<string, any> {
    try {
        // Try to find JSON in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.extractedData || {};
        }
    } catch (error) {
        console.error('Failed to extract data from response:', error);
    }

    return {};
}

/**
 * Calculate conversation progress (0-100)
 */
export function calculateProgress(collectedData: Record<string, any>): number {
    const requiredFields = [
        'name',
        'email',
        'companyName',
        'tagline',
        'profession',
        'bio',
        'services',
    ];

    const optionalFields = [
        'phone',
        'yearsOfExperience',
        'location',
        'languages',
        'specializations',
        'missionStatement',
        'serviceAreas',
    ];

    let score = 0;
    const requiredWeight = 70; // 70% for required fields
    const optionalWeight = 30; // 30% for optional fields

    // Calculate required fields score
    const completedRequired = requiredFields.filter(
        (field) => collectedData[field] && collectedData[field].length > 0
    ).length;
    score += (completedRequired / requiredFields.length) * requiredWeight;

    // Calculate optional fields score
    const completedOptional = optionalFields.filter(
        (field) => collectedData[field] && collectedData[field].length > 0
    ).length;
    score += (completedOptional / optionalFields.length) * optionalWeight;

    return Math.round(score);
}
