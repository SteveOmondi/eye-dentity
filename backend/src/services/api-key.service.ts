import { prisma } from '../config/database';
import { encrypt, decrypt, hash } from '../utils/encryption';

export type LLMProvider = 'claude' | 'openai' | 'gemini';

export interface ApiKeyData {
    id: string;
    provider: LLMProvider;
    isActive: boolean;
    lastUsed: Date | null;
    usageCount: number;
    createdAt: Date;
}

/**
 * Save user's API key (encrypted)
 */
export async function saveApiKey(
    userId: string,
    provider: LLMProvider,
    apiKey: string
): Promise<ApiKeyData> {
    const encryptedKey = encrypt(apiKey);
    const keyHash = hash(apiKey);

    const savedKey = await prisma.apiKey.upsert({
        where: {
            userId_provider: {
                userId,
                provider,
            },
        },
        update: {
            encryptedKey,
            keyHash,
            isActive: true,
            updatedAt: new Date(),
        },
        create: {
            userId,
            provider,
            encryptedKey,
            keyHash,
            isActive: true,
        },
    });

    return {
        id: savedKey.id,
        provider: savedKey.provider as LLMProvider,
        isActive: savedKey.isActive,
        lastUsed: savedKey.lastUsed,
        usageCount: savedKey.usageCount,
        createdAt: savedKey.createdAt,
    };
}

/**
 * Get decrypted API key for a user and provider
 */
export async function getApiKey(
    userId: string,
    provider: LLMProvider
): Promise<string | null> {
    const apiKeyRecord = await prisma.apiKey.findUnique({
        where: {
            userId_provider: {
                userId,
                provider,
            },
        },
    });

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
        return null;
    }

    // Update last used
    await prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: {
            lastUsed: new Date(),
            usageCount: { increment: 1 },
        },
    });

    return decrypt(apiKeyRecord.encryptedKey);
}

/**
 * Get all API keys for a user (without decrypting)
 */
export async function getUserApiKeys(userId: string): Promise<ApiKeyData[]> {
    const keys = await prisma.apiKey.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    return keys.map((key) => ({
        id: key.id,
        provider: key.provider as LLMProvider,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        usageCount: key.usageCount,
        createdAt: key.createdAt,
    }));
}

/**
 * Delete an API key
 */
export async function deleteApiKey(userId: string, provider: LLMProvider): Promise<void> {
    await prisma.apiKey.delete({
        where: {
            userId_provider: {
                userId,
                provider,
            },
        },
    });
}

/**
 * Deactivate an API key
 */
export async function deactivateApiKey(userId: string, provider: LLMProvider): Promise<void> {
    await prisma.apiKey.update({
        where: {
            userId_provider: {
                userId,
                provider,
            },
        },
        data: {
            isActive: false,
        },
    });
}

/**
 * Test if an API key is valid by making a test request
 */
export async function testApiKey(provider: LLMProvider, apiKey: string): Promise<boolean> {
    try {
        switch (provider) {
            case 'claude': {
                const Anthropic = (await import('@anthropic-ai/sdk')).default;
                const client = new Anthropic({ apiKey });
                await client.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'test' }],
                });
                return true;
            }

            case 'openai': {
                const OpenAI = (await import('openai')).default;
                const client = new OpenAI({ apiKey });
                await client.chat.completions.create({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 10,
                });
                return true;
            }

            case 'gemini': {
                // TODO: Implement Gemini test when SDK is added
                return false;
            }

            default:
                return false;
        }
    } catch (error) {
        console.error(`API key test failed for ${provider}:`, error);
        return false;
    }
}
