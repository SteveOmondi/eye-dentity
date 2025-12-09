import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
  getOrder,
  getUserOrders,
} from '../controllers/paystack-payment.controller';
import express from 'express';

const router = Router();

/**
 * Initialize payment (create order and get payment URL)
 * POST /api/payments/initialize
 */
router.post('/initialize', authenticate, initializePayment);

/**
 * Verify payment after user completes payment
 * GET /api/payments/verify/:reference
 */
router.get('/verify/:reference', verifyPayment);

/**
 * Paystack webhook endpoint
 * POST /api/payments/webhook
 * Note: This endpoint should NOT use authenticate middleware
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // Paystack sends raw JSON
  handlePaystackWebhook
);

/**
 * Get order by ID
 * GET /api/payments/order/:orderId
 */
router.get('/order/:orderId', authenticate, getOrder);

/**
 * Get all orders for authenticated user
 * GET /api/payments/orders
 */
router.get('/orders', authenticate, getUserOrders);

export default router;
