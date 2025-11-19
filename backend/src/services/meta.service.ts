/**
 * Meta Business Suite Integration Service
 *
 * This service provides integration with Meta (Facebook/Instagram) Marketing APIs
 * for automated campaign creation, ad management, and performance tracking.
 *
 * Features:
 * - OAuth authentication flow
 * - Ad account management
 * - Campaign creation and management
 * - Ad creative management
 * - Performance metrics tracking
 * - Meta Pixel integration
 */

import { prisma } from '../lib/prisma';
import axios from 'axios';

const META_API_VERSION = 'v21.0';
const META_GRAPH_API = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  accountStatus: string;
  currency: string;
  balance: number;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effectiveStatus: string;
  budget: number;
  startTime?: string;
  endTime?: string;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  creative: {
    id: string;
    title: string;
    body: string;
    imageUrl?: string;
    callToAction?: string;
  };
}

export interface MetaMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionValue: number;
}

/**
 * Check if Meta API is configured
 */
export const isMetaConfigured = (): boolean => {
  return !!(
    process.env.META_APP_ID &&
    process.env.META_APP_SECRET &&
    process.env.META_REDIRECT_URI
  );
};

/**
 * Generate OAuth authorization URL
 */
export const getMetaAuthUrl = (state?: string): string => {
  const config: MetaAuthConfig = {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    redirectUri: process.env.META_REDIRECT_URI || '',
  };

  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    state: state || '',
    scope: [
      'ads_management',
      'ads_read',
      'business_management',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
    ].join(','),
  });

  return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> => {
  if (!isMetaConfigured()) {
    throw new Error('Meta API not configured');
  }

  try {
    const response = await axios.get(`${META_GRAPH_API}/oauth/access_token`, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: process.env.META_REDIRECT_URI,
        code,
      },
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in || 3600,
    };
  } catch (error: any) {
    console.error('Meta token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for access token');
  }
};

/**
 * Get long-lived access token
 */
export const getLongLivedToken = async (shortLivedToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> => {
  try {
    const response = await axios.get(`${META_GRAPH_API}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in || 5184000, // 60 days default
    };
  } catch (error: any) {
    console.error('Get long-lived token error:', error.response?.data || error.message);
    throw new Error('Failed to get long-lived access token');
  }
};

/**
 * Get user's ad accounts
 */
export const getAdAccounts = async (accessToken: string): Promise<MetaAdAccount[]> => {
  try {
    const response = await axios.get(`${META_GRAPH_API}/me/adaccounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,account_status,currency,balance',
      },
    });

    return response.data.data.map((account: any) => ({
      id: account.id,
      name: account.name,
      accountStatus: account.account_status,
      currency: account.currency,
      balance: parseFloat(account.balance) / 100, // Convert from cents
    }));
  } catch (error: any) {
    console.error('Get ad accounts error:', error.response?.data || error.message);
    throw new Error('Failed to retrieve ad accounts');
  }
};

/**
 * Create a marketing campaign
 */
export const createCampaign = async (
  accessToken: string,
  adAccountId: string,
  params: {
    name: string;
    objective: string;
    status?: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    startTime?: string;
    endTime?: string;
  }
): Promise<MetaCampaign> => {
  try {
    // Build campaign data
    const campaignData: any = {
      name: params.name,
      objective: params.objective,
      status: params.status || 'PAUSED',
      special_ad_categories: [],
    };

    if (params.dailyBudget) {
      campaignData.daily_budget = Math.round(params.dailyBudget * 100); // Convert to cents
    }

    if (params.lifetimeBudget) {
      campaignData.lifetime_budget = Math.round(params.lifetimeBudget * 100);
    }

    if (params.startTime) {
      campaignData.start_time = params.startTime;
    }

    if (params.endTime) {
      campaignData.end_time = params.endTime;
    }

    const response = await axios.post(
      `${META_GRAPH_API}/${adAccountId}/campaigns`,
      campaignData,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    return {
      id: response.data.id,
      name: params.name,
      objective: params.objective,
      status: params.status || 'PAUSED',
      effectiveStatus: 'PAUSED',
      budget: params.dailyBudget || params.lifetimeBudget || 0,
      startTime: params.startTime,
      endTime: params.endTime,
    };
  } catch (error: any) {
    console.error('Create campaign error:', error.response?.data || error.message);
    throw new Error('Failed to create campaign');
  }
};

/**
 * Create ad set (targeting and budget configuration)
 */
export const createAdSet = async (
  accessToken: string,
  adAccountId: string,
  campaignId: string,
  params: {
    name: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    targeting: {
      geoLocations?: { countries?: string[]; cities?: any[] };
      ageMin?: number;
      ageMax?: number;
      genders?: number[];
      interests?: string[];
    };
    startTime?: string;
    endTime?: string;
  }
): Promise<{ id: string; name: string }> => {
  try {
    const adSetData: any = {
      name: params.name,
      campaign_id: campaignId,
      targeting: params.targeting,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'REACH',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      status: 'PAUSED',
    };

    if (params.dailyBudget) {
      adSetData.daily_budget = Math.round(params.dailyBudget * 100);
    }

    if (params.lifetimeBudget) {
      adSetData.lifetime_budget = Math.round(params.lifetimeBudget * 100);
    }

    if (params.startTime) {
      adSetData.start_time = params.startTime;
    }

    if (params.endTime) {
      adSetData.end_time = params.endTime;
    }

    const response = await axios.post(
      `${META_GRAPH_API}/${adAccountId}/adsets`,
      adSetData,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    return {
      id: response.data.id,
      name: params.name,
    };
  } catch (error: any) {
    console.error('Create ad set error:', error.response?.data || error.message);
    throw new Error('Failed to create ad set');
  }
};

/**
 * Create ad creative
 */
export const createAdCreative = async (
  accessToken: string,
  adAccountId: string,
  params: {
    name: string;
    title: string;
    body: string;
    imageUrl?: string;
    imageHash?: string;
    callToAction?: string;
    link?: string;
  }
): Promise<{ id: string; name: string }> => {
  try {
    const creativeData: any = {
      name: params.name,
      object_story_spec: {
        page_id: process.env.META_PAGE_ID || '',
        link_data: {
          message: params.body,
          link: params.link || '',
          name: params.title,
        },
      },
    };

    if (params.imageHash) {
      creativeData.object_story_spec.link_data.image_hash = params.imageHash;
    }

    if (params.callToAction) {
      creativeData.object_story_spec.link_data.call_to_action = {
        type: params.callToAction,
        value: {
          link: params.link || '',
        },
      };
    }

    const response = await axios.post(
      `${META_GRAPH_API}/${adAccountId}/adcreatives`,
      creativeData,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    return {
      id: response.data.id,
      name: params.name,
    };
  } catch (error: any) {
    console.error('Create ad creative error:', error.response?.data || error.message);
    throw new Error('Failed to create ad creative');
  }
};

/**
 * Create ad
 */
export const createAd = async (
  accessToken: string,
  adAccountId: string,
  adSetId: string,
  creativeId: string,
  name: string
): Promise<{ id: string; name: string }> => {
  try {
    const response = await axios.post(
      `${META_GRAPH_API}/${adAccountId}/ads`,
      {
        name,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'PAUSED',
      },
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    return {
      id: response.data.id,
      name,
    };
  } catch (error: any) {
    console.error('Create ad error:', error.response?.data || error.message);
    throw new Error('Failed to create ad');
  }
};

/**
 * Get campaign metrics
 */
export const getCampaignMetrics = async (
  accessToken: string,
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<MetaMetrics> => {
  try {
    const response = await axios.get(`${META_GRAPH_API}/${campaignId}/insights`, {
      params: {
        access_token: accessToken,
        fields: 'impressions,clicks,spend,reach,ctr,cpc,conversions,conversion_values',
        date_preset: datePreset,
      },
    });

    const data = response.data.data[0] || {};

    return {
      impressions: parseInt(data.impressions || '0'),
      clicks: parseInt(data.clicks || '0'),
      spend: parseFloat(data.spend || '0'),
      reach: parseInt(data.reach || '0'),
      ctr: parseFloat(data.ctr || '0'),
      cpc: parseFloat(data.cpc || '0'),
      conversions: parseInt(data.conversions || '0'),
      conversionValue: parseFloat(data.conversion_values || '0'),
    };
  } catch (error: any) {
    console.error('Get campaign metrics error:', error.response?.data || error.message);
    throw new Error('Failed to retrieve campaign metrics');
  }
};

/**
 * Update campaign status
 */
export const updateCampaignStatus = async (
  accessToken: string,
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
): Promise<boolean> => {
  try {
    await axios.post(
      `${META_GRAPH_API}/${campaignId}`,
      { status },
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    return true;
  } catch (error: any) {
    console.error('Update campaign status error:', error.response?.data || error.message);
    throw new Error('Failed to update campaign status');
  }
};

/**
 * Generate Meta Pixel code for website
 */
export const generateMetaPixelCode = (pixelId: string): string => {
  return `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->
  `.trim();
};

/**
 * Save ad account to database
 */
export const saveAdAccount = async (
  userId: string,
  accountId: string,
  accountName: string,
  accessToken: string,
  expiresIn: number
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

  await prisma.adAccount.upsert({
    where: {
      userId_channel: {
        userId,
        channel: 'meta',
      },
    },
    create: {
      userId,
      channel: 'meta',
      accountId,
      accountName,
      accessToken, // In production, encrypt this
      expiresAt,
      status: 'active',
    },
    update: {
      accountId,
      accountName,
      accessToken, // In production, encrypt this
      expiresAt,
      status: 'active',
    },
  });
};

/**
 * Get ad account from database
 */
export const getStoredAdAccount = async (
  userId: string
): Promise<{
  accountId: string;
  accessToken: string;
  expiresAt: Date | null;
} | null> => {
  const account = await prisma.adAccount.findUnique({
    where: {
      userId_channel: {
        userId,
        channel: 'meta',
      },
    },
  });

  if (!account || !account.accessToken) {
    return null;
  }

  return {
    accountId: account.accountId,
    accessToken: account.accessToken, // In production, decrypt this
    expiresAt: account.expiresAt,
  };
};

/**
 * Check if access token is expired
 */
export const isTokenExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return new Date() >= expiresAt;
};
