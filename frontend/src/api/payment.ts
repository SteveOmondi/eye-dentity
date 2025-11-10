import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/payments/checkout`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get checkout session details
   */
  getCheckoutSession: async (sessionId: string): Promise<CheckoutSession> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/session/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<{ order: Order }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get all orders for authenticated user
   */
  getUserOrders: async (): Promise<{ orders: Order[] }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/payments/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
