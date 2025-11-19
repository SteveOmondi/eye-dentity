// Shared constants for Eye-Dentity platform

export const PROFESSIONS = [
  { value: 'lawyer', label: 'Lawyer', category: 'professional' },
  { value: 'consultant', label: 'Business Consultant', category: 'professional' },
  { value: 'accountant', label: 'Accountant', category: 'professional' },
  { value: 'financial-advisor', label: 'Financial Advisor', category: 'professional' },
  { value: 'real-estate-agent', label: 'Real Estate Agent', category: 'professional' },

  { value: 'doctor', label: 'Doctor', category: 'healthcare' },
  { value: 'dentist', label: 'Dentist', category: 'healthcare' },
  { value: 'therapist', label: 'Therapist', category: 'healthcare' },
  { value: 'psychologist', label: 'Psychologist', category: 'healthcare' },
  { value: 'nutritionist', label: 'Nutritionist', category: 'healthcare' },
  { value: 'chiropractor', label: 'Chiropractor', category: 'healthcare' },

  { value: 'designer', label: 'Graphic Designer', category: 'creative' },
  { value: 'photographer', label: 'Photographer', category: 'creative' },
  { value: 'artist', label: 'Artist', category: 'creative' },
  { value: 'videographer', label: 'Videographer', category: 'creative' },
  { value: 'web-developer', label: 'Web Developer', category: 'creative' },
  { value: 'content-creator', label: 'Content Creator', category: 'creative' },
  { value: 'interior-designer', label: 'Interior Designer', category: 'creative' },
];

export const TEMPLATE_CATEGORIES = [
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' },
  { value: 'healthcare', label: 'Healthcare' },
];

export const PLAN_TYPES = {
  BASIC: {
    name: 'Basic',
    price: 29.99,
    features: [
      '1 Template',
      'AI SEO',
      'Resume Export',
      '1GB Storage',
      '10GB Bandwidth',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 59.99,
    features: [
      'Multiple Templates',
      'Location-based SEO',
      'Company Profile Export',
      'Email Hosting',
      '5GB Storage',
      '50GB Bandwidth',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 99.99,
    features: [
      'All Features',
      'Marketing Automation',
      'Advanced SEO',
      'Priority Support',
      '10GB Storage',
      'Unlimited Bandwidth',
    ],
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  PROFILES: {
    CREATE: '/api/profiles',
    UPDATE: '/api/profiles',
    GET_ME: '/api/profiles/me',
    GET_BY_ID: (userId: string) => `/api/profiles/${userId}`,
  },
  TEMPLATES: {
    GET_ALL: '/api/templates',
    GET_BY_ID: (id: string) => `/api/templates/${id}`,
    GET_BY_PROFESSION: (profession: string) => `/api/templates/profession/${profession}`,
  },
  UPLOAD: {
    LOGO: '/api/upload/logo',
  },
};
