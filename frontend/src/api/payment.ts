import { apiClient } from './client';

export interface CreateCheckoutRequest {
  domain: string;
  domainPrice: number;
  hostingPlan: string;
  hostingPrice: number;
  emailHosting: boolean;
  emailHostingPrice?: number;
  metadata?: {
    templateId?: string;
    colorScheme?: any;
    profileData?: any;
    [key: string]: any;
  };
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  orderId: string;
}

export interface Order {
  id: string;
  userId: string;
  domain: string;
  domainPrice: number;
  hostingPlan: string;
  hostingPrice: number;
  emailHosting: boolean;
  emailHostingPrice: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CheckoutSession {
  session: {
    id: string;
    status: string;
    amountTotal: number | null;
    currency: string | null;
  };
  order: Order;
}

export const paymentApi = {
  /**
   * Create a Stripe checkout session
   */
  createCheckoutSession: async (data: CreateCheckoutRequest): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post('/payments/checkout', data);
    return response.data;
  },

  /**
   * Get checkout session details
   */
  getCheckoutSession: async (sessionId: string): Promise<CheckoutSession> => {
    const response = await apiClient.get(`/payments/session/${sessionId}`);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<{ order: Order }> => {
    const response = await apiClient.get(`/payments/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get all orders for authenticated user
   */
  getUserOrders: async (): Promise<{ orders: Order[] }> => {
    const response = await apiClient.get('/payments/orders');
    return response.data;
  },
};
