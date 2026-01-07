import { Request, Response } from 'express';
import {
  generateWebsite,
  getWebsiteStatus,
  regenerateWebsite,
  iterateWebsite,
  deleteWebsite,
} from '../services/website-generator.service';
import ContentGenerator from '../services/content-generator.service';
import TemplateRenderer from '../services/template-renderer.service';
import DesignEngine from '../services/design-engine.service';
import { prisma } from '../lib/prisma';

/**
 * Generate a preview of the website before payment
 */
export const generatePreview = async (req: Request, res: Response) => {
  try {
    const { profileData, templateId, colorScheme, useAIDesign } = req.body;

    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required for preview' });
    }

    // 1. Generate Content (Lightweight generation for preview)
    const generatedContent = await ContentGenerator.generateWebsiteContent(
      profileData,
      'gemini'
    );

    // 2. Generate Design Context
    const intentInput = `${profileData.profession}. ${profileData.bio || ''}`;
    const intent = await DesignEngine.understandIntent(intentInput);
    const genomeSeed = `preview-${Date.now()}`;
    const genome = DesignEngine.initializeGenome(genomeSeed);
    const tokens = await DesignEngine.generateTokens(intent, genome);
    const layoutGraph = await DesignEngine.generateLayoutGraph(intent);

    // 3. Resolve template
    const effectiveTemplateId = templateId || (useAIDesign ? 'modern-geometric' : 'professional');

    // 4. Render
    const { html, css } = await TemplateRenderer.renderWebsite({
      templateId: effectiveTemplateId,
      content: generatedContent,
      colorScheme: typeof colorScheme === 'string' ? colorScheme : (colorScheme?.name || 'default'),
      profileData,
      designTokens: tokens,
      layoutGraph: layoutGraph
    });

    return res.json({
      html,
      css,
      content: generatedContent,
      design: {
        intent,
        genome,
        tokens
      }
    });
  } catch (error: any) {
    console.error('Preview generation error:', error);
    return res.status(500).json({ error: 'Failed to generate preview' });
  }
};

/**
 * Trigger website generation
 */
export const triggerWebsiteGeneration = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Order is not completed yet' });
    }

    const metadata = order.metadata as any;
    const profileData = metadata?.profileData;
    const templateId = metadata?.templateId;
    const colorScheme = metadata?.colorScheme;
    const useAIDesign = metadata?.useAIDesign || false;

    if (!profileData || (!templateId && !useAIDesign) || !colorScheme) {
      return res.status(400).json({ error: 'Missing required order metadata. Provide a template or select AI Forge.' });
    }

    const existingWebsite = await prisma.website.findUnique({
      where: { domain: order.domain },
    });

    if (existingWebsite) {
      return res.status(400).json({
        error: 'Website already exists for this domain',
        websiteId: existingWebsite.id,
      });
    }

    generateWebsite({
      userId,
      orderId,
      profileData,
      templateId,
      colorScheme,
      domain: order.domain,
      useAIDesign,
    })
      .then((result) => {
        console.log('Website generation completed:', result);
      })
      .catch((error) => {
        console.error('Website generation failed:', error);
      });

    return res.json({
      message: 'Website generation started',
      orderId,
      domain: order.domain,
      status: 'GENERATING',
    });
  } catch (error) {
    console.error('Trigger website generation error:', error);
    return res.status(500).json({ error: 'Failed to trigger website generation' });
  }
};

export const getWebsite = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const website = await getWebsiteStatus(websiteId);

    if (website.userId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json({ website });
  } catch (error: any) {
    console.error('Get website error:', error);
    if (error.message === 'Website not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to retrieve website' });
  }
};

export const getUserWebsites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const websites = await prisma.website.findMany({
      where: { userId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ websites });
  } catch (error) {
    console.error('Get user websites error:', error);
    return res.status(500).json({ error: 'Failed to retrieve websites' });
  }
};

export const regenerateWebsiteHandler = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (website.userId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    regenerateWebsite(websiteId)
      .then((result) => {
        console.log('Website regeneration completed:', result);
      })
      .catch((error) => {
        console.error('Website regeneration failed:', error);
      });

    return res.json({
      message: 'Website regeneration started',
      websiteId,
      status: 'GENERATING',
    });
  } catch (error) {
    console.error('Regenerate website error:', error);
    return res.status(500).json({ error: 'Failed to regenerate website' });
  }
};

export const deleteWebsiteHandler = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (website.userId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await deleteWebsite(websiteId);

    return res.json({ message: 'Website deleted successfully' });
  } catch (error: any) {
    console.error('Delete website error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete website' });
  }
};

export const iterateWebsiteHandler = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const { feedback } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (website.userId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    iterateWebsite(websiteId, feedback)
      .then((result) => {
        console.log('Website iteration completed:', result);
      })
      .catch((error) => {
        console.error('Website iteration failed:', error);
      });

    return res.json({
      message: 'Website iteration started',
      websiteId,
      status: 'GENERATING',
    });
  } catch (error) {
    console.error('Iterate website error:', error);
    return res.status(500).json({ error: 'Failed to iterate on website' });
  }
};
