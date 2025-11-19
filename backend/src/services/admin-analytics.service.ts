import { prisma } from '../lib/prisma';

/**
 * Admin Analytics Service
 *
 * Provides comprehensive analytics and insights for admin dashboard
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RevenueMetrics {
  totalRevenue: number;
  subscriptionRevenue: number;
  marketplaceRevenue: number;
  growth: number;
  averageRevenuePerUser: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
}

export interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
  retentionRate: number;
  activationRate: number;
}

export interface WebsiteMetrics {
  totalWebsites: number;
  liveWebsites: number;
  pendingWebsites: number;
  averageGenerationTime: number;
  successRate: number;
}

export interface MarketplaceMetrics {
  totalBookings: number;
  completedBookings: number;
  revenue: number;
  averageBookingValue: number;
  topProviders: any[];
  topCategories: any[];
}

/**
 * Get revenue metrics
 */
export const getRevenueMetrics = async (dateRange: DateRange): Promise<RevenueMetrics> => {
  // Get subscription revenue
  const subscriptionPayments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: {
      amount: true,
    },
  });

  const subscriptionRevenue = subscriptionPayments.reduce((sum, p) => sum + p.amount, 0);

  // Get marketplace revenue
  const marketplaceBookings = await prisma.booking.findMany({
    where: {
      paymentStatus: 'paid',
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: {
      price: true,
    },
  });

  const marketplaceRevenue = marketplaceBookings.reduce((sum, b) => sum + b.price, 0);
  const totalRevenue = subscriptionRevenue + marketplaceRevenue;

  // Calculate growth (compare to previous period)
  const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
  const previousStart = new Date(dateRange.start.getTime() - periodLength);
  const previousEnd = dateRange.start;

  const previousPayments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: {
        gte: previousStart,
        lte: previousEnd,
      },
    },
    select: { amount: true },
  });

  const previousBookings = await prisma.booking.findMany({
    where: {
      paymentStatus: 'paid',
      createdAt: {
        gte: previousStart,
        lte: previousEnd,
      },
    },
    select: { price: true },
  });

  const previousRevenue =
    previousPayments.reduce((sum, p) => sum + p.amount, 0) +
    previousBookings.reduce((sum, b) => sum + b.price, 0);

  const growth = previousRevenue > 0
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  // Calculate MRR (Monthly Recurring Revenue)
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      status: 'ACTIVE',
    },
  });

  // Assume average subscription price of $29/month for MRR calculation
  const avgSubscriptionPrice = 29;
  const mrr = activeSubscriptions * avgSubscriptionPrice;
  const arr = mrr * 12;

  // Get total users for ARPU calculation
  const totalUsers = await prisma.user.count();
  const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  return {
    totalRevenue,
    subscriptionRevenue,
    marketplaceRevenue,
    growth: Math.round(growth * 10) / 10,
    averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
    mrr,
    arr,
  };
};

/**
 * Get user metrics
 */
export const getUserMetrics = async (dateRange: DateRange): Promise<UserMetrics> => {
  const [totalUsers, newUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
  ]);

  // Active users (users with activity in the period)
  const activeUsers = await prisma.user.count({
    where: {
      OR: [
        {
          websites: {
            some: {
              updatedAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
        },
        {
          payments: {
            some: {
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
        },
        {
          bookings: {
            some: {
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
        },
      ],
    },
  });

  // Churned users (cancelled subscriptions in period)
  const churnedUsers = await prisma.subscription.count({
    where: {
      status: 'CANCELED',
      updatedAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  // Calculate retention rate
  const periodStart = dateRange.start.getTime();
  const thirtyDaysAgo = new Date(periodStart - 30 * 24 * 60 * 60 * 1000);

  const usersAtStart = await prisma.user.count({
    where: {
      createdAt: {
        lte: thirtyDaysAgo,
      },
    },
  });

  const retainedUsers = await prisma.user.count({
    where: {
      createdAt: {
        lte: thirtyDaysAgo,
      },
      subscriptions: {
        some: {
          status: 'ACTIVE',
        },
      },
    },
  });

  const retentionRate = usersAtStart > 0
    ? (retainedUsers / usersAtStart) * 100
    : 0;

  // Calculate activation rate (users who created a website)
  const usersWithWebsites = await prisma.user.count({
    where: {
      websites: {
        some: {},
      },
    },
  });

  const activationRate = totalUsers > 0
    ? (usersWithWebsites / totalUsers) * 100
    : 0;

  return {
    totalUsers,
    newUsers,
    activeUsers,
    churnedUsers,
    retentionRate: Math.round(retentionRate * 10) / 10,
    activationRate: Math.round(activationRate * 10) / 10,
  };
};

/**
 * Get website metrics
 */
export const getWebsiteMetrics = async (dateRange: DateRange): Promise<WebsiteMetrics> => {
  const [totalWebsites, liveWebsites, pendingWebsites] = await Promise.all([
    prisma.website.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
    prisma.website.count({
      where: {
        status: 'LIVE',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    }),
    prisma.website.count({
      where: {
        status: {
          in: ['PENDING', 'GENERATING', 'DEPLOYING'],
        },
      },
    }),
  ]);

  // Calculate average generation time and success rate
  const completedWebsites = await prisma.website.findMany({
    where: {
      status: {
        in: ['LIVE', 'GENERATED'],
      },
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
      status: true,
    },
  });

  const generationTimes = completedWebsites.map(w =>
    w.updatedAt.getTime() - w.createdAt.getTime()
  );

  const averageGenerationTime = generationTimes.length > 0
    ? generationTimes.reduce((sum, t) => sum + t, 0) / generationTimes.length / 1000
    : 0;

  const successfulWebsites = completedWebsites.filter(w => w.status !== 'ERROR').length;
  const successRate = totalWebsites > 0
    ? (successfulWebsites / totalWebsites) * 100
    : 0;

  return {
    totalWebsites,
    liveWebsites,
    pendingWebsites,
    averageGenerationTime: Math.round(averageGenerationTime),
    successRate: Math.round(successRate * 10) / 10,
  };
};

/**
 * Get marketplace metrics
 */
export const getMarketplaceMetrics = async (dateRange: DateRange): Promise<MarketplaceMetrics> => {
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    include: {
      provider: {
        include: {
          category: true,
        },
      },
    },
  });

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
  const revenue = paidBookings.reduce((sum, b) => sum + b.price, 0);
  const averageBookingValue = paidBookings.length > 0
    ? revenue / paidBookings.length
    : 0;

  // Get top providers
  const providerRevenue = new Map<string, { provider: any; revenue: number; bookings: number }>();

  paidBookings.forEach(booking => {
    const key = booking.providerId;
    if (!providerRevenue.has(key)) {
      providerRevenue.set(key, {
        provider: booking.provider,
        revenue: 0,
        bookings: 0,
      });
    }
    const data = providerRevenue.get(key)!;
    data.revenue += booking.price;
    data.bookings += 1;
  });

  const topProviders = Array.from(providerRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(p => ({
      id: p.provider.id,
      name: p.provider.name,
      revenue: p.revenue,
      bookings: p.bookings,
      category: p.provider.category.name,
    }));

  // Get top categories
  const categoryRevenue = new Map<string, { category: string; revenue: number; bookings: number }>();

  paidBookings.forEach(booking => {
    const category = booking.provider.category.name;
    if (!categoryRevenue.has(category)) {
      categoryRevenue.set(category, {
        category,
        revenue: 0,
        bookings: 0,
      });
    }
    const data = categoryRevenue.get(category)!;
    data.revenue += booking.price;
    data.bookings += 1;
  });

  const topCategories = Array.from(categoryRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalBookings,
    completedBookings,
    revenue,
    averageBookingValue: Math.round(averageBookingValue * 100) / 100,
    topProviders,
    topCategories,
  };
};

/**
 * Get comprehensive dashboard analytics
 */
export const getDashboardAnalytics = async (dateRange: DateRange) => {
  const [revenue, users, websites, marketplace] = await Promise.all([
    getRevenueMetrics(dateRange),
    getUserMetrics(dateRange),
    getWebsiteMetrics(dateRange),
    getMarketplaceMetrics(dateRange),
  ]);

  return {
    dateRange,
    revenue,
    users,
    websites,
    marketplace,
    timestamp: new Date(),
  };
};

/**
 * Get revenue trends (daily breakdown)
 */
export const getRevenueTrends = async (days: number = 30) => {
  const trends = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [payments, bookings] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
        select: { amount: true },
      }),
      prisma.booking.findMany({
        where: {
          paymentStatus: 'paid',
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
        select: { price: true },
      }),
    ]);

    const subscriptionRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const marketplaceRevenue = bookings.reduce((sum, b) => sum + b.price, 0);

    trends.push({
      date: date.toISOString().split('T')[0],
      subscriptionRevenue,
      marketplaceRevenue,
      totalRevenue: subscriptionRevenue + marketplaceRevenue,
    });
  }

  return trends;
};

/**
 * Get user growth trends
 */
export const getUserGrowthTrends = async (days: number = 30) => {
  const trends = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [newUsers, totalUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            lte: nextDate,
          },
        },
      }),
    ]);

    trends.push({
      date: date.toISOString().split('T')[0],
      newUsers,
      totalUsers,
    });
  }

  return trends;
};
