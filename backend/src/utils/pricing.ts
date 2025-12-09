/**
 * Pricing Calculator for Eye-Dentity
 * Calculates total costs including Paystack fees
 */

export interface PricingBreakdown {
    subtotal: number;
    paystackFee: number;
    total: number;
    currency: string;
}

export interface OrderPricing {
    domainPrice: number;
    hostingPrice: number;
    emailHostingPrice?: number;
}

/**
 * Paystack fee structure for Kenya
 */
const PAYSTACK_FEES = {
    LOCAL_PERCENTAGE: 0.015, // 1.5%
    LOCAL_FIXED: 25, // KES 25
    INTERNATIONAL_PERCENTAGE: 0.039, // 3.9%
    INTERNATIONAL_FIXED: 100, // KES 100
};

/**
 * Calculate Paystack fee for local transactions (M-Pesa, Kenyan cards)
 */
export function calculateLocalPaystackFee(amount: number): number {
    const percentageFee = amount * PAYSTACK_FEES.LOCAL_PERCENTAGE;
    const totalFee = percentageFee + PAYSTACK_FEES.LOCAL_FIXED;
    return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate Paystack fee for international cards
 */
export function calculateInternationalPaystackFee(amount: number): number {
    const percentageFee = amount * PAYSTACK_FEES.INTERNATIONAL_PERCENTAGE;
    const totalFee = percentageFee + PAYSTACK_FEES.INTERNATIONAL_FIXED;
    return Math.round(totalFee * 100) / 100;
}

/**
 * Calculate total pricing with Paystack fees included
 * Default to local fees (M-Pesa/Kenyan cards) as most customers will use these
 */
export function calculateTotalPricing(
    pricing: OrderPricing,
    useInternationalFees: boolean = false
): PricingBreakdown {
    // Calculate subtotal
    const subtotal =
        pricing.domainPrice +
        pricing.hostingPrice +
        (pricing.emailHostingPrice || 0);

    // Calculate Paystack fee
    const paystackFee = useInternationalFees
        ? calculateInternationalPaystackFee(subtotal)
        : calculateLocalPaystackFee(subtotal);

    // Calculate total (subtotal + fees)
    const total = subtotal + paystackFee;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        paystackFee: Math.round(paystackFee * 100) / 100,
        total: Math.round(total * 100) / 100,
        currency: 'KES',
    };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'KES'): string {
    return `${currency} ${amount.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Get pricing breakdown for display
 */
export function getPricingBreakdown(
    pricing: OrderPricing,
    useInternationalFees: boolean = false
): {
    items: Array<{ label: string; amount: number }>;
    subtotal: number;
    fees: Array<{ label: string; amount: number }>;
    total: number;
    currency: string;
} {
    const breakdown = calculateTotalPricing(pricing, useInternationalFees);

    const items = [
        { label: 'Domain Registration', amount: pricing.domainPrice },
        { label: 'Hosting Plan', amount: pricing.hostingPrice },
    ];

    if (pricing.emailHostingPrice && pricing.emailHostingPrice > 0) {
        items.push({ label: 'Email Hosting', amount: pricing.emailHostingPrice });
    }

    const fees = [
        {
            label: useInternationalFees
                ? 'Payment Processing Fee (International Card)'
                : 'Payment Processing Fee (M-Pesa/Local Card)',
            amount: breakdown.paystackFee,
        },
    ];

    return {
        items,
        subtotal: breakdown.subtotal,
        fees,
        total: breakdown.total,
        currency: breakdown.currency,
    };
}

/**
 * Example pricing for different plans
 */
export const HOSTING_PLANS = {
    basic: {
        name: 'Basic',
        price: 2999, // KES 2,999/month
        features: [
            '1 professional template',
            'AI-powered SEO',
            'Resume export',
            '1GB storage',
            '10GB bandwidth',
            'SSL certificate',
        ],
    },
    pro: {
        name: 'Pro',
        price: 5999, // KES 5,999/month
        features: [
            'Multiple templates',
            'Location-based SEO',
            'Company profile export',
            'Email hosting (5 accounts)',
            '5GB storage',
            '50GB bandwidth',
            'Priority support',
        ],
    },
    premium: {
        name: 'Premium',
        price: 9999, // KES 9,999/month
        features: [
            'All Pro features',
            'Marketing automation',
            'Advanced SEO',
            'Unlimited email accounts',
            '10GB storage',
            'Unlimited bandwidth',
            'Dedicated support',
        ],
    },
};

export const DOMAIN_PRICING = {
    '.com': 1299, // KES 1,299/year
    '.co.ke': 999, // KES 999/year
    '.ke': 1499, // KES 1,499/year
    '.net': 1499, // KES 1,499/year
    '.org': 1299, // KES 1,299/year
};

export const EMAIL_HOSTING_PRICE = 1000; // KES 1,000/month
