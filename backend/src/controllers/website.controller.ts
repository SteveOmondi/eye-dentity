import { Request, Response } from 'express';
import {
  generateWebsite,
  getWebsiteStatus,
  regenerateWebsite,
  deleteWebsite,
} from '../services/website-generator.service';
import { prisma } from '../lib/prisma';

/**
 * Trigger website generation
 * Usually called automatically after successful payment
 */
export const triggerWebsiteGeneration = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if order is completed
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Order is not completed yet' });
    }

    // Get profile data from order metadata
    const metadata = order.metadata as any;
    const profileData = metadata?.profileData;
    const templateId = metadata?.templateId;
    const colorScheme = metadata?.colorScheme;

    if (!profileData || !templateId || !colorScheme) {
      return res.status(400).json({ error: 'Missing required order metadata' });
    }

    // Check if website already exists for this domain
    const existingWebsite = await prisma.website.findUnique({
      where: { domain: order.domain },
    });

    if (existingWebsite) {
      return res.status(400).json({
        error: 'Website already exists for this domain',
        websiteId: existingWebsite.id,
      });
    }

    // Trigger website generation (asynchronously)
    // In production, this would be a background job
    generateWebsite({
      userId,
      orderId,
      profileData,
      templateId,
      colorScheme,
      domain: order.domain,
    })
      .then((result) => {
        console.log('Website generation completed:', result);
      })
      .catch((error) => {
        console.error('Website generation failed:', error);
      });

    res.json({
      message: 'Website generation started',
      orderId,
      domain: order.domain,
      status: 'GENERATING',
    });
  } catch (error) {
    console.error('Trigger website generation error:', error);
    res.status(500).json({ error: 'Failed to trigger website generation' });
  }
};

/**
 * Get website details
 */
export const getWebsite = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const website = await getWebsiteStatus(websiteId);

    // Verify user owns this website
    if (website.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ website });
  } catch (error: any) {
    console.error('Get website error:', error);
    if (error.message === 'Website not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to retrieve website' });
  }
};

/**
 * Get all websites for authenticated user
 */
export const getUserWebsites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

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

    res.json({ websites });
  } catch (error) {
    console.error('Get user websites error:', error);
    res.status(500).json({ error: 'Failed to retrieve websites' });
  }
};

/**
 * Regenerate website
 */
export const regenerateWebsiteHandler = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify user owns this website
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (website.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Trigger regeneration (asynchronously)
    regenerateWebsite(websiteId)
      .then((result) => {
        console.log('Website regeneration completed:', result);
      })
      .catch((error) => {
        console.error('Website regeneration failed:', error);
      });

    res.json({
      message: 'Website regeneration started',
      websiteId,
      status: 'GENERATING',
    });
  } catch (error) {
    console.error('Regenerate website error:', error);
    res.status(500).json({ error: 'Failed to regenerate website' });
  }
};

/**
 * Delete website
 */
export const deleteWebsiteHandler = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify user owns this website
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (website.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await deleteWebsite(websiteId);

    res.json({ message: 'Website deleted successfully' });
  } catch (error: any) {
    console.error('Delete website error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete website' });
  }
};
