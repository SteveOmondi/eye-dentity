import { prisma } from '../lib/prisma';

/**
 * Marketplace Service
 *
 * Manages service provider marketplace - connecting users with professional
 * services like photographers, copywriters, SEO experts, designers, etc.
 */

export interface ServiceProviderFilters {
  categoryId?: string;
  location?: string;
  minRating?: number;
  verified?: boolean;
  featured?: boolean;
  priceRange?: { min: number; max: number };
  services?: string[];
}

export interface CreateProviderRequest {
  categoryId: string;
  name: string;
  email: string;
  phone?: string;
  description: string;
  services: string[];
  pricing: any;
  location?: string;
  website?: string;
  portfolio?: string[];
}

/**
 * Initialize service categories
 */
export const initializeCategories = async (): Promise<void> => {
  const categories = [
    {
      name: 'photography',
      description: 'Professional photography services for headshots, portfolio, and business',
      icon: 'camera',
    },
    {
      name: 'copywriting',
      description: 'Professional content writing and copywriting services',
      icon: 'pen',
    },
    {
      name: 'seo',
      description: 'Search engine optimization and digital marketing experts',
      icon: 'search',
    },
    {
      name: 'web_design',
      description: 'Custom web design and branding services',
      icon: 'palette',
    },
    {
      name: 'social_media',
      description: 'Social media management and content creation',
      icon: 'share',
    },
    {
      name: 'video_production',
      description: 'Video production and editing services',
      icon: 'video',
    },
    {
      name: 'graphic_design',
      description: 'Logo design, branding, and graphic design services',
      icon: 'brush',
    },
  ];

  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
};

/**
 * Get all service categories
 */
export const getCategories = async () => {
  return prisma.serviceCategory.findMany({
    include: {
      _count: {
        select: { providers: true },
      },
    },
    orderBy: { name: 'asc' },
  });
};

/**
 * Get service providers with filters
 */
export const getProviders = async (
  filters: ServiceProviderFilters = {},
  page: number = 1,
  limit: number = 20
) => {
  const where: any = {
    status: 'active',
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: 'insensitive',
    };
  }

  if (filters.minRating !== undefined) {
    where.rating = {
      gte: filters.minRating,
    };
  }

  if (filters.verified !== undefined) {
    where.verified = filters.verified;
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  if (filters.services && filters.services.length > 0) {
    where.services = {
      hasSome: filters.services,
    };
  }

  const skip = (page - 1) * limit;

  const [providers, total] = await Promise.all([
    prisma.serviceProvider.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.serviceProvider.count({ where }),
  ]);

  return {
    providers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single provider by ID
 */
export const getProvider = async (providerId: string) => {
  return prisma.serviceProvider.findUnique({
    where: { id: providerId },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
};

/**
 * Create a new service provider (Admin only)
 */
export const createProvider = async (data: CreateProviderRequest) => {
  return prisma.serviceProvider.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      description: data.description,
      services: data.services,
      pricing: data.pricing,
      location: data.location,
      website: data.website,
      portfolio: data.portfolio || [],
      verified: false,
      featured: false,
    },
    include: {
      category: true,
    },
  });
};

/**
 * Update service provider
 */
export const updateProvider = async (
  providerId: string,
  data: Partial<CreateProviderRequest>
) => {
  return prisma.serviceProvider.update({
    where: { id: providerId },
    data,
    include: {
      category: true,
    },
  });
};

/**
 * Toggle provider verification status
 */
export const toggleVerification = async (providerId: string) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  return prisma.serviceProvider.update({
    where: { id: providerId },
    data: { verified: !provider.verified },
  });
};

/**
 * Toggle provider featured status
 */
export const toggleFeatured = async (providerId: string) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  return prisma.serviceProvider.update({
    where: { id: providerId },
    data: { featured: !provider.featured },
  });
};

/**
 * Update provider rating after a review
 */
export const updateProviderRating = async (providerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { providerId },
    select: { rating: true },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    },
  });
};

/**
 * Search providers by text
 */
export const searchProviders = async (
  query: string,
  page: number = 1,
  limit: number = 20
) => {
  const where = {
    status: 'active',
    OR: [
      { name: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
      { services: { hasSome: [query] } },
    ],
  };

  const skip = (page - 1) * limit;

  const [providers, total] = await Promise.all([
    prisma.serviceProvider.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.serviceProvider.count({ where }),
  ]);

  return {
    providers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get featured providers
 */
export const getFeaturedProviders = async (limit: number = 6) => {
  return prisma.serviceProvider.findMany({
    where: {
      status: 'active',
      featured: true,
      verified: true,
    },
    include: {
      category: true,
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
    ],
    take: limit,
  });
};

/**
 * Get provider statistics
 */
export const getProviderStats = async (providerId: string) => {
  const [provider, bookings, reviews] = await Promise.all([
    prisma.serviceProvider.findUnique({
      where: { id: providerId },
    }),
    prisma.booking.findMany({
      where: { providerId },
    }),
    prisma.review.findMany({
      where: { providerId },
    }),
  ]);

  if (!provider) {
    throw new Error('Provider not found');
  }

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.price, 0);

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return {
    provider,
    stats: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      totalRevenue,
      averageBookingValue: completedBookings > 0 ? totalRevenue / completedBookings : 0,
      totalReviews: reviews.length,
      averageRating: provider.rating,
      ratingDistribution,
    },
  };
};
