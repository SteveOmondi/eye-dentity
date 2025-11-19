/**
 * LinkedIn Marketing API Integration Service
 *
 * This service provides integration with LinkedIn Marketing Solutions API
 * for B2B marketing campaigns, sponsored content, and professional targeting.
 *
 * Features:
 * - OAuth authentication for LinkedIn accounts
 * - Sponsored content campaigns
 * - Professional targeting (job title, industry, seniority)
 * - Performance metrics tracking
 * - Company page management
 */

import axios from 'axios';
import { prisma } from '../lib/prisma';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LinkedInCampaign {
  id: string;
  name: string;
  status: string;
  dailyBudget: number;
  totalBudget: number;
  startTime: string;
  endTime?: string;
}

export interface LinkedInTargeting {
  jobTitles?: string[];
  jobFunctions?: string[];
  industries?: string[];
  companySizes?: string[];
  seniority?: string[];
  locations?: string[];
  skills?: string[];
}

export interface LinkedInMetrics {
  impressions: number;
  clicks: number;
  engagement: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

/**
 * Check if LinkedIn API is configured
 */
export const isLinkedInConfigured = (): boolean => {
  return !!(
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET &&
    process.env.LINKEDIN_REDIRECT_URI
  );
};

/**
 * Generate LinkedIn OAuth authorization URL
 */
export const getLinkedInAuthUrl = (state?: string): string => {
  const config: LinkedInAuthConfig = {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
  };

  const scopes = [
    'r_organization_social',
    'w_organization_social',
    'rw_organization_admin',
    'r_ads',
    'w_ads',
    'rw_ads',
  ];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state: state || '',
    scope: scopes.join(' '),
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}> => {
  if (!isLinkedInConfigured()) {
    throw new Error('LinkedIn API not configured');
  }

  try {
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in || 5184000, // 60 days
      refreshToken: response.data.refresh_token,
    };
  } catch (error: any) {
    console.error('LinkedIn token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for access token');
  }
};

/**
 * Get user's LinkedIn organizations (companies)
 */
export const getLinkedInOrganizations = async (
  accessToken: string
): Promise<Array<{ id: string; name: string }>> => {
  try {
    const response = await axios.get(`${LINKEDIN_API_BASE}/organizationAcls`, {
      params: {
        q: 'roleAssignee',
        projection: '(elements*(organization~(id,localizedName)))',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    return response.data.elements.map((element: any) => ({
      id: element['organization~'].id,
      name: element['organization~'].localizedName,
    }));
  } catch (error: any) {
    console.error('Get LinkedIn organizations error:', error.response?.data || error.message);
    throw new Error('Failed to retrieve LinkedIn organizations');
  }
};

/**
 * Create sponsored content campaign
 */
export const createLinkedInCampaign = async (
  accessToken: string,
  accountId: string,
  params: {
    name: string;
    dailyBudget: number;
    totalBudget?: number;
    startTime: string;
    endTime?: string;
    objective?: string;
  }
): Promise<LinkedInCampaign> => {
  try {
    const campaignData = {
      account: `urn:li:sponsoredAccount:${accountId}`,
      name: params.name,
      type: 'SPONSORED_UPDATES',
      costType: 'CPM',
      dailyBudget: {
        amount: params.dailyBudget.toString(),
        currencyCode: 'USD',
      },
      status: 'PAUSED',
      offsiteDeliveryEnabled: false,
      locale: {
        country: 'US',
        language: 'en',
      },
      runSchedule: {
        start: new Date(params.startTime).getTime(),
        end: params.endTime ? new Date(params.endTime).getTime() : undefined,
      },
    };

    if (params.totalBudget) {
      (campaignData as any).totalBudget = {
        amount: params.totalBudget.toString(),
        currencyCode: 'USD',
      };
    }

    const response = await axios.post(
      `${LINKEDIN_API_BASE}/adCampaignsV2`,
      campaignData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return {
      id: response.data.id,
      name: params.name,
      status: 'PAUSED',
      dailyBudget: params.dailyBudget,
      totalBudget: params.totalBudget || 0,
      startTime: params.startTime,
      endTime: params.endTime,
    };
  } catch (error: any) {
    console.error('Create LinkedIn campaign error:', error.response?.data || error.message);
    throw new Error('Failed to create LinkedIn campaign');
  }
};

/**
 * Create sponsored content (ad creative)
 */
export const createLinkedInCreative = async (
  accessToken: string,
  campaignId: string,
  organizationId: string,
  params: {
    title: string;
    description: string;
    imageUrl?: string;
    landingPageUrl: string;
    callToAction?: string;
  }
): Promise<{ id: string }> => {
  try {
    const creativeData = {
      campaign: `urn:li:sponsoredCampaign:${campaignId}`,
      creativeType: 'SPONSORED_STATUS_UPDATE',
      variables: {
        data: {
          'com.linkedin.ads.SponsoredUpdateCreativeVariables': {
            activity: `urn:li:activity:${Date.now()}`, // Would be actual post URN
          },
        },
      },
      status: 'PAUSED',
    };

    const response = await axios.post(
      `${LINKEDIN_API_BASE}/adCreativesV2`,
      creativeData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return {
      id: response.data.id,
    };
  } catch (error: any) {
    console.error('Create LinkedIn creative error:', error.response?.data || error.message);
    throw new Error('Failed to create LinkedIn creative');
  }
};

/**
 * Get campaign analytics
 */
export const getLinkedInCampaignMetrics = async (
  accessToken: string,
  campaignId: string,
  dateRange: { start: string; end: string }
): Promise<LinkedInMetrics> => {
  try {
    const response = await axios.get(`${LINKEDIN_API_BASE}/adAnalyticsV2`, {
      params: {
        q: 'analytics',
        pivot: 'CAMPAIGN',
        dateRange: `(start:(year:${new Date(dateRange.start).getFullYear()},month:${new Date(dateRange.start).getMonth() + 1},day:${new Date(dateRange.start).getDate()}),end:(year:${new Date(dateRange.end).getFullYear()},month:${new Date(dateRange.end).getMonth() + 1},day:${new Date(dateRange.end).getDate()}))`,
        campaigns: `urn:li:sponsoredCampaign:${campaignId}`,
        fields: 'impressions,clicks,externalWebsiteConversions,costInLocalCurrency',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const data = response.data.elements[0] || {};

    const impressions = data.impressions || 0;
    const clicks = data.clicks || 0;
    const conversions = data.externalWebsiteConversions || 0;
    const spend = data.costInLocalCurrency || 0;

    return {
      impressions,
      clicks,
      engagement: clicks,
      spend,
      conversions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    };
  } catch (error: any) {
    console.error('Get LinkedIn metrics error:', error.response?.data || error.message);
    throw new Error('Failed to retrieve LinkedIn metrics');
  }
};

/**
 * Update campaign status
 */
export const updateLinkedInCampaignStatus = async (
  accessToken: string,
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
): Promise<boolean> => {
  try {
    await axios.post(
      `${LINKEDIN_API_BASE}/adCampaignsV2/${campaignId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return true;
  } catch (error: any) {
    console.error('Update LinkedIn campaign status error:', error.response?.data || error.message);
    throw new Error('Failed to update LinkedIn campaign status');
  }
};

/**
 * Save LinkedIn account to database
 */
export const saveLinkedInAccount = async (
  userId: string,
  accountId: string,
  accountName: string,
  accessToken: string,
  expiresIn: number,
  refreshToken?: string
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

  await prisma.adAccount.upsert({
    where: {
      userId_channel: {
        userId,
        channel: 'linkedin',
      },
    },
    create: {
      userId,
      channel: 'linkedin',
      accountId,
      accountName,
      accessToken, // In production, encrypt this
      refreshToken, // In production, encrypt this
      expiresAt,
      status: 'active',
    },
    update: {
      accountId,
      accountName,
      accessToken, // In production, encrypt this
      refreshToken, // In production, encrypt this
      expiresAt,
      status: 'active',
    },
  });
};

/**
 * Get stored LinkedIn account
 */
export const getStoredLinkedInAccount = async (
  userId: string
): Promise<{
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date | null;
} | null> => {
  const account = await prisma.adAccount.findUnique({
    where: {
      userId_channel: {
        userId,
        channel: 'linkedin',
      },
    },
  });

  if (!account || !account.accessToken) {
    return null;
  }

  return {
    accountId: account.accountId,
    accessToken: account.accessToken, // In production, decrypt this
    refreshToken: account.refreshToken || undefined,
    expiresAt: account.expiresAt,
  };
};

/**
 * Generate LinkedIn targeting suggestions based on profession
 */
export const generateLinkedInTargeting = (
  profession: string,
  industry: string
): LinkedInTargeting => {
  // Mock targeting suggestions - in production, use LinkedIn Targeting API
  const targetingMap: Record<string, LinkedInTargeting> = {
    lawyer: {
      jobTitles: ['Attorney', 'Lawyer', 'Legal Counsel', 'Partner'],
      jobFunctions: ['Legal'],
      industries: ['Legal Services', 'Law Practice'],
      seniority: ['Senior', 'Manager', 'Director', 'VP', 'CXO'],
    },
    dentist: {
      jobTitles: ['Dentist', 'Dental Surgeon', 'Orthodontist'],
      jobFunctions: ['Medical & Health'],
      industries: ['Medical Practice', 'Health, Wellness and Fitness'],
      seniority: ['Senior', 'Manager', 'Owner'],
    },
    accountant: {
      jobTitles: ['Accountant', 'CPA', 'Financial Analyst', 'Controller'],
      jobFunctions: ['Accounting', 'Finance'],
      industries: ['Accounting', 'Financial Services'],
      seniority: ['Entry', 'Senior', 'Manager'],
    },
  };

  const professionKey = profession.toLowerCase();
  return targetingMap[professionKey] || {
    industries: [industry],
    seniority: ['Entry', 'Senior', 'Manager'],
  };
};
