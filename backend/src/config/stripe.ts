import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'usd',
  successUrl: process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/payment/success`
    : 'http://localhost:5173/payment/success',
  cancelUrl: process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/payment/cancel`
    : 'http://localhost:5173/payment/cancel',
};
