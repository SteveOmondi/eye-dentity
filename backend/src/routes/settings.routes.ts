import { Router } from 'express';
import { Request, Response } from 'express';
import {
    saveApiKey,
    getUserApiKeys,
    deleteApiKey,
    testApiKey,
} from '../services/api-key.service';
import { authenticate } from '../middleware/auth.middleware';
import type { LLMProvider } from '../services/llm-provider.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/settings/api-keys
 * Save a new API key
 */
router.post('/api-keys', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({
                success: false,
                error: 'Provider and API key are required',
            });
        }

        // Test the key first
        const isValid = await testApiKey(provider as LLMProvider, apiKey);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid API key. Please check and try again.',
            });
        }

        const savedKey = await saveApiKey(userId, provider as LLMProvider, apiKey);

        res.json({
            success: true,
            key: {
                id: savedKey.id,
                provider: savedKey.provider,
                isActive: savedKey.isActive,
            },
        });
    } catch (error: any) {
        console.error('Save API key error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to save API key',
        });
    }
});

/**
 * GET /api/settings/api-keys
 * Get user's API keys
 */
router.get('/api-keys', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const keys = await getUserApiKeys(userId);

        res.json({
            success: true,
            keys: keys.map((k) => ({
                id: k.id,
                provider: k.provider,
                isActive: k.isActive,
                lastUsed: k.lastUsed,
                usageCount: k.usageCount,
                createdAt: k.createdAt,
            })),
        });
    } catch (error: any) {
        console.error('Get API keys error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get API keys',
        });
    }
});

/**
 * DELETE /api/settings/api-keys/:provider
 * Delete an API key
 */
router.delete('/api-keys/:provider', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { provider } = req.params;

        await deleteApiKey(userId, provider as LLMProvider);

        res.json({
            success: true,
            message: 'API key deleted',
        });
    } catch (error: any) {
        console.error('Delete API key error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete API key',
        });
    }
});

/**
 * POST /api/settings/api-keys/test
 * Test an API key
 */
router.post('/api-keys/test', async (req: Request, res: Response) => {
    try {
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({
                success: false,
                error: 'Provider and API key are required',
            });
        }

        const isValid = await testApiKey(provider as LLMProvider, apiKey);

        res.json({
            success: true,
            valid: isValid,
        });
    } catch (error: any) {
        console.error('Test API key error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to test API key',
        });
    }
});

export default router;
