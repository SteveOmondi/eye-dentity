import { Router } from 'express';
import { Request, Response } from 'express';
import {
    startChatSession,
    processMessage,
    getChatSession,
    deleteChatSession,
    getUserChatSessions,
} from '../services/chat.service';
import { authenticate } from '../middleware/auth';
import type { LLMProvider } from '../services/llm-provider.service';

const router = Router();

/**
 * POST /api/chat/start
 * Start a new chat session
 */
router.post('/start', async (req: Request, res: Response) => {
    try {
        const { provider = 'gemini' } = req.body;
        const userId = (req as any).user?.id; // Optional: user might not be logged in

        const session = await startChatSession(provider as LLMProvider, userId);

        res.json({
            success: true,
            session: {
                id: session.id,
                sessionToken: session.sessionToken,
                messages: session.messages,
                progress: session.completionProgress,
            },
        });
    } catch (error: any) {
        console.error('Start chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to start chat session',
        });
    }
});

/**
 * POST /api/chat/message
 * Send a message in a chat session
 */
router.post('/message', async (req: Request, res: Response) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Session ID and message are required',
            });
        }

        const session = await processMessage(sessionId, message);

        res.json({
            success: true,
            session: {
                id: session.id,
                messages: session.messages,
                collectedData: session.collectedData,
                progress: session.completionProgress,
                isComplete: session.isComplete,
            },
        });
    } catch (error: any) {
        console.error('Process message error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process message',
        });
    }
});

/**
 * GET /api/chat/session/:id
 * Get a chat session by ID or token
 */
router.get('/session/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const session = await getChatSession(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Chat session not found',
            });
        }

        res.json({
            success: true,
            session: {
                id: session.id,
                messages: session.messages,
                collectedData: session.collectedData,
                progress: session.completionProgress,
                isComplete: session.isComplete,
            },
        });
    } catch (error: any) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get chat session',
        });
    }
});

/**
 * GET /api/chat/sessions
 * Get user's chat sessions (requires authentication)
 */
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const sessions = await getUserChatSessions(userId);

        res.json({
            success: true,
            sessions: sessions.map((s) => ({
                id: s.id,
                progress: s.completionProgress,
                isComplete: s.isComplete,
                provider: s.provider,
            })),
        });
    } catch (error: any) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get chat sessions',
        });
    }
});

/**
 * DELETE /api/chat/session/:id
 * Delete a chat session
 */
router.delete('/session/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await deleteChatSession(id);

        res.json({
            success: true,
            message: 'Chat session deleted',
        });
    } catch (error: any) {
        console.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete chat session',
        });
    }
});

export default router;
