/**
 * Marketing Automation Workflows Service
 *
 * Automated workflows for marketing campaign management:
 * - New website → Launch campaigns
 * - Weekly performance review → Optimize
 * - Budget threshold → Pause/adjust
 * - Low performance → Alert and optimize
 */

import { prisma } from '../lib/prisma';
import { launchMultiChannelCampaign } from './cross-channel-manager.service';
import { pauseUnderperformingCampaigns, autoReallocateBudget } from './cross-channel-manager.service';
import { enforceBudgetLimits } from './budget-management.service';
import { sendTelegramMessage } from './telegram.service';

/**
 * Workflow: Launch campaigns when new website is deployed
 */
export const onWebsiteDeployed = async (websiteId: string): Promise<void> => {
  try {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!website || !website.user.profile) {
      return;
    }

    console.log(`🚀 Triggering marketing automation for website: ${website.domain}`);

    // Check if user has connected ad accounts
    const adAccounts = await prisma.adAccount.findMany({
      where: { userId: website.userId },
    });

    if (adAccounts.length === 0) {
      console.log('⏭️  No ad accounts connected, skipping campaign launch');
      return;
    }

    // Auto-launch campaigns if enabled
    const autoLaunch = (website.metadata as any)?.autoLaunchCampaigns !== false;

    if (autoLaunch) {
      const channels = adAccounts.map(acc => acc.channel as any);

      await launchMultiChannelCampaign({
        websiteId: website.id,
        userId: website.userId,
        name: `Launch Campaign - ${website.domain}`,
        objective: 'REACH',
        totalBudget: 500, // Default $500 budget
        channels,
        duration: {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        targeting: {
          locations: [(website.user.profile.location as any) || 'United States'],
        },
      });

      console.log(`✅ Launched marketing campaigns for ${website.domain}`);
    }
  } catch (error) {
    console.error('Website deployed workflow error:', error);
  }
};

/**
 * Workflow: Weekly performance review and optimization
 */
export const weeklyPerformanceReview = async (): Promise<void> => {
  try {
    console.log('📊 Running weekly performance review...');

    const websites = await prisma.website.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: true,
        marketingCampaigns: {
          where: {
            status: 'active',
          },
        },
      },
    });

    for (const website of websites) {
      if (website.marketingCampaigns.length === 0) continue;

      // Pause underperforming campaigns
      const paused = await pauseUnderperformingCampaigns(website.id, website.userId);

      if (paused.paused.length > 0) {
        await sendTelegramMessage(
          `⏸️ Paused ${paused.paused.length} underperforming campaign(s) for ${website.domain}`
        );
      }

      // Reallocate budget
      const reallocation = await autoReallocateBudget(website.id, website.userId);

      if (reallocation.reallocations.length > 0) {
        await sendTelegramMessage(
          `💸 Reallocated budget for ${website.domain}: ${reallocation.reallocations[0].fromChannel} → ${reallocation.reallocations[0].toChannel}`
        );
      }
    }

    console.log('✅ Weekly performance review complete');
  } catch (error) {
    console.error('Weekly performance review error:', error);
  }
};

/**
 * Workflow: Budget threshold monitoring
 */
export const monitorBudgetThresholds = async (): Promise<void> => {
  try {
    console.log('💰 Monitoring budget thresholds...');

    const websites = await prisma.website.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        marketingCampaigns: {
          where: {
            status: 'active',
          },
        },
      },
    });

    for (const website of websites) {
      if (website.marketingCampaigns.length === 0) continue;

      const alerts = await enforceBudgetLimits(website.id);

      if (alerts.length > 0) {
        console.log(`⚠️  Budget alerts for ${website.domain}: ${alerts.length} alert(s)`);
      }
    }

    console.log('✅ Budget threshold monitoring complete');
  } catch (error) {
    console.error('Budget threshold monitoring error:', error);
  }
};

/**
 * Workflow: Campaign performance alerts
 */
export const checkCampaignPerformance = async (): Promise<void> => {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        status: 'active',
      },
      include: {
        website: {
          include: {
            user: true,
          },
        },
        metrics: {
          where: {
            date: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    for (const campaign of campaigns) {
      const todayMetrics = campaign.metrics[0];

      if (!todayMetrics) continue;

      // Alert on zero conversions
      if (todayMetrics.impressions > 1000 && todayMetrics.conversions === 0) {
        await sendTelegramMessage(
          `⚠️ Campaign Alert: ${campaign.channel} campaign for ${campaign.website.domain} has 0 conversions with ${todayMetrics.impressions} impressions`
        );
      }

      // Alert on high spend with low conversions
      if (todayMetrics.spend > 100 && todayMetrics.conversions < 2) {
        await sendTelegramMessage(
          `💸 High Spend Alert: ${campaign.channel} campaign spent $${todayMetrics.spend.toFixed(2)} with only ${todayMetrics.conversions} conversion(s)`
        );
      }
    }
  } catch (error) {
    console.error('Campaign performance check error:', error);
  }
};
