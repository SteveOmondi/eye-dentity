import { prisma } from '../lib/prisma';
import { updateProviderRating } from './marketplace.service';

/**
 * Review Service
 *
 * Manages service provider reviews and ratings
 */

export interface CreateReviewRequest {
  bookingId: string;
  userId: string;
  providerId: string;
  rating: number;
  comment?: string;
}

/**
 * Create a new review
 */
export const createReview = async (data: CreateReviewRequest) => {
  // Verify booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== data.userId) {
    throw new Error('Unauthorized - booking does not belong to user');
  }

  if (booking.providerId !== data.providerId) {
    throw new Error('Invalid provider for this booking');
  }

  if (booking.status !== 'completed') {
    throw new Error('Can only review completed bookings');
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new Error('Review already exists for this booking');
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      userId: data.userId,
      providerId: data.providerId,
      rating: data.rating,
      comment: data.comment,
      verified: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update provider rating
  await updateProviderRating(data.providerId);

  return review;
};

/**
 * Get reviews for a provider
 */
export const getProviderReviews = async (
  providerId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { providerId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get reviews by user
 */
export const getUserReviews = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single review
 */
export const getReview = async (reviewId: string) => {
  return prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      booking: {
        select: {
          id: true,
          serviceType: true,
          scheduledAt: true,
        },
      },
    },
  });
};

/**
 * Update review
 */
export const updateReview = async (
  reviewId: string,
  userId: string,
  data: { rating?: number; comment?: string }
) => {
  // Verify review belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Unauthorized - review does not belong to user');
  }

  // Validate rating if provided
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Update review
  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update provider rating if rating changed
  if (data.rating !== undefined) {
    await updateProviderRating(review.providerId);
  }

  return updated;
};

/**
 * Delete review
 */
export const deleteReview = async (reviewId: string, userId: string) => {
  // Verify review belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Unauthorized - review does not belong to user');
  }

  const providerId = review.providerId;

  // Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update provider rating
  await updateProviderRating(providerId);

  return { message: 'Review deleted successfully' };
};

/**
 * Add provider response to review
 */
export const addProviderResponse = async (
  reviewId: string,
  response: string
) => {
  return prisma.review.update({
    where: { id: reviewId },
    data: { response },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      helpful: review.helpful + 1,
    },
  });
};

/**
 * Get review statistics for a provider
 */
export const getProviderReviewStats = async (providerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { providerId },
    select: { rating: true, createdAt: true },
  });

  const total = reviews.length;
  const avgRating = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  const distribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Calculate recent trend (last 30 days vs previous 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentReviews = reviews.filter(r => r.createdAt >= thirtyDaysAgo);
  const previousReviews = reviews.filter(
    r => r.createdAt >= sixtyDaysAgo && r.createdAt < thirtyDaysAgo
  );

  const recentAvg = recentReviews.length > 0
    ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
    : 0;

  const previousAvg = previousReviews.length > 0
    ? previousReviews.reduce((sum, r) => sum + r.rating, 0) / previousReviews.length
    : 0;

  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return {
    total,
    averageRating: Math.round(avgRating * 10) / 10,
    distribution,
    trend: {
      recent: Math.round(recentAvg * 10) / 10,
      previous: Math.round(previousAvg * 10) / 10,
      change: Math.round(trend * 10) / 10,
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
    },
  };
};
