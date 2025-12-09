/**
 * Paystack Configuration
 * Payment processor for Kenya and African markets
 */

// Initialize Paystack secret key
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecretKey) {
    console.warn('PAYSTACK_SECRET_KEY is not defined in environment variables');
}

export const PAYSTACK_CONFIG = {
    secretKey: paystackSecretKey || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    baseUrl: 'https://api.paystack.co',
    currency: 'KES', // Kenyan Shilling (can be changed to NGN, GHS, ZAR, etc.)
    callbackUrl: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/payment/callback`
        : 'http://localhost:5173/payment/callback',
    successUrl: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/payment/success`
        : 'http://localhost:5173/payment/success',
    cancelUrl: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/payment/cancel`
        : 'http://localhost:5173/payment/cancel',
};

/**
 * Paystack API Headers
 */
export const getPaystackHeaders = () => ({
    Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
    'Content-Type': 'application/json',
});

/**
 * Convert amount to kobo (Paystack uses smallest currency unit)
 * For KES: 1 KES = 100 cents
 */
export const toKobo = (amount: number): number => {
    return Math.round(amount * 100);
};

/**
 * Convert kobo back to main currency
 */
export const fromKobo = (kobo: number): number => {
    return kobo / 100;
};

/**
 * Supported payment channels in Kenya
 */
export const KENYA_PAYMENT_CHANNELS = [
    'card',           // Visa, Mastercard
    'mobile_money',   // M-Pesa
    'bank',          // Bank transfer
    'ussd',          // USSD codes
];

/**
 * Currency codes supported by Paystack
 */
export const SUPPORTED_CURRENCIES = {
    KES: 'KES', // Kenyan Shilling
    NGN: 'NGN', // Nigerian Naira
    GHS: 'GHS', // Ghanaian Cedi
    ZAR: 'ZAR', // South African Rand
    USD: 'USD', // US Dollar
};
