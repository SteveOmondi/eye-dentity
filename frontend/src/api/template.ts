import { apiClient } from './client';

export const templateApi = {
  getAll: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await apiClient.get('/templates', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },

  getByProfession: async (profession: string) => {
    const response = await apiClient.get(`/templates/profession/${profession}`);
    return response.data;
  },
};
