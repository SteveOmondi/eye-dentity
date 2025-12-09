/**
 * Paystack Payment Controller
 * Handles payment operations using Paystack with fee calculations
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import paystackService from '../services/paystack.service';
import { generateWebsite } from '../services/website-generator.service';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '../services/email.service';
import { sendOrderNotification } from '../services/telegram.service';

/**
 * Initialize Paystack Payment
 * Creates an order and returns payment URL with fee breakdown
 */
export const initializePayment = async (req: Request, res: Response) => {
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

        // Calculate subtotal (before payment processing fees)
        const subtotal = domainPrice + hostingPrice + (emailHosting ? emailHostingPrice : 0);

        // Calculate Paystack fee (1.5% + KES 25 for local payments)
        // This is added to the customer's total
        const paystackFeePercentage = 0.015; // 1.5%
        const paystackFixedFee = 25; // KES 25
        const paystackFee = Math.round((subtotal * paystackFeePercentage + paystackFixedFee) * 100) / 100;

        // Total amount customer will pay (includes Paystack fee)
        const totalAmount = Math.round((subtotal + paystackFee) * 100) / 100;

        // Get user email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate payment reference
        const reference = paystackService.generateReference('EYE');

        // Create order in database with fee breakdown
        const order = await prisma.order.create({
            data: {
                userId,
                domain,
                domainPrice,
                hostingPlan,
                hostingPrice,
                emailHosting: emailHosting || false,
                emailHostingPrice: emailHosting ? emailHostingPrice : 0,
                totalAmount, // Total including Paystack fee
                currency: 'KES', // Kenyan Shilling
                status: 'PENDING',
                stripeSessionId: reference, // Reusing this field for Paystack reference
                metadata: {
                    ...metadata,
                    subtotal, // Amount before fees
                    paystackFee, // Payment processing fee
                    feeIncluded: true, // Flag to indicate fee is included in total
                },
            },
        });

        // Initialize Paystack transaction
        const paystackResponse = await paystackService.initializeTransaction({
            email: user.email,
            amount: totalAmount,
            reference,
            metadata: {
                orderId: order.id,
                userId,
                domain,
                hostingPlan,
                customerName: user.name,
            },
            channels: ['card', 'mobile_money', 'bank'], // Enable M-Pesa and other methods
            currency: 'KES',
        });

        res.json({
            success: true,
            orderId: order.id,
            reference,
            authorizationUrl: paystackResponse.data.authorization_url,
            accessCode: paystackResponse.data.access_code,
            pricing: {
                subtotal,
                paystackFee,
                total: totalAmount,
                currency: 'KES',
            },
        });
    } catch (error: any) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            error: 'Failed to initialize payment',
            message: error.message,
        });
    }
};

/**
 * Verify Payment
 * Called after user completes payment
 */
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({ error: 'Payment reference is required' });
        }

        // Verify transaction with Paystack
        const verification = await paystackService.verifyTransaction(reference);

        if (!verification.status) {
            return res.status(400).json({
                error: 'Payment verification failed',
                message: verification.message,
            });
        }

        // Get order from database
        const order = await prisma.order.findUnique({
            where: { stripeSessionId: reference }, // Using this field for Paystack reference
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

        // Check if payment was successful
        if (verification.data.status === 'success') {
            // Update order status
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'COMPLETED',
                    stripePaymentIntentId: verification.data.reference,
                    completedAt: new Date(),
                },
            });

            res.json({
                success: true,
                status: 'success',
                order,
                transaction: {
                    reference: verification.data.reference,
                    amount: paystackService.convertFromKobo(verification.data.amount),
                    currency: verification.data.currency,
                    channel: verification.data.channel,
                    paidAt: verification.data.paid_at,
                },
            });

            // Trigger website generation in background
            const metadata = order.metadata as any;
            if (metadata?.profileData && metadata?.templateId && metadata?.colorScheme) {
                generateWebsite({
                    userId: order.userId,
                    orderId: order.id,
                    profileData: metadata.profileData,
                    templateId: metadata.templateId,
                    colorScheme: metadata.colorScheme,
                    domain: order.domain,
                }).catch((error) => {
                    console.error(`Website generation failed for order ${order.id}:`, error);
                });
            }

            // Send notifications
            if (order.user) {
                await sendOrderConfirmationEmail(order.user.email, order.user.name || 'Customer', {
                    orderId: order.id,
                    domain: order.domain,
                    hostingPlan: order.hostingPlan,
                    totalAmount: order.totalAmount,
                });

                await sendAdminOrderNotification({
                    orderId: order.id,
                    userEmail: order.user.email,
                    domain: order.domain,
                    hostingPlan: order.hostingPlan,
                    totalAmount: order.totalAmount,
                });

                await sendOrderNotification({
                    orderId: order.id,
                    userEmail: order.user.email,
                    userName: order.user.name,
                    domain: order.domain,
                    hostingPlan: order.hostingPlan,
                    totalAmount: order.totalAmount,
                });
            }
        } else {
            // Payment failed or abandoned
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'FAILED' },
            });

            res.json({
                success: false,
                status: verification.data.status,
                message: verification.data.gateway_response,
            });
        }
    } catch (error: any) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            error: 'Failed to verify payment',
            message: error.message,
        });
    }
};

/**
 * Paystack Webhook Handler
 * Handles events from Paystack
 */
export const handlePaystackWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-paystack-signature'] as string;

        if (!signature) {
            return res.status(400).json({ error: 'Missing signature header' });
        }

        // Validate webhook signature
        const isValid = paystackService.validateWebhookSignature(signature, req.body);

        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        // Handle different event types
        switch (event.event) {
            case 'charge.success':
                await handleChargeSuccess(event.data);
                break;

            case 'charge.failed':
                await handleChargeFailed(event.data);
                break;

            case 'transfer.success':
                console.log('Transfer successful:', event.data);
                break;

            case 'transfer.failed':
                console.log('Transfer failed:', event.data);
                break;

            default:
                console.log(`Unhandled event type: ${event.event}`);
        }

        res.json({ status: 'success' });
    } catch (error: any) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

/**
 * Handle successful charge
 */
async function handleChargeSuccess(data: any) {
    const reference = data.reference;
    const metadata = data.metadata;

    console.log(`Charge successful: ${reference}`);

    if (metadata?.orderId) {
        const order = await prisma.order.findUnique({
            where: { id: metadata.orderId },
        });

        if (order && order.status === 'PENDING') {
            await prisma.order.update({
                where: { id: metadata.orderId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            console.log(`Order ${metadata.orderId} marked as completed`);
        }
    }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(data: any) {
    const reference = data.reference;
    const metadata = data.metadata;

    console.log(`Charge failed: ${reference}`);

    if (metadata?.orderId) {
        await prisma.order.update({
            where: { id: metadata.orderId },
            data: { status: 'FAILED' },
        });

        console.log(`Order ${metadata.orderId} marked as failed`);
    }
}

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
