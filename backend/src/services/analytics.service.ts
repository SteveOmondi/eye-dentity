/**
 * Analytics Service
 *
 * This service provides comprehensive analytics and metrics for the platform:
 * - User growth tracking (daily, weekly, monthly)
 * - Revenue analytics (MRR, ARR, churn rate)
 * - Website statistics
 * - Geographic distribution
 * - Performance metrics
 */

import { prisma } from '../lib/prisma';

export interface UserGrowthMetrics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  chartData: Array<{
    date: string;
    users: number;
    newUsers: number;
  }>;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  averageOrderValue: number;
  chartData: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface WebsiteMetrics {
  totalWebsites: number;
  activeWebsites: number;
  inactiveWebsites: number;
  failedDeployments: number;
  averageDeploymentTime: number;
  websitesByStatus: {
    active: number;
    pending: number;
    failed: number;
  };
}

export interface PlatformMetrics {
  users: UserGrowthMetrics;
  revenue: RevenueMetrics;
  websites: WebsiteMetrics;
  orders: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
  systemHealth: {
    uptime: number;
    apiResponseTime: number;
    databaseStatus: string;
  };
}

/**
 * Get user growth metrics
 */
export const getUserGrowthMetrics = async (days: number = 30): Promise<UserGrowthMetrics> => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(now.getDate() - 30);
  startOfMonth.setHours(0, 0, 0, 0);

  const previousDay = new Date(startOfToday);
  previousDay.setDate(previousDay.getDate() - 1);

  const previousWeek = new Date(startOfWeek);
  previousWeek.setDate(previousWeek.getDate() - 7);

  const previousMonth = new Date(startOfMonth);
  previousMonth.setDate(previousMonth.getDate() - 30);

  // Total users
  const totalUsers = await prisma.user.count();

  // New users today
  const newUsersToday = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
  });

  // New users this week
  const newUsersThisWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfWeek,
      },
    },
  });

  // New users this month
  const newUsersThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  // Previous period data for growth rate calculation
  const newUsersPreviousDay = await prisma.user.count({
    where: {
      createdAt: {
        gte: previousDay,
        lt: startOfToday,
      },
    },
  });

  const newUsersPreviousWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: previousWeek,
        lt: startOfWeek,
      },
    },
  });

  const newUsersPreviousMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: previousMonth,
        lt: startOfMonth,
      },
    },
  });

  // Calculate growth rates
  const dailyGrowthRate = newUsersPreviousDay > 0
    ? ((newUsersToday - newUsersPreviousDay) / newUsersPreviousDay) * 100
    : newUsersToday > 0 ? 100 : 0;

  const weeklyGrowthRate = newUsersPreviousWeek > 0
    ? ((newUsersThisWeek - newUsersPreviousWeek) / newUsersPreviousWeek) * 100
    : newUsersThisWeek > 0 ? 100 : 0;

  const monthlyGrowthRate = newUsersPreviousMonth > 0
    ? ((newUsersThisMonth - newUsersPreviousMonth) / newUsersPreviousMonth) * 100
    : newUsersThisMonth > 0 ? 100 : 0;

  // Generate chart data
  const chartData = await generateUserChartData(days);

  return {
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    growthRate: {
      daily: Math.round(dailyGrowthRate * 10) / 10,
      weekly: Math.round(weeklyGrowthRate * 10) / 10,
      monthly: Math.round(monthlyGrowthRate * 10) / 10,
    },
    chartData,
  };
};

/**
 * Generate user growth chart data
 */
async function generateUserChartData(days: number): Promise<Array<{ date: string; users: number; newUsers: number }>> {
  const chartData: Array<{ date: string; users: number; newUsers: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // Total users up to this date
    const totalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lte: nextDate,
        },
      },
    });

    // New users on this date
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });

    chartData.push({
      date: date.toISOString().split('T')[0],
      users: totalUsers,
      newUsers,
    });
  }

  return chartData;
}

/**
 * Get revenue analytics
 */
export const getRevenueMetrics = async (days: number = 30): Promise<RevenueMetrics> => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(now.getDate() - 30);
  startOfMonth.setHours(0, 0, 0, 0);

  // Total revenue
  const totalRevenueData = await prisma.order.aggregate({
    where: {
      status: 'COMPLETED',
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Revenue today
  const revenueTodayData = await prisma.order.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: {
        gte: startOfToday,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Revenue this week
  const revenueThisWeekData = await prisma.order.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: {
        gte: startOfWeek,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Revenue this month
  const revenueThisMonthData = await prisma.order.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Calculate MRR (Monthly Recurring Revenue)
  // Assuming monthly subscriptions
  const mrr = revenueThisMonthData._sum.totalAmount || 0;

  // Calculate ARR (Annual Recurring Revenue)
  const arr = mrr * 12;

  // Average order value
  const totalOrders = await prisma.order.count({
    where: { status: 'COMPLETED' },
  });

  const averageOrderValue = totalOrders > 0
    ? (totalRevenueData._sum.totalAmount || 0) / totalOrders
    : 0;

  // Generate revenue chart data
  const chartData = await generateRevenueChartData(days);

  return {
    totalRevenue: totalRevenueData._sum.totalAmount || 0,
    revenueToday: revenueTodayData._sum.totalAmount || 0,
    revenueThisWeek: revenueThisWeekData._sum.totalAmount || 0,
    revenueThisMonth: revenueThisMonthData._sum.totalAmount || 0,
    mrr,
    arr,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    chartData,
  };
};

/**
 * Generate revenue chart data
 */
async function generateRevenueChartData(days: number): Promise<Array<{ date: string; revenue: number }>> {
  const chartData: Array<{ date: string; revenue: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const revenueData = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: date,
          lt: nextDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    chartData.push({
      date: date.toISOString().split('T')[0],
      revenue: revenueData._sum.totalAmount || 0,
    });
  }

  return chartData;
}

/**
 * Get website metrics
 */
export const getWebsiteMetrics = async (): Promise<WebsiteMetrics> => {
  const totalWebsites = await prisma.website.count();

  const activeWebsites = await prisma.website.count({
    where: {
      status: 'ACTIVE',
    },
  });

  const inactiveWebsites = await prisma.website.count({
    where: {
      status: {
        in: ['INACTIVE', 'SUSPENDED'],
      },
    },
  });

  const failedDeployments = await prisma.website.count({
    where: {
      status: 'ERROR',
    },
  });

  const pendingWebsites = await prisma.website.count({
    where: {
      status: 'PENDING',
    },
  });

  // Calculate average deployment time
  // This would require storing deployment start and end times
  // For now, using a mock value
  const averageDeploymentTime = 45; // seconds

  return {
    totalWebsites,
    activeWebsites,
    inactiveWebsites,
    failedDeployments,
    averageDeploymentTime,
    websitesByStatus: {
      active: activeWebsites,
      pending: pendingWebsites,
      failed: failedDeployments,
    },
  };
};

/**
 * Get complete platform metrics
 */
export const getPlatformMetrics = async (days: number = 30): Promise<PlatformMetrics> => {
  const users = await getUserGrowthMetrics(days);
  const revenue = await getRevenueMetrics(days);
  const websites = await getWebsiteMetrics();

  // Order statistics
  const totalOrders = await prisma.order.count();
  const completedOrders = await prisma.order.count({
    where: { status: 'COMPLETED' },
  });
  const pendingOrders = await prisma.order.count({
    where: { status: 'PENDING' },
  });
  const failedOrders = await prisma.order.count({
    where: { status: 'FAILED' },
  });

  // System health
  const systemHealth = {
    uptime: process.uptime(),
    apiResponseTime: 0, // Would be calculated from actual API monitoring
    databaseStatus: 'healthy',
  };

  return {
    users,
    revenue,
    websites,
    orders: {
      total: totalOrders,
      completed: completedOrders,
      pending: pendingOrders,
      failed: failedOrders,
    },
    systemHealth,
  };
};

/**
 * Get geographic distribution of users
 */
export const getGeographicDistribution = async (): Promise<Array<{ location: string; count: number }>> => {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
  });

  const locationCounts: Record<string, number> = {};

  users.forEach((user: any) => {
    const location = user.profile?.location || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 locations
};

/**
 * Get hosting plan distribution
 */
export const getHostingPlanDistribution = async (): Promise<Array<{ plan: string; count: number; revenue: number }>> => {
  const orders = await prisma.order.groupBy({
    by: ['hostingPlan'],
    where: {
      status: 'COMPLETED',
    },
    _count: {
      id: true,
    },
    _sum: {
      totalAmount: true,
    },
  });

  return orders.map((order: any) => ({
    plan: order.hostingPlan,
    count: order._count.id,
    revenue: order._sum.totalAmount || 0,
  }));
};

/**
 * Get top performing websites by traffic
 * (Mock implementation - would integrate with actual analytics in production)
 */
export const getTopWebsites = async (limit: number = 10): Promise<Array<{
  id: string;
  domain: string;
  userId: string;
  views: number;
  status: string;
}>> => {
  const websites = await prisma.website.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  // Mock traffic data - in production, this would come from analytics service
  return websites.map((website: any) => ({
    id: website.id,
    domain: website.domain,
    userId: website.userId,
    views: Math.floor(Math.random() * 10000),
    status: website.status,
  }));
};

/**
 * Get recent activity feed
 */
export const getRecentActivity = async (limit: number = 20): Promise<Array<{
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}>> => {
  const recentOrders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit / 2,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  const recentWebsites = await prisma.website.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit / 2,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  const activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    metadata?: any;
  }> = [];

  recentOrders.forEach((order: any) => {
    activities.push({
      id: order.id,
      type: 'order',
      description: `New order from ${order.user.name || order.user.email} for ${order.domain}`,
      timestamp: order.createdAt,
      metadata: {
        orderId: order.id,
        domain: order.domain,
        amount: order.totalAmount,
        status: order.status,
      },
    });
  });

  recentWebsites.forEach((website: any) => {
    activities.push({
      id: website.id,
      type: 'website',
      description: `Website ${website.domain} deployed for ${website.user.name || website.user.email}`,
      timestamp: website.createdAt,
      metadata: {
        websiteId: website.id,
        domain: website.domain,
        status: website.status,
      },
    });
  });

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
};
