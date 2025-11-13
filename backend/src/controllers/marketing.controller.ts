import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  getMetaAuthUrl,
  exchangeCodeForToken,
  getLongLivedToken,
  getAdAccounts,
  saveAdAccount,
  getStoredAdAccount,
  isTokenExpired,
  createCampaign,
  getCampaignMetrics,
  updateCampaignStatus,
  generateMetaPixelCode,
} from '../services/meta.service';
import {
  generateSocialPost,
  generateContentCalendar,
  generateHashtags,
  generateABVariations,
  generateAdCopy,
} from '../services/ai-marketing.service';
import {
  getBudgetStatus,
  enforceBudgetLimits,
  reallocateBudget,
  getBudgetRecommendations,
  setCampaignBudget,
  getSpendingForecast,
} from '../services/budget-management.service';

/**
 * Get Meta OAuth authorization URL
 * GET /api/marketing/meta/auth-url
 */
export const getMetaAuthorizationUrl = async (_req: Request, res: Response) => {
  try {
    const state = Math.random().toString(36).substring(7);
    const authUrl = getMetaAuthUrl(state);

    res.json({ authUrl, state });
  } catch (error) {
    console.error('Get Meta auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
};

/**
 * Handle Meta OAuth callback
 * POST /api/marketing/meta/callback
 */
export const handleMetaCallback = async (req: Request, res: Response) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Code and userId are required' });
    }

    // Exchange code for short-lived token
    const shortToken = await exchangeCodeForToken(code);

    // Exchange for long-lived token
    const longToken = await getLongLivedToken(shortToken.accessToken);

    // Get ad accounts
    const adAccounts = await getAdAccounts(longToken.accessToken);

    if (adAccounts.length === 0) {
      return res.status(400).json({ error: 'No ad accounts found' });
    }

    // Save the first ad account (or let user choose)
    await saveAdAccount(
      userId,
      adAccounts[0].id,
      adAccounts[0].name,
      longToken.accessToken,
      longToken.expiresIn
    );

    res.json({
      message: 'Meta account connected successfully',
      adAccount: adAccounts[0],
    });
  } catch (error) {
    console.error('Meta callback error:', error);
    res.status(500).json({ error: 'Failed to connect Meta account' });
  }
};

/**
 * Create marketing campaign
 * POST /api/marketing/campaigns
 */
export const createMarketingCampaign = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      websiteId,
      channel,
      name,
      objective,
      budget,
      startDate,
      endDate,
      targeting,
    } = req.body;

    // Validate input
    if (!websiteId || !channel || !name || !budget) {
      return res.status(400).json({
        error: 'websiteId, channel, name, and budget are required',
      });
    }

    // Verify user owns the website
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Create campaign in database
    const campaign = await prisma.marketingCampaign.create({
      data: {
        websiteId,
        channel,
        budget: parseFloat(budget),
        status: 'active',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        metadata: {
          name,
          objective,
          targeting,
        },
      },
    });

    // If Meta campaign, create on Meta platform
    if (channel === 'meta' || channel === 'facebook' || channel === 'instagram') {
      try {
        const adAccount = await getStoredAdAccount(userId);

        if (adAccount && !isTokenExpired(adAccount.expiresAt)) {
          const metaCampaign = await createCampaign(
            adAccount.accessToken,
            adAccount.accountId,
            {
              name,
              objective: objective || 'REACH',
              dailyBudget: parseFloat(budget) / 7,
              status: 'PAUSED',
            }
          );

          // Update campaign with Meta campaign ID
          await prisma.marketingCampaign.update({
            where: { id: campaign.id },
            data: {
              metadata: {
                ...campaign.metadata,
                metaCampaignId: metaCampaign.id,
              },
            },
          });
        }
      } catch (metaError) {
        console.error('Meta campaign creation error:', metaError);
        // Continue even if Meta creation fails
      }
    }

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign,
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

/**
 * Get campaigns for a website
 * GET /api/marketing/campaigns/:websiteId
 */
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.userId;

    // Verify user owns the website
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const campaigns = await prisma.marketingCampaign.findMany({
      where: { websiteId },
      include: {
        metrics: {
          orderBy: {
            date: 'desc',
          },
          take: 7, // Last 7 days
        },
        posts: {
          orderBy: {
            scheduledAt: 'desc',
          },
          take: 5, // Latest 5 posts
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to retrieve campaigns' });
  }
};

/**
 * Update campaign status
 * PUT /api/marketing/campaigns/:campaignId/status
 */
export const updateCampaignStatusController = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get campaign and verify ownership
    const campaign = await prisma.marketingCampaign.findFirst({
      where: { id: campaignId },
      include: {
        website: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!campaign || campaign.website.userId !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update in database
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status },
    });

    // If Meta campaign, update on Meta platform
    if (campaign.metadata && (campaign.metadata as any).metaCampaignId) {
      try {
        const adAccount = await getStoredAdAccount(userId!);

        if (adAccount && !isTokenExpired(adAccount.expiresAt)) {
          const metaStatus = status === 'active' ? 'ACTIVE' : 'PAUSED';
          await updateCampaignStatus(
            adAccount.accessToken,
            (campaign.metadata as any).metaCampaignId,
            metaStatus
          );
        }
      } catch (metaError) {
        console.error('Meta status update error:', metaError);
      }
    }

    res.json({ message: 'Campaign status updated', status });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ error: 'Failed to update campaign status' });
  }
};

/**
 * Generate content for a campaign
 * POST /api/marketing/content/generate
 */
export const generateContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      websiteId,
      platform,
      postType,
      tone,
    } = req.body;

    // Get website and profile details
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!website || !website.user.profile) {
      return res.status(404).json({ error: 'Website or profile not found' });
    }

    const profile = website.user.profile;

    // Generate content
    const content = await generateSocialPost({
      profession: profile.profession,
      businessName: website.domain,
      industry: profile.profession,
      services: profile.services as string[] || [],
      tone: tone || 'professional',
      platform: platform || 'facebook',
      postType: postType || 'promotional',
    });

    res.json({ content });
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
};

/**
 * Generate content calendar
 * POST /api/marketing/content/calendar
 */
export const generateCalendar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { websiteId, platform, weeks } = req.body;

    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!website || !website.user.profile) {
      return res.status(404).json({ error: 'Website or profile not found' });
    }

    const profile = website.user.profile;

    const calendar = await generateContentCalendar(
      {
        profession: profile.profession,
        businessName: website.domain,
        industry: profile.profession,
        services: profile.services as string[] || [],
        platform: platform || 'facebook',
      },
      weeks || 1
    );

    res.json({ calendar });
  } catch (error) {
    console.error('Generate calendar error:', error);
    res.status(500).json({ error: 'Failed to generate calendar' });
  }
};

/**
 * Get budget status
 * GET /api/marketing/budget/:websiteId
 */
export const getBudgetStatusController = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.userId;

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const status = await getBudgetStatus(websiteId);
    const forecast = await getSpendingForecast(websiteId);

    res.json({ status, forecast });
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({ error: 'Failed to retrieve budget status' });
  }
};

/**
 * Set campaign budget
 * PUT /api/marketing/budget/:campaignId
 */
export const updateCampaignBudget = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { budget } = req.body;
    const userId = req.user?.userId;

    if (!budget || budget <= 0) {
      return res.status(400).json({ error: 'Valid budget is required' });
    }

    // Verify ownership
    const campaign = await prisma.marketingCampaign.findFirst({
      where: { id: campaignId },
      include: {
        website: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!campaign || campaign.website.userId !== userId) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await setCampaignBudget(campaignId, parseFloat(budget));

    res.json({ message: 'Budget updated successfully', budget: parseFloat(budget) });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

/**
 * Get budget recommendations
 * GET /api/marketing/budget/:websiteId/recommendations
 */
export const getBudgetRecommendationsController = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.userId;

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const recommendations = await getBudgetRecommendations(websiteId);

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

/**
 * Enforce budget limits (manual trigger)
 * POST /api/marketing/budget/:websiteId/enforce
 */
export const enforceBudgetLimitsController = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.userId;

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const alerts = await enforceBudgetLimits(websiteId);

    res.json({ alerts });
  } catch (error) {
    console.error('Enforce budget error:', error);
    res.status(500).json({ error: 'Failed to enforce budget limits' });
  }
};

/**
 * Get Meta Pixel code
 * GET /api/marketing/meta/pixel/:websiteId
 */
export const getMetaPixel = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user?.userId;

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId,
      },
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Generate pixel code with website-specific pixel ID
    const pixelId = process.env.META_PIXEL_ID || `pixel_${websiteId.substring(0, 10)}`;
    const pixelCode = generateMetaPixelCode(pixelId);

    res.json({ pixelId, pixelCode });
  } catch (error) {
    console.error('Get Meta pixel error:', error);
    res.status(500).json({ error: 'Failed to generate Meta pixel code' });
  }
};
