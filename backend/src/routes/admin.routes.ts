import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  getAllWebsites,
  getAllOrders,
  updateUserRole,
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

export default router;
