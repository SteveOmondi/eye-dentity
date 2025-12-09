import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe.js instance
 * Uses lazy loading and caching
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY is not defined');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Redirect to Stripe Checkout
 */
export const redirectToCheckout = async (sessionId: string): Promise<{ error?: string }> => {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      return { error: 'Failed to load Stripe' };
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Stripe redirect error:', error);
      return { error: error.message };
    }

    return {};
  } catch (err: any) {
    console.error('Checkout redirect error:', err);
    return { error: err.message || 'Failed to redirect to checkout' };
  }
};
