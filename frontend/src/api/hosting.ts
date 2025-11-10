import { apiClient } from './client';

export interface HostingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  resources: {
    storage: string;
    bandwidth: string;
    cpu: string;
    ram: string;
  };
  popular?: boolean;
}

export const hostingApi = {
  getPlans: async () => {
    const response = await apiClient.get('/hosting');
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await apiClient.get(`/hosting/${id}`);
    return response.data;
  },
};
