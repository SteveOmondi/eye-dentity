/**
 * Paystack Service
 * Handles all Paystack payment operations
 */

import axios from 'axios';
import { PAYSTACK_CONFIG, getPaystackHeaders, toKobo, fromKobo } from '../config/paystack';

export interface PaystackInitializeData {
    email: string;
    amount: number; // In main currency (KES, NGN, etc.)
    reference?: string;
    metadata?: Record<string, any>;
    channels?: string[];
    currency?: string;
}

export interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        status: 'success' | 'failed' | 'abandoned';
        reference: string;
        amount: number;
        message: string | null;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: Record<string, any>;
        fees: number;
        customer: {
            id: number;
            email: string;
            customer_code: string;
        };
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            channel: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
        };
    };
}

export class PaystackService {
    private baseUrl = PAYSTACK_CONFIG.baseUrl;
    private headers = getPaystackHeaders();

    /**
     * Initialize a payment transaction
     */
    async initializeTransaction(data: PaystackInitializeData): Promise<PaystackInitializeResponse> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/transaction/initialize`,
                {
                    email: data.email,
                    amount: toKobo(data.amount), // Convert to kobo
                    reference: data.reference,
                    metadata: data.metadata,
                    channels: data.channels || ['card', 'mobile_money', 'bank'],
                    currency: data.currency || PAYSTACK_CONFIG.currency,
                    callback_url: PAYSTACK_CONFIG.callbackUrl,
                },
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error('Paystack initialization error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initialize payment');
        }
    }

    /**
     * Verify a transaction
     */
    async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transaction/verify/${reference}`,
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error('Paystack verification error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify payment');
        }
    }

    /**
     * Get transaction details
     */
    async getTransaction(id: number): Promise<PaystackVerifyResponse> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transaction/${id}`,
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error('Paystack get transaction error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to get transaction');
        }
    }

    /**
     * List transactions
     */
    async listTransactions(params?: {
        perPage?: number;
        page?: number;
        customer?: string;
        status?: 'success' | 'failed' | 'abandoned';
        from?: string;
        to?: string;
    }) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transaction`,
                {
                    headers: this.headers,
                    params,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Paystack list transactions error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to list transactions');
        }
    }

    /**
     * Create a customer
     */
    async createCustomer(email: string, firstName?: string, lastName?: string) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/customer`,
                {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                },
                { headers: this.headers }
            );

            return response.data;
        } catch (error: any) {
            console.error('Paystack create customer error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create customer');
        }
    }

    /**
     * Generate payment reference
     */
    generateReference(prefix: string = 'EYE'): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Validate webhook signature
     */
    validateWebhookSignature(signature: string, body: string): boolean {
        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha512', PAYSTACK_CONFIG.secretKey)
            .update(JSON.stringify(body))
            .digest('hex');

        return hash === signature;
    }

    /**
     * Convert amount from kobo to main currency
     */
    convertFromKobo(amount: number): number {
        return fromKobo(amount);
    }

    /**
     * Convert amount to kobo
     */
    convertToKobo(amount: number): number {
        return toKobo(amount);
    }
}

export default new PaystackService();
