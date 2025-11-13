import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  getAllWebsites,
  getAllOrders,
  updateUserRole,
  getPlatformAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getWebsiteAnalytics,
  getGeographyAnalytics,
  getPlanAnalytics,
  getTopWebsitesAnalytics,
  getActivityFeed,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All admin routes require authentication
// Role verification is done in each controller

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get('/stats', authenticate, getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (paginated)
 * @access  Admin only
 */
router.get('/users', authenticate, getAllUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details by ID
 * @access  Admin only
 */
router.get('/users/:userId', authenticate, getUserById);

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update user role
 * @access  Admin only
 */
router.put('/users/:userId/role', authenticate, updateUserRole);

/**
 * @route   GET /api/admin/websites
 * @desc    Get all websites (paginated, filterable)
 * @access  Admin only
 */
router.get('/websites', authenticate, getAllWebsites);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders (paginated, filterable)
 * @access  Admin only
 */
router.get('/orders', authenticate, getAllOrders);

/**
 * Enhanced Analytics Endpoints (Week 8)
 */

/**
 * @route   GET /api/admin/analytics/platform
 * @desc    Get complete platform metrics
 * @access  Admin only
 */
router.get('/analytics/platform', authenticate, getPlatformAnalytics);

/**
 * @route   GET /api/admin/analytics/users
 * @desc    Get user growth analytics
 * @access  Admin only
 */
router.get('/analytics/users', authenticate, getUserAnalytics);

/**
 * @route   GET /api/admin/analytics/revenue
 * @desc    Get revenue analytics (MRR, ARR, etc.)
 * @access  Admin only
 */
router.get('/analytics/revenue', authenticate, getRevenueAnalytics);

/**
 * @route   GET /api/admin/analytics/websites
 * @desc    Get website statistics
 * @access  Admin only
 */
router.get('/analytics/websites', authenticate, getWebsiteAnalytics);

/**
 * @route   GET /api/admin/analytics/geography
 * @desc    Get geographic distribution of users
 * @access  Admin only
 */
router.get('/analytics/geography', authenticate, getGeographyAnalytics);

/**
 * @route   GET /api/admin/analytics/plans
 * @desc    Get hosting plan distribution
 * @access  Admin only
 */
router.get('/analytics/plans', authenticate, getPlanAnalytics);

/**
 * @route   GET /api/admin/analytics/top-websites
 * @desc    Get top performing websites
 * @access  Admin only
 */
router.get('/analytics/top-websites', authenticate, getTopWebsitesAnalytics);

/**
 * @route   GET /api/admin/analytics/activity
 * @desc    Get recent activity feed
 * @access  Admin only
 */
router.get('/analytics/activity', authenticate, getActivityFeed);

export default router;
