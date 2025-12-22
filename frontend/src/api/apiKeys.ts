import { apiClient } from './client';

export interface ApiKeyData {
    id: string;
    provider: 'claude' | 'openai' | 'gemini';
    isActive: boolean;
    lastUsed: Date | null;
    usageCount: number;
    createdAt: Date;
}

/**
 * Save an API key
 */
export const saveApiKey = async (
    provider: string,
    apiKey: string
): Promise<ApiKeyData> => {
    const response = await apiClient.post('/settings/api-keys', {
        provider,
        apiKey,
    });
    return response.data.key;
};

/**
 * Get user's API keys
 */
export const getApiKeys = async (): Promise<ApiKeyData[]> => {
    const response = await apiClient.get('/settings/api-keys');
    return response.data.keys;
};

/**
 * Delete an API key
 */
export const deleteApiKey = async (provider: string): Promise<void> => {
    await apiClient.delete(`/settings/api-keys/${provider}`);
};

/**
 * Test an API key
 */
export const testApiKey = async (
    provider: string,
    apiKey: string
): Promise<boolean> => {
    const response = await apiClient.post('/settings/api-keys/test', {
        provider,
        apiKey,
    });
    return response.data.valid;
};

export const apiKeyApi = {
    saveApiKey,
    getApiKeys,
    deleteApiKey,
    testApiKey,
};
