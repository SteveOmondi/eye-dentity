import { apiClient } from './client';

export interface DomainAvailability {
  domain: string;
  available: boolean;
  price?: number;
  message: string;
}

export interface DomainSuggestion {
  domain: string;
  available: boolean;
  price?: number;
}

export const domainApi = {
  checkAvailability: async (domain: string): Promise<DomainAvailability> => {
    const response = await apiClient.post('/domains/check-availability', { domain });
    return response.data;
  },

  suggestDomains: async (baseName: string) => {
    const response = await apiClient.post('/domains/suggest', { baseName });
    return response.data;
  },
};
