/**
 * Cross-Channel Campaign Manager Service
 *
 * Unified orchestrator for managing campaigns across multiple advertising platforms:
 * - Meta (Facebook/Instagram)
 * - LinkedIn
 * - Google Ads
 *
 * Features:
 * - Multi-channel campaign creation
 * - Centralized budget management
 * - Performance comparison
 * - Automated budget reallocation
 * - Cross-platform optimization
 */

import { prisma } from '../lib/prisma';
import {
  createCampaign as createMetaCampaign,
  getCampaignMetrics as getMetaMetrics,
  updateCampaignStatus as updateMetaStatus,
  getStoredAdAccount as getMetaAccount,
  isTokenExpired,
} from './meta.service';
import {
  createLinkedInCampaign,
  getLinkedInCampaignMetrics,
  updateLinkedInCampaignStatus,
  getStoredLinkedInAccount,
} from './linkedin.service';
import {
  createSearchCampaign,
  getGoogleAdsCampaignMetrics,
  updateGoogleAdsCampaignStatus,
  getStoredGoogleAdsAccount,
} from './google-ads.service';
import { generateSocialPost, generateAdCopy } from './ai-marketing.service';

export interface MultiChannelCampaignRequest {
  websiteId: string;
  userId: string;
  name: string;
  objective: string;
  totalBudget: number;
  channels: Array<'meta' | 'linkedin' | 'google_ads'>;
  budgetAllocation?: {
    meta?: number;
    linkedin?: number;
    google_ads?: number;
  };
  targeting: {
    locations?: string[];
    demographics?: any;
    interests?: string[];
    keywords?: string[];
  };
  duration: {
    start: Date;
    end?: Date;
  };
}

export interface ChannelPerformance {
  channel: string;
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roi: number;
  status: string;
}

/**
 * Launch multi-channel campaign
 */
export const launchMultiChannelCampaign = async (
  request: MultiChannelCampaignRequest
): Promise<{
  success: boolean;
  campaigns: Array<{
    channel: string;
    campaignId: string;
    status: string;
    budget: number;
  }>;
  errors: Array<{
    channel: string;
    error: string;
  }>;
}> => {
  const campaigns: Array<{
    channel: string;
    campaignId: string;
    status: string;
    budget: number;
  }> = [];

  const errors: Array<{
    channel: string;
    error: string;
  }> = [];

  // Calculate budget per channel
  const budgetPerChannel = request.budgetAllocation || {};
  const defaultBudget = request.totalBudget / request.channels.length;

  // Get website details for content generation
  const website = await prisma.website.findUnique({
    where: { id: request.websiteId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!website || !website.user.profile) {
    throw new Error('Website or user profile not found');
  }

  const profile = website.user.profile;

  // Launch Meta campaign
  if (request.channels.includes('meta')) {
    try {
      const metaAccount = await getMetaAccount(request.userId);

      if (metaAccount && !isTokenExpired(metaAccount.expiresAt)) {
        const metaBudget = budgetPerChannel.meta || defaultBudget;

        const metaCampaign = await createMetaCampaign(
          metaAccount.accessToken,
          metaAccount.accountId,
          {
            name: `${request.name} - Meta`,
            objective: request.objective || 'REACH',
            dailyBudget: metaBudget / 7,
            startTime: request.duration.start.toISOString(),
            endTime: request.duration.end?.toISOString(),
            status: 'PAUSED',
          }
        );

        // Store in database
        const dbCampaign = await prisma.marketingCampaign.create({
          data: {
            websiteId: request.websiteId,
            channel: 'meta',
            budget: metaBudget,
            status: 'paused',
            startDate: request.duration.start,
            endDate: request.duration.end,
            metadata: {
              name: request.name,
              metaCampaignId: metaCampaign.id,
              objective: request.objective,
            },
          },
        });

        campaigns.push({
          channel: 'meta',
          campaignId: dbCampaign.id,
          status: 'paused',
          budget: metaBudget,
        });
      }
    } catch (error: any) {
      errors.push({
        channel: 'meta',
        error: error.message,
      });
    }
  }

  // Launch LinkedIn campaign
  if (request.channels.includes('linkedin')) {
    try {
      const linkedInAccount = await getStoredLinkedInAccount(request.userId);

      if (linkedInAccount && linkedInAccount.expiresAt && new Date() < linkedInAccount.expiresAt) {
        const linkedInBudget = budgetPerChannel.linkedin || defaultBudget;

        const linkedInCampaign = await createLinkedInCampaign(
          linkedInAccount.accessToken,
          linkedInAccount.accountId,
          {
            name: `${request.name} - LinkedIn`,
            dailyBudget: linkedInBudget / 7,
            startTime: request.duration.start.toISOString(),
            endTime: request.duration.end?.toISOString(),
          }
        );

        const dbCampaign = await prisma.marketingCampaign.create({
          data: {
            websiteId: request.websiteId,
            channel: 'linkedin',
            budget: linkedInBudget,
            status: 'paused',
            startDate: request.duration.start,
            endDate: request.duration.end,
            metadata: {
              name: request.name,
              linkedInCampaignId: linkedInCampaign.id,
            },
          },
        });

        campaigns.push({
          channel: 'linkedin',
          campaignId: dbCampaign.id,
          status: 'paused',
          budget: linkedInBudget,
        });
      }
    } catch (error: any) {
      errors.push({
        channel: 'linkedin',
        error: error.message,
      });
    }
  }

  // Launch Google Ads campaign
  if (request.channels.includes('google_ads')) {
    try {
      const googleAccount = await getStoredGoogleAdsAccount(request.userId);

      if (googleAccount && googleAccount.expiresAt && new Date() < googleAccount.expiresAt) {
        const googleBudget = budgetPerChannel.google_ads || defaultBudget;

        const googleCampaign = await createSearchCampaign(
          googleAccount.accessToken,
          googleAccount.accountId,
          {
            name: `${request.name} - Google`,
            dailyBudget: googleBudget / 7,
            keywords: request.targeting.keywords || [profile.profession],
            locations: request.targeting.locations,
          }
        );

        const dbCampaign = await prisma.marketingCampaign.create({
          data: {
            websiteId: request.websiteId,
            channel: 'google_ads',
            budget: googleBudget,
            status: 'paused',
            startDate: request.duration.start,
            endDate: request.duration.end,
            metadata: {
              name: request.name,
              googleCampaignId: googleCampaign.id,
            },
          },
        });

        campaigns.push({
          channel: 'google_ads',
          campaignId: dbCampaign.id,
          status: 'paused',
          budget: googleBudget,
        });
      }
    } catch (error: any) {
      errors.push({
        channel: 'google_ads',
        error: error.message,
      });
    }
  }

  return {
    success: campaigns.length > 0,
    campaigns,
    errors,
  };
};

/**
 * Get cross-channel performance comparison
 */
export const getCrossChannelPerformance = async (
  websiteId: string,
  userId: string,
  dateRange: { start: Date; end: Date }
): Promise<{
  overall: {
    totalSpend: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
    roi: number;
  };
  byChannel: ChannelPerformance[];
  recommendations: string[];
}> => {
  const campaigns = await prisma.marketingCampaign.findMany({
    where: {
      websiteId,
      startDate: {
        lte: dateRange.end,
      },
    },
    include: {
      metrics: {
        where: {
          date: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      },
    },
  });

  const channelPerformance: ChannelPerformance[] = [];

  for (const campaign of campaigns) {
    const metrics = campaign.metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        spend: acc.spend + m.spend,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
    );

    const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    const cpc = metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0;
    const conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    const revenue = metrics.conversions * 100; // Assume $100 per conversion
    const roi = metrics.spend > 0 ? ((revenue - metrics.spend) / metrics.spend) * 100 : 0;

    channelPerformance.push({
      channel: campaign.channel,
      campaignId: campaign.id,
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      conversions: metrics.conversions,
      spend: metrics.spend,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      status: campaign.status,
    });
  }

  // Calculate overall metrics
  const overall = channelPerformance.reduce(
    (acc, channel) => ({
      totalSpend: acc.totalSpend + channel.spend,
      totalConversions: acc.totalConversions + channel.conversions,
      totalImpressions: acc.totalImpressions + channel.impressions,
      totalClicks: acc.totalClicks + channel.clicks,
    }),
    { totalSpend: 0, totalConversions: 0, totalImpressions: 0, totalClicks: 0 }
  );

  const averageCtr = overall.totalImpressions > 0
    ? (overall.totalClicks / overall.totalImpressions) * 100
    : 0;

  const averageCpc = overall.totalClicks > 0
    ? overall.totalSpend / overall.totalClicks
    : 0;

  const totalRevenue = overall.totalConversions * 100;
  const overallRoi = overall.totalSpend > 0
    ? ((totalRevenue - overall.totalSpend) / overall.totalSpend) * 100
    : 0;

  // Generate recommendations
  const recommendations: string[] = [];

  // Sort channels by ROI
  const sortedByRoi = [...channelPerformance].sort((a, b) => b.roi - a.roi);

  if (sortedByRoi.length > 1) {
    const bestChannel = sortedByRoi[0];
    const worstChannel = sortedByRoi[sortedByRoi.length - 1];

    if (bestChannel.roi > worstChannel.roi * 2) {
      recommendations.push(
        `Consider reallocating budget from ${worstChannel.channel} (${worstChannel.roi.toFixed(1)}% ROI) to ${bestChannel.channel} (${bestChannel.roi.toFixed(1)}% ROI)`
      );
    }

    // Low CTR recommendation
    channelPerformance.forEach((channel) => {
      if (channel.ctr < 1) {
        recommendations.push(
          `${channel.channel} has low CTR (${channel.ctr.toFixed(2)}%). Consider improving ad copy and targeting.`
        );
      }
    });

    // High CPC recommendation
    channelPerformance.forEach((channel) => {
      if (channel.cpc > 10) {
        recommendations.push(
          `${channel.channel} has high CPC ($${channel.cpc.toFixed(2)}). Review keyword targeting and quality score.`
        );
      }
    });
  }

  return {
    overall: {
      totalSpend: Math.round(overall.totalSpend * 100) / 100,
      totalConversions: overall.totalConversions,
      averageCtr: Math.round(averageCtr * 100) / 100,
      averageCpc: Math.round(averageCpc * 100) / 100,
      roi: Math.round(overallRoi * 100) / 100,
    },
    byChannel: channelPerformance,
    recommendations,
  };
};

/**
 * Automatically reallocate budget based on performance
 */
export const autoReallocateBudget = async (
  websiteId: string,
  userId: string
): Promise<{
  reallocations: Array<{
    fromChannel: string;
    toChannel: string;
    amount: number;
    reason: string;
  }>;
}> => {
  const performance = await getCrossChannelPerformance(
    websiteId,
    userId,
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }
  );

  const reallocations: Array<{
    fromChannel: string;
    toChannel: string;
    amount: number;
    reason: string;
  }> = [];

  if (performance.byChannel.length < 2) {
    return { reallocations };
  }

  // Sort by ROI
  const sorted = [...performance.byChannel].sort((a, b) => b.roi - a.roi);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Reallocate if ROI difference is significant
  if (best.roi > worst.roi * 1.5 && worst.spend > 0) {
    const reallocationAmount = worst.spend * 0.2; // Move 20% of worst performer's budget

    // Update campaigns in database
    const worstCampaigns = await prisma.marketingCampaign.findMany({
      where: {
        websiteId,
        channel: worst.channel,
      },
    });

    const bestCampaigns = await prisma.marketingCampaign.findMany({
      where: {
        websiteId,
        channel: best.channel,
      },
    });

    if (worstCampaigns.length > 0 && bestCampaigns.length > 0) {
      const amountPerCampaign = reallocationAmount / worstCampaigns.length;

      await Promise.all(
        worstCampaigns.map((campaign) =>
          prisma.marketingCampaign.update({
            where: { id: campaign.id },
            data: {
              budget: {
                decrement: amountPerCampaign,
              },
            },
          })
        )
      );

      await Promise.all(
        bestCampaigns.map((campaign) =>
          prisma.marketingCampaign.update({
            where: { id: campaign.id },
            data: {
              budget: {
                increment: reallocationAmount / bestCampaigns.length,
              },
            },
          })
        )
      );

      reallocations.push({
        fromChannel: worst.channel,
        toChannel: best.channel,
        amount: reallocationAmount,
        reason: `ROI difference: ${best.channel} (${best.roi.toFixed(1)}%) vs ${worst.channel} (${worst.roi.toFixed(1)}%)`,
      });
    }
  }

  return { reallocations };
};

/**
 * Pause underperforming campaigns across all channels
 */
export const pauseUnderperformingCampaigns = async (
  websiteId: string,
  userId: string,
  thresholds: {
    minCtr?: number;
    maxCpc?: number;
    minConversionRate?: number;
  } = {}
): Promise<{
  paused: Array<{
    campaignId: string;
    channel: string;
    reason: string;
  }>;
}> => {
  const defaults = {
    minCtr: thresholds.minCtr || 1, // 1%
    maxCpc: thresholds.maxCpc || 15, // $15
    minConversionRate: thresholds.minConversionRate || 1, // 1%
  };

  const performance = await getCrossChannelPerformance(
    websiteId,
    userId,
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }
  );

  const paused: Array<{
    campaignId: string;
    channel: string;
    reason: string;
  }> = [];

  for (const channel of performance.byChannel) {
    let shouldPause = false;
    let reason = '';

    if (channel.ctr < defaults.minCtr) {
      shouldPause = true;
      reason = `Low CTR (${channel.ctr.toFixed(2)}%)`;
    } else if (channel.cpc > defaults.maxCpc) {
      shouldPause = true;
      reason = `High CPC ($${channel.cpc.toFixed(2)})`;
    } else if (channel.conversionRate < defaults.minConversionRate) {
      shouldPause = true;
      reason = `Low conversion rate (${channel.conversionRate.toFixed(2)}%)`;
    }

    if (shouldPause && channel.status === 'active') {
      await prisma.marketingCampaign.update({
        where: { id: channel.campaignId },
        data: { status: 'paused' },
      });

      paused.push({
        campaignId: channel.campaignId,
        channel: channel.channel,
        reason,
      });

      console.log(`⏸️  Paused ${channel.channel} campaign: ${reason}`);
    }
  }

  return { paused };
};
