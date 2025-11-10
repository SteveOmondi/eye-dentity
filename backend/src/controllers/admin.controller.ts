import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get various statistics
    const [
      totalUsers,
      totalWebsites,
      activeWebsites,
      totalOrders,
      completedOrders,
      totalRevenue,
      recentUsers,
      recentOrders,
      websitesByStatus,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total websites
      prisma.website.count(),

      // Active websites (LIVE status)
      prisma.website.count({ where: { status: 'LIVE' } }),

      // Total orders
      prisma.order.count(),

      // Completed orders
      prisma.order.count({ where: { status: 'COMPLETED' } }),

      // Total revenue from completed orders
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),

      // Recent 5 users
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      // Recent 5 orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      // Websites grouped by status
      prisma.website.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // Calculate this month's revenue
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: firstDayOfMonth,
        },
      },
      _sum: { totalAmount: true },
    });

    res.json({
      stats: {
        totalUsers,
        totalWebsites,
        activeWebsites,
        totalOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      },
      recentUsers,
      recentOrders,
      websitesByStatus: websitesByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};

/**
 * Get all users (with pagination)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: {
            select: {
              profession: true,
              phone: true,
            },
          },
          _count: {
            select: {
              websites: true,
              orders: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

/**
 * Get user details by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        websites: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
};

/**
 * Get all websites (with pagination and filters)
 */
export const getAllWebsites = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    // Build filter
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [websites, totalCount] = await Promise.all([
      prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.website.count({ where }),
    ]);

    res.json({
      websites,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get all websites error:', error);
    res.status(500).json({ error: 'Failed to retrieve websites' });
  }
};

/**
 * Get all orders (with pagination)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    // Build filter
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

/**
 * Update user role (promote to admin, etc.)
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    // Verify admin role
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user role' });
  }
};
