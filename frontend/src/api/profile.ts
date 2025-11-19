import { apiClient } from './client';

export interface ProfileData {
  profession: string;
  bio?: string;
  phone?: string;
  logoUrl?: string;
  services?: string[];
  metadata?: Record<string, any>;
}

export const profileApi = {
  create: async (data: ProfileData) => {
    const response = await apiClient.post('/profiles', data);
    return response.data;
  },

  update: async (data: ProfileData) => {
    const response = await apiClient.put('/profiles', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/profiles/me');
    return response.data;
  },

  getById: async (userId: string) => {
    const response = await apiClient.get(`/profiles/${userId}`);
    return response.data;
  },
};
