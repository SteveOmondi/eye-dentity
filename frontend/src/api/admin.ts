import { apiClient } from './client';
// import axios from 'axios';

export interface DashboardStats {
  totalUsers: number;
  totalWebsites: number;
  activeWebsites: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export interface RecentOrder {
  id: string;
  domain: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface WebsiteStatus {
  status: string;
  count: number;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  recentUsers: RecentUser[];
  recentOrders: RecentOrder[];
  websitesByStatus: WebsiteStatus[];
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    profession: string;
    phone: string | null;
  };
  _count?: {
    websites: number;
    orders: number;
  };
}

export interface Website {
  id: string;
  domain: string;
  status: string;
  createdAt: string;
  deploymentUrl: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  template: {
    id: string;
    name: string;
    category: string;
  };
}

export interface Order {
  id: string;
  domain: string;
  domainPrice: number;
  hostingPlan: string;
  hostingPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export const adminApi = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  /**
   * Get all users (paginated)
   */
  getUsers: async (page: number = 1, limit: number = 20): Promise<{ users: User[]; pagination: any }> => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<{ user: User }> => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN'): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Get all websites (paginated, filterable)
   */
  getWebsites: async (page: number = 1, limit: number = 20, status?: string): Promise<{ websites: Website[]; pagination: any }> => {
    const params: any = { page, limit };
    if (status) params.status = status;

    const response = await apiClient.get('/admin/websites', { params });
    return response.data;
  },

  /**
   * Get all orders (paginated, filterable)
   */
  getOrders: async (page: number = 1, limit: number = 20, status?: string): Promise<{ orders: Order[]; pagination: any }> => {
    const params: any = { page, limit };
    if (status) params.status = status;

    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },
};
