import { Request, Response } from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { prisma } from '../lib/prisma';
import { generateWebsite } from '../services/website-generator.service';
import Stripe from 'stripe';

/**
 * Create Stripe Checkout Session
 * This handles the initial order payment (domain + hosting + email)
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      domain,
      domainPrice,
      hostingPlan,
      hostingPrice,
      emailHosting,
      emailHostingPrice = 0,
      metadata = {}, // Store template, color scheme, profile data, etc.
    } = req.body;

    // Validation
    if (!domain || !domainPrice || !hostingPlan || !hostingPrice) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    const totalAmount = domainPrice + hostingPrice + (emailHosting ? emailHostingPrice : 0);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        domain,
        domainPrice,
        hostingPlan,
        hostingPrice,
        emailHosting: emailHosting || false,
        emailHostingPrice: emailHosting ? emailHostingPrice : 0,
        totalAmount,
        currency: STRIPE_CONFIG.currency,
        status: 'PENDING',
        metadata,
      },
    });

    // Create line items for Stripe checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: `Domain Registration - ${domain}`,
            description: `One-time domain registration fee`,
          },
          unit_amount: Math.round(domainPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: `${hostingPlan.toUpperCase()} Hosting Plan`,
            description: `Monthly hosting subscription`,
          },
          unit_amount: Math.round(hostingPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Add email hosting if selected
    if (emailHosting && emailHostingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: 'Professional Email Hosting',
            description: `Email hosting for ${domain}`,
          },
          unit_amount: Math.round(emailHostingPrice * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user?.email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

/**
 * Retrieve Stripe Checkout Session
 * Used after successful payment to get order details
 */
export const getCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (req.user?.id !== order.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({
      session: {
        id: session.id,
        status: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
      order,
    });
  } catch (error) {
    console.error('Checkout session retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve checkout session' });
  }
};

/**
 * Get order by ID
 */
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
};

/**
 * Get all orders for a user
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

/**
 * Stripe Webhook Handler
 * Handles events from Stripe (payment success, failure, etc.)
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('No orderId in session metadata');
    return;
  }

  // Get order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.error(`Order ${orderId} not found`);
    return;
  }

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'COMPLETED',
      stripePaymentIntentId: session.payment_intent as string,
      completedAt: new Date(),
    },
  });

  console.log(`Order ${orderId} marked as completed`);

  // Trigger website generation workflow
  const metadata = order.metadata as any;
  if (metadata?.profileData && metadata?.templateId && metadata?.colorScheme) {
    console.log(`Triggering website generation for order ${orderId}...`);

    generateWebsite({
      userId: order.userId,
      orderId: order.id,
      profileData: metadata.profileData,
      templateId: metadata.templateId,
      colorScheme: metadata.colorScheme,
      domain: order.domain,
    })
      .then((result) => {
        console.log(`Website generation completed for order ${orderId}:`, result);
      })
      .catch((error) => {
        console.error(`Website generation failed for order ${orderId}:`, error);
      });
  } else {
    console.warn(`Order ${orderId} missing metadata for website generation`);
  }

  // TODO: Send confirmation email
  // TODO: Create subscription record
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELED' },
  });

  console.log(`Order ${orderId} marked as canceled (session expired)`);
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} succeeded`);

  // Additional processing if needed
  // The main order update happens in checkout.session.completed
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} failed`);

  // Try to find order by payment intent ID
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED' },
    });
  }
}
