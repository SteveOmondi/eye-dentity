/**
 * Budget Management Service
 *
 * This service manages marketing budgets across campaigns and channels:
 * - Track daily/weekly spend per channel
 * - Pause campaigns when budget limit reached
 * - Alert users when approaching limits
 * - Automatic budget reallocation
 * - Budget forecasting and recommendations
 */

import { prisma } from '../lib/prisma';
import { sendTelegramMessage } from './telegram.service';

export interface BudgetConfig {
  userId: string;
  websiteId: string;
  channel: string;
  dailyBudget?: number;
  weeklyBudget?: number;
  monthlyBudget?: number;
  autoReallocation?: boolean;
  alertThreshold?: number; // Percentage (e.g., 80 = alert at 80% spent)
}

export interface BudgetStatus {
  channel: string;
  dailyBudget: number;
  dailySpent: number;
  dailyRemaining: number;
  weeklyBudget: number;
  weeklySpent: number;
  weeklyRemaining: number;
  percentageUsed: number;
  status: 'healthy' | 'warning' | 'exceeded';
  campaigns: number;
  activeCampaigns: number;
}

export interface BudgetAlert {
  type: 'warning' | 'limit_reached' | 'exceeded';
  channel: string;
  message: string;
  currentSpend: number;
  budgetLimit: number;
  percentageUsed: number;
}

/**
 * Get budget status for a website
 */
export const getBudgetStatus = async (websiteId: string): Promise<BudgetStatus[]> => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get all campaigns for this website
  const campaigns = await prisma.marketingCampaign.findMany({
    where: { websiteId },
    include: {
      metrics: {
        where: {
          date: {
            gte: startOfWeek,
          },
        },
      },
    },
  });

  // Group by channel
  const channelMap = new Map<string, {
    budget: number;
    dailySpent: number;
    weeklySpent: number;
    campaigns: number;
    activeCampaigns: number;
  }>();

  campaigns.forEach((campaign) => {
    const channel = campaign.channel;
    if (!channelMap.has(channel)) {
      channelMap.set(channel, {
        budget: 0,
        dailySpent: 0,
        weeklySpent: 0,
        campaigns: 0,
        activeCampaigns: 0,
      });
    }

    const channelData = channelMap.get(channel)!;
    channelData.budget += campaign.budget;
    channelData.campaigns++;
    if (campaign.status === 'active') {
      channelData.activeCampaigns++;
    }

    // Sum up daily spend
    const dailyMetrics = campaign.metrics.filter(
      (m) => m.date >= startOfDay
    );
    channelData.dailySpent += dailyMetrics.reduce((sum, m) => sum + m.spend, 0);

    // Sum up weekly spend
    channelData.weeklySpent += campaign.metrics.reduce((sum, m) => sum + m.spend, 0);
  });

  // Convert to status array
  const statuses: BudgetStatus[] = [];
  channelMap.forEach((data, channel) => {
    const weeklyBudget = data.budget;
    const dailyBudget = weeklyBudget / 7;
    const percentageUsed = weeklyBudget > 0 ? (data.weeklySpent / weeklyBudget) * 100 : 0;

    let status: 'healthy' | 'warning' | 'exceeded' = 'healthy';
    if (percentageUsed >= 100) {
      status = 'exceeded';
    } else if (percentageUsed >= 80) {
      status = 'warning';
    }

    statuses.push({
      channel,
      dailyBudget,
      dailySpent: data.dailySpent,
      dailyRemaining: Math.max(0, dailyBudget - data.dailySpent),
      weeklyBudget,
      weeklySpent: data.weeklySpent,
      weeklyRemaining: Math.max(0, weeklyBudget - data.weeklySpent),
      percentageUsed: Math.round(percentageUsed * 10) / 10,
      status,
      campaigns: data.campaigns,
      activeCampaigns: data.activeCampaigns,
    });
  });

  return statuses;
};

/**
 * Check budget limits and pause campaigns if needed
 */
export const enforceBudgetLimits = async (websiteId: string): Promise<BudgetAlert[]> => {
  const alerts: BudgetAlert[] = [];
  const statuses = await getBudgetStatus(websiteId);

  for (const status of statuses) {
    // Check if budget exceeded
    if (status.percentageUsed >= 100) {
      alerts.push({
        type: 'exceeded',
        channel: status.channel,
        message: `Budget exceeded for ${status.channel}. All campaigns have been paused.`,
        currentSpend: status.weeklySpent,
        budgetLimit: status.weeklyBudget,
        percentageUsed: status.percentageUsed,
      });

      // Pause all active campaigns for this channel
      await pauseCampaignsByChannel(websiteId, status.channel);

      // Send alert
      await sendBudgetAlert(websiteId, alerts[alerts.length - 1]);
    }
    // Check if approaching limit (80%)
    else if (status.percentageUsed >= 80 && status.percentageUsed < 100) {
      alerts.push({
        type: 'warning',
        channel: status.channel,
        message: `Budget warning for ${status.channel}: ${status.percentageUsed}% used.`,
        currentSpend: status.weeklySpent,
        budgetLimit: status.weeklyBudget,
        percentageUsed: status.percentageUsed,
      });

      await sendBudgetAlert(websiteId, alerts[alerts.length - 1]);
    }
  }

  return alerts;
};

/**
 * Pause campaigns by channel
 */
async function pauseCampaignsByChannel(websiteId: string, channel: string): Promise<void> {
  await prisma.marketingCampaign.updateMany({
    where: {
      websiteId,
      channel,
      status: 'active',
    },
    data: {
      status: 'paused',
    },
  });

  console.log(`⏸️  Paused all ${channel} campaigns for website ${websiteId} due to budget limit`);
}

/**
 * Send budget alert
 */
async function sendBudgetAlert(websiteId: string, alert: BudgetAlert): Promise<void> {
  // Get website details
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!website) return;

  const emoji = alert.type === 'exceeded' ? '🚨' : '⚠️';
  const message = `${emoji} <b>Budget Alert: ${website.domain}</b>

<b>Channel:</b> ${alert.channel.toUpperCase()}
<b>Status:</b> ${alert.type.replace('_', ' ').toUpperCase()}
<b>Message:</b> ${alert.message}

<b>Budget Limit:</b> $${alert.budgetLimit.toFixed(2)}
<b>Current Spend:</b> $${alert.currentSpend.toFixed(2)}
<b>Percentage Used:</b> ${alert.percentageUsed.toFixed(1)}%

<b>User:</b> ${website.user.name || website.user.email}`;

  await sendTelegramMessage(message);

  console.log(`📧 Budget alert sent for ${website.domain} - ${alert.channel}`);
}

/**
 * Reallocate budget from underperforming to high-performing channels
 */
export const reallocateBudget = async (websiteId: string): Promise<{
  reallocations: Array<{
    fromChannel: string;
    toChannel: string;
    amount: number;
    reason: string;
  }>;
}> => {
  // Get campaign performance metrics
  const campaigns = await prisma.marketingCampaign.findMany({
    where: {
      websiteId,
      status: 'active',
    },
    include: {
      metrics: {
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
    },
  });

  // Calculate ROI for each channel
  interface ChannelPerformance {
    channel: string;
    budget: number;
    spent: number;
    conversions: number;
    roi: number;
  }

  const channelPerformance: ChannelPerformance[] = [];
  const channelMap = new Map<string, { budget: number; spent: number; conversions: number }>();

  campaigns.forEach((campaign) => {
    if (!channelMap.has(campaign.channel)) {
      channelMap.set(campaign.channel, { budget: 0, spent: 0, conversions: 0 });
    }

    const data = channelMap.get(campaign.channel)!;
    data.budget += campaign.budget;
    data.spent += campaign.metrics.reduce((sum, m) => sum + m.spend, 0);
    data.conversions += campaign.metrics.reduce((sum, m) => sum + m.conversions, 0);
  });

  channelMap.forEach((data, channel) => {
    const roi = data.spent > 0 ? (data.conversions / data.spent) * 100 : 0;
    channelPerformance.push({
      channel,
      budget: data.budget,
      spent: data.spent,
      conversions: data.conversions,
      roi,
    });
  });

  // Sort by ROI
  channelPerformance.sort((a, b) => b.roi - a.roi);

  const reallocations: Array<{
    fromChannel: string;
    toChannel: string;
    amount: number;
    reason: string;
  }> = [];

  // Reallocate from lowest ROI to highest ROI
  if (channelPerformance.length >= 2) {
    const worst = channelPerformance[channelPerformance.length - 1];
    const best = channelPerformance[0];

    if (worst.roi < best.roi * 0.5 && worst.budget > 0) {
      const reallocationAmount = worst.budget * 0.2; // Reallocate 20%

      // Update budgets
      await prisma.marketingCampaign.updateMany({
        where: {
          websiteId,
          channel: worst.channel,
        },
        data: {
          budget: {
            decrement: reallocationAmount / campaigns.filter((c) => c.channel === worst.channel).length,
          },
        },
      });

      await prisma.marketingCampaign.updateMany({
        where: {
          websiteId,
          channel: best.channel,
        },
        data: {
          budget: {
            increment: reallocationAmount / campaigns.filter((c) => c.channel === best.channel).length,
          },
        },
      });

      reallocations.push({
        fromChannel: worst.channel,
        toChannel: best.channel,
        amount: reallocationAmount,
        reason: `Low ROI (${worst.roi.toFixed(2)}%) vs high ROI (${best.roi.toFixed(2)}%)`,
      });

      console.log(`💸 Reallocated $${reallocationAmount.toFixed(2)} from ${worst.channel} to ${best.channel}`);
    }
  }

  return { reallocations };
};

/**
 * Get budget recommendations
 */
export const getBudgetRecommendations = async (websiteId: string): Promise<{
  totalBudget: number;
  recommendations: Array<{
    channel: string;
    currentBudget: number;
    recommendedBudget: number;
    reason: string;
  }>;
}> => {
  const campaigns = await prisma.marketingCampaign.findMany({
    where: { websiteId },
    include: {
      metrics: {
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    },
  });

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const recommendations: Array<{
    channel: string;
    currentBudget: number;
    recommendedBudget: number;
    reason: string;
  }> = [];

  // Analyze performance by channel
  const channelMap = new Map<string, {
    budget: number;
    conversions: number;
    spend: number;
  }>();

  campaigns.forEach((campaign) => {
    if (!channelMap.has(campaign.channel)) {
      channelMap.set(campaign.channel, { budget: 0, conversions: 0, spend: 0 });
    }

    const data = channelMap.get(campaign.channel)!;
    data.budget += campaign.budget;
    data.conversions += campaign.metrics.reduce((sum, m) => sum + m.conversions, 0);
    data.spend += campaign.metrics.reduce((sum, m) => sum + m.spend, 0);
  });

  channelMap.forEach((data, channel) => {
    const cpa = data.conversions > 0 ? data.spend / data.conversions : 0;
    const avgCpa = 50; // Industry average (mock value)

    let recommendedBudget = data.budget;
    let reason = 'Performance is on target';

    if (cpa > 0 && cpa < avgCpa * 0.8) {
      // Performing well, recommend increase
      recommendedBudget = data.budget * 1.2;
      reason = `Strong performance (CPA: $${cpa.toFixed(2)} vs avg $${avgCpa.toFixed(2)})`;
    } else if (cpa > avgCpa * 1.5) {
      // Underperforming, recommend decrease
      recommendedBudget = data.budget * 0.8;
      reason = `Underperforming (CPA: $${cpa.toFixed(2)} vs avg $${avgCpa.toFixed(2)})`;
    }

    recommendations.push({
      channel,
      currentBudget: data.budget,
      recommendedBudget: Math.round(recommendedBudget * 100) / 100,
      reason,
    });
  });

  return {
    totalBudget,
    recommendations,
  };
};

/**
 * Set budget for a campaign
 */
export const setCampaignBudget = async (
  campaignId: string,
  budget: number
): Promise<void> => {
  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: { budget },
  });

  console.log(`💰 Updated campaign ${campaignId} budget to $${budget}`);
};

/**
 * Get spending forecast
 */
export const getSpendingForecast = async (websiteId: string, days: number = 7): Promise<{
  currentDailyAverage: number;
  projectedSpend: number;
  weeklyBudget: number;
  onTrack: boolean;
}> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const campaigns = await prisma.marketingCampaign.findMany({
    where: { websiteId },
    include: {
      metrics: {
        where: {
          date: {
            gte: startOfWeek,
          },
        },
      },
    },
  });

  const weeklyBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce(
    (sum, c) => sum + c.metrics.reduce((s, m) => s + m.spend, 0),
    0
  );

  const daysElapsed = Math.ceil((now.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
  const currentDailyAverage = totalSpent / daysElapsed;
  const projectedSpend = currentDailyAverage * 7;
  const onTrack = projectedSpend <= weeklyBudget;

  return {
    currentDailyAverage: Math.round(currentDailyAverage * 100) / 100,
    projectedSpend: Math.round(projectedSpend * 100) / 100,
    weeklyBudget,
    onTrack,
  };
};
