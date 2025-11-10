import { Router } from 'express';
import {
  createCheckoutSession,
  getCheckoutSession,
  getOrder,
  getUserOrders,
  handleStripeWebhook,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import express from 'express';

const router = Router();

/**
 * @route   POST /api/payments/checkout
 * @desc    Create Stripe checkout session
 * @access  Private
 */
router.post('/checkout', authenticate, createCheckoutSession);

/**
 * @route   GET /api/payments/session/:sessionId
 * @desc    Get checkout session details
 * @access  Private
 */
router.get('/session/:sessionId', authenticate, getCheckoutSession);

/**
 * @route   GET /api/payments/orders/:orderId
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/orders/:orderId', authenticate, getOrder);

/**
 * @route   GET /api/payments/orders
 * @desc    Get all orders for authenticated user
 * @access  Private
 */
router.get('/orders', authenticate, getUserOrders);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook endpoint
 * @access  Public (verified by Stripe signature)
 * @note    This endpoint requires raw body, not JSON parsed
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
