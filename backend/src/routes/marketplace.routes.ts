import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getCategoriesController,
  getProvidersController,
  searchProvidersController,
  getFeaturedProvidersController,
  getProviderController,
  createProviderController,
  updateProviderController,
  toggleVerificationController,
  toggleFeaturedController,
  getProviderStatsController,
  createBookingController,
  getBookingsController,
  getBookingController,
  updateBookingStatusController,
  confirmPaymentController,
  cancelBookingController,
  getUpcomingBookingsController,
  getBookingStatsController,
  checkAvailabilityController,
  createReviewController,
  getProviderReviewsController,
  getUserReviewsController,
  updateReviewController,
  deleteReviewController,
  markReviewHelpfulController,
  getProviderReviewStatsController,
} from '../controllers/marketplace.controller';

const router = Router();

// Public routes - no authentication required
router.get('/categories', getCategoriesController);
router.get('/providers', getProvidersController);
router.get('/providers/search', searchProvidersController);
router.get('/providers/featured', getFeaturedProvidersController);
router.get('/providers/:id', getProviderController);
router.get('/providers/:id/reviews', getProviderReviewsController);
router.get('/providers/:id/reviews/stats', getProviderReviewStatsController);

// Protected routes - authentication required
router.use(authenticate);

// Provider management (Admin only)
router.post('/providers', requireAdmin, createProviderController);
router.put('/providers/:id', requireAdmin, updateProviderController);
router.post('/providers/:id/verify', requireAdmin, toggleVerificationController);
router.post('/providers/:id/feature', requireAdmin, toggleFeaturedController);
router.get('/providers/:id/stats', requireAdmin, getProviderStatsController);
router.get('/providers/:id/availability', checkAvailabilityController);

// Booking routes
router.post('/bookings', createBookingController);
router.get('/bookings', getBookingsController);
router.get('/bookings/upcoming', getUpcomingBookingsController);
router.get('/bookings/stats', getBookingStatsController);
router.get('/bookings/:id', getBookingController);
router.patch('/bookings/:id/status', updateBookingStatusController);
router.post('/bookings/:id/confirm-payment', confirmPaymentController);
router.post('/bookings/:id/cancel', cancelBookingController);

// Review routes
router.post('/reviews', createReviewController);
router.get('/reviews/my-reviews', getUserReviewsController);
router.put('/reviews/:id', updateReviewController);
router.delete('/reviews/:id', deleteReviewController);
router.post('/reviews/:id/helpful', markReviewHelpfulController);

export default router;
