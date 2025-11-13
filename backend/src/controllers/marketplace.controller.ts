import { Request, Response } from 'express';
import {
  getCategories,
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  toggleVerification,
  toggleFeatured,
  searchProviders,
  getFeaturedProviders,
  getProviderStats,
} from '../services/marketplace.service';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  confirmPayment,
  cancelBooking,
  getUpcomingBookings,
  getBookingStats,
  checkAvailability,
} from '../services/booking.service';
import {
  createReview,
  getProviderReviews,
  getUserReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getProviderReviewStats,
} from '../services/review.service';

/**
 * Service Categories
 */

/**
 * Get all service categories
 * GET /api/marketplace/categories
 */
export const getCategoriesController = async (_req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Service Providers
 */

/**
 * Get service providers with filters
 * GET /api/marketplace/providers
 */
export const getProvidersController = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      location,
      minRating,
      verified,
      featured,
      services,
      page = 1,
      limit = 20,
    } = req.query;

    const filters: any = {};

    if (categoryId) filters.categoryId = categoryId as string;
    if (location) filters.location = location as string;
    if (minRating) filters.minRating = parseFloat(minRating as string);
    if (verified !== undefined) filters.verified = verified === 'true';
    if (featured !== undefined) filters.featured = featured === 'true';
    if (services) filters.services = (services as string).split(',');

    const result = await getProviders(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
};

/**
 * Search providers
 * GET /api/marketplace/providers/search
 */
export const searchProvidersController = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await searchProviders(
      q as string,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({ error: 'Failed to search providers' });
  }
};

/**
 * Get featured providers
 * GET /api/marketplace/providers/featured
 */
export const getFeaturedProvidersController = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const providers = await getFeaturedProviders(parseInt(limit as string));
    res.json({ providers });
  } catch (error) {
    console.error('Get featured providers error:', error);
    res.status(500).json({ error: 'Failed to fetch featured providers' });
  }
};

/**
 * Get single provider
 * GET /api/marketplace/providers/:id
 */
export const getProviderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await getProvider(id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ provider });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
};

/**
 * Create service provider (Admin only)
 * POST /api/marketplace/providers
 */
export const createProviderController = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.categoryId || !data.name || !data.email || !data.description) {
      return res.status(400).json({
        error: 'Missing required fields: categoryId, name, email, description',
      });
    }

    const provider = await createProvider(data);
    res.status(201).json({ provider });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
};

/**
 * Update service provider (Admin only)
 * PUT /api/marketplace/providers/:id
 */
export const updateProviderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const provider = await updateProvider(id, data);
    res.json({ provider });
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ error: 'Failed to update provider' });
  }
};

/**
 * Toggle provider verification (Admin only)
 * POST /api/marketplace/providers/:id/verify
 */
export const toggleVerificationController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await toggleVerification(id);
    res.json({ provider });
  } catch (error) {
    console.error('Toggle verification error:', error);
    res.status(500).json({ error: 'Failed to toggle verification' });
  }
};

/**
 * Toggle provider featured status (Admin only)
 * POST /api/marketplace/providers/:id/feature
 */
export const toggleFeaturedController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await toggleFeatured(id);
    res.json({ provider });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};

/**
 * Get provider statistics
 * GET /api/marketplace/providers/:id/stats
 */
export const getProviderStatsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await getProviderStats(id);
    res.json(stats);
  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({ error: 'Failed to fetch provider statistics' });
  }
};

/**
 * Bookings
 */

/**
 * Create a booking
 * POST /api/marketplace/bookings
 */
export const createBookingController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { providerId, serviceType, scheduledAt, duration, price, notes } = req.body;

    if (!providerId || !serviceType || !scheduledAt || !duration || !price) {
      return res.status(400).json({
        error: 'Missing required fields: providerId, serviceType, scheduledAt, duration, price',
      });
    }

    const booking = await createBooking({
      userId,
      providerId,
      serviceType,
      scheduledAt: new Date(scheduledAt),
      duration: parseInt(duration),
      price: parseFloat(price),
      notes,
    });

    res.status(201).json({ booking });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(400).json({ error: error.message || 'Failed to create booking' });
  }
};

/**
 * Get bookings
 * GET /api/marketplace/bookings
 */
export const getBookingsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { providerId, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filters: any = {};

    // Regular users can only see their own bookings
    if (req.user?.role !== 'ADMIN') {
      filters.userId = userId;
    } else if (userId) {
      filters.userId = userId;
    }

    if (providerId) filters.providerId = providerId as string;
    if (status) filters.status = status as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await getBookings(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

/**
 * Get single booking
 * GET /api/marketplace/bookings/:id
 */
export const getBookingController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const booking = await getBooking(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    if (req.user?.role !== 'ADMIN' && booking.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

/**
 * Update booking status
 * PATCH /api/marketplace/bookings/:id/status
 */
export const updateBookingStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const booking = await updateBookingStatus(id, status, note);
    res.json({ booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

/**
 * Confirm booking payment
 * POST /api/marketplace/bookings/:id/confirm-payment
 */
export const confirmPaymentController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const booking = await confirmPayment(id, paymentIntentId);
    res.json({ booking });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    res.status(400).json({ error: error.message || 'Failed to confirm payment' });
  }
};

/**
 * Cancel booking
 * POST /api/marketplace/bookings/:id/cancel
 */
export const cancelBookingController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, refund = true } = req.body;

    const booking = await cancelBooking(id, reason, refund);
    res.json({ booking });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel booking' });
  }
};

/**
 * Get upcoming bookings
 * GET /api/marketplace/bookings/upcoming
 */
export const getUpcomingBookingsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await getUpcomingBookings(userId);
    res.json({ bookings });
  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming bookings' });
  }
};

/**
 * Get booking statistics
 * GET /api/marketplace/bookings/stats
 */
export const getBookingStatsController = async (req: Request, res: Response) => {
  try {
    const { userId, providerId, startDate, endDate } = req.query;

    const filters: any = {};
    if (userId) filters.userId = userId as string;
    if (providerId) filters.providerId = providerId as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const stats = await getBookingStats(filters);
    res.json(stats);
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Failed to fetch booking statistics' });
  }
};

/**
 * Check provider availability
 * GET /api/marketplace/providers/:id/availability
 */
export const checkAvailabilityController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const availableSlots = await checkAvailability(
      id,
      new Date(date as string),
      parseInt(duration as string)
    );

    res.json({ availableSlots });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

/**
 * Reviews
 */

/**
 * Create a review
 * POST /api/marketplace/reviews
 */
export const createReviewController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bookingId, providerId, rating, comment } = req.body;

    if (!bookingId || !providerId || !rating) {
      return res.status(400).json({
        error: 'Missing required fields: bookingId, providerId, rating',
      });
    }

    const review = await createReview({
      bookingId,
      userId,
      providerId,
      rating: parseInt(rating),
      comment,
    });

    res.status(201).json({ review });
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(400).json({ error: error.message || 'Failed to create review' });
  }
};

/**
 * Get provider reviews
 * GET /api/marketplace/providers/:id/reviews
 */
export const getProviderReviewsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await getProviderReviews(
      id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Get user reviews
 * GET /api/marketplace/reviews/my-reviews
 */
export const getUserReviewsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 20 } = req.query;

    const result = await getUserReviews(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Update review
 * PUT /api/marketplace/reviews/:id
 */
export const updateReviewController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rating, comment } = req.body;

    const review = await updateReview(id, userId, {
      rating: rating ? parseInt(rating) : undefined,
      comment,
    });

    res.json({ review });
  } catch (error: any) {
    console.error('Update review error:', error);
    res.status(400).json({ error: error.message || 'Failed to update review' });
  }
};

/**
 * Delete review
 * DELETE /api/marketplace/reviews/:id
 */
export const deleteReviewController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await deleteReview(id, userId);
    res.json(result);
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(400).json({ error: error.message || 'Failed to delete review' });
  }
};

/**
 * Mark review as helpful
 * POST /api/marketplace/reviews/:id/helpful
 */
export const markReviewHelpfulController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await markReviewHelpful(id);
    res.json({ review });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
};

/**
 * Get provider review statistics
 * GET /api/marketplace/providers/:id/reviews/stats
 */
export const getProviderReviewStatsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await getProviderReviewStats(id);
    res.json(stats);
  } catch (error) {
    console.error('Get provider review stats error:', error);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
};
