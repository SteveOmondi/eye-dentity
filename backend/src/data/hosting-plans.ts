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

export const HOSTING_PLANS: HostingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29.99,
    billingCycle: 'monthly',
    features: [
      '1 Website Template',
      'AI-Powered SEO',
      'Resume Export (PDF)',
      'SSL Certificate',
      'CDN Included',
      'Email Support',
    ],
    resources: {
      storage: '1GB SSD',
      bandwidth: '10GB/month',
      cpu: '1 vCPU',
      ram: '1GB RAM',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59.99,
    billingCycle: 'monthly',
    popular: true,
    features: [
      'Multiple Website Templates',
      'Location-Based SEO',
      'Company Profile Export',
      'Professional Email Hosting',
      'SSL Certificate',
      'CDN Included',
      'Priority Support',
      'Custom Domain Mapping',
    ],
    resources: {
      storage: '5GB SSD',
      bandwidth: '50GB/month',
      cpu: '2 vCPU',
      ram: '2GB RAM',
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    billingCycle: 'monthly',
    features: [
      'All Templates & Features',
      'AI Marketing Automation',
      'Advanced SEO Analytics',
      'Professional Email Hosting',
      'Blog Generator',
      'Social Media Integration',
      'SSL Certificate',
      'CDN Included',
      '24/7 Priority Support',
      'White Label Options',
    ],
    resources: {
      storage: '10GB SSD',
      bandwidth: 'Unlimited',
      cpu: '4 vCPU',
      ram: '4GB RAM',
    },
  },
];
