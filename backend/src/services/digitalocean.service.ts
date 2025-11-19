import axios from 'axios';

const DO_API_BASE_URL = 'https://api.digitalocean.com/v2';
const DO_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN || '';

// Configure axios instance for DigitalOcean API
const doApi = axios.create({
  baseURL: DO_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${DO_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface DropletConfig {
  name: string;
  region: string;
  size: string;
  image: string;
  tags?: string[];
}

export interface Droplet {
  id: number;
  name: string;
  status: string;
  created_at: string;
  memory: number;
  vcpus: number;
  disk: number;
  region: {
    name: string;
    slug: string;
  };
  networks: {
    v4: Array<{
      ip_address: string;
      netmask: string;
      gateway: string;
      type: string;
    }>;
  };
}

/**
 * Create a new DigitalOcean droplet
 */
export const createDroplet = async (config: DropletConfig): Promise<Droplet> => {
  if (!DO_API_TOKEN) {
    throw new Error('DigitalOcean API token not configured');
  }

  try {
    const response = await doApi.post('/droplets', {
      name: config.name,
      region: config.region || 'nyc3',
      size: config.size || 's-1vcpu-1gb', // Basic plan
      image: config.image || 'ubuntu-22-04-x64',
      ssh_keys: [], // Add SSH keys if needed
      backups: false,
      ipv6: true,
      monitoring: true,
      tags: config.tags || ['eye-dentity', 'website'],
    });

    return response.data.droplet;
  } catch (error: any) {
    console.error('Failed to create droplet:', error.response?.data || error.message);
    throw new Error(`Failed to create droplet: ${error.message}`);
  }
};

/**
 * Get droplet status
 */
export const getDropletStatus = async (dropletId: number): Promise<string> => {
  if (!DO_API_TOKEN) {
    return 'api_not_configured';
  }

  try {
    const response = await doApi.get(`/droplets/${dropletId}`);
    return response.data.droplet.status;
  } catch (error: any) {
    console.error('Failed to get droplet status:', error.response?.data || error.message);
    throw new Error(`Failed to get droplet status: ${error.message}`);
  }
};

/**
 * Get droplet details
 */
export const getDroplet = async (dropletId: number): Promise<Droplet> => {
  if (!DO_API_TOKEN) {
    throw new Error('DigitalOcean API token not configured');
  }

  try {
    const response = await doApi.get(`/droplets/${dropletId}`);
    return response.data.droplet;
  } catch (error: any) {
    console.error('Failed to get droplet:', error.response?.data || error.message);
    throw new Error(`Failed to get droplet: ${error.message}`);
  }
};

/**
 * Delete droplet
 */
export const deleteDroplet = async (dropletId: number): Promise<void> => {
  if (!DO_API_TOKEN) {
    throw new Error('DigitalOcean API token not configured');
  }

  try {
    await doApi.delete(`/droplets/${dropletId}`);
    console.log(`Droplet ${dropletId} deleted successfully`);
  } catch (error: any) {
    console.error('Failed to delete droplet:', error.response?.data || error.message);
    throw new Error(`Failed to delete droplet: ${error.message}`);
  }
};

/**
 * List all droplets
 */
export const listDroplets = async (): Promise<Droplet[]> => {
  if (!DO_API_TOKEN) {
    return [];
  }

  try {
    const response = await doApi.get('/droplets');
    return response.data.droplets;
  } catch (error: any) {
    console.error('Failed to list droplets:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get droplet size recommendations based on hosting plan
 */
export const getDropletSize = (hostingPlan: string): string => {
  const sizeMap: { [key: string]: string } = {
    basic: 's-1vcpu-1gb',      // $6/month - 1GB RAM, 1 vCPU, 25GB SSD
    pro: 's-2vcpu-2gb',        // $18/month - 2GB RAM, 2 vCPUs, 60GB SSD
    premium: 's-4vcpu-8gb',    // $48/month - 8GB RAM, 4 vCPUs, 160GB SSD
  };

  return sizeMap[hostingPlan.toLowerCase()] || 's-1vcpu-1gb';
};

/**
 * Wait for droplet to be active
 */
export const waitForDropletActive = async (
  dropletId: number,
  maxWaitTime: number = 300000, // 5 minutes
  pollInterval: number = 5000 // 5 seconds
): Promise<Droplet> => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getDropletStatus(dropletId);

    if (status === 'active') {
      return await getDroplet(dropletId);
    }

    if (status === 'error') {
      throw new Error('Droplet entered error state');
    }

    console.log(`Waiting for droplet ${dropletId} to become active... (status: ${status})`);
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error('Timeout waiting for droplet to become active');
};

/**
 * Create floating IP and assign to droplet (for static IP)
 */
export const assignFloatingIP = async (dropletId: number): Promise<string> => {
  if (!DO_API_TOKEN) {
    throw new Error('DigitalOcean API token not configured');
  }

  try {
    // Create floating IP
    const createResponse = await doApi.post('/floating_ips', {
      type: 'assign',
      droplet_id: dropletId,
    });

    const floatingIP = createResponse.data.floating_ip.ip;
    console.log(`Floating IP ${floatingIP} assigned to droplet ${dropletId}`);

    return floatingIP;
  } catch (error: any) {
    console.error('Failed to assign floating IP:', error.response?.data || error.message);
    throw new Error(`Failed to assign floating IP: ${error.message}`);
  }
};

/**
 * Mock implementation for development (when API token not available)
 */
export const mockCreateDroplet = async (config: DropletConfig): Promise<any> => {
  console.log('🔧 Mock: Creating droplet with config:', config);

  // Simulate droplet creation
  const mockDroplet = {
    id: Math.floor(Math.random() * 1000000),
    name: config.name,
    status: 'active',
    created_at: new Date().toISOString(),
    memory: 1024,
    vcpus: 1,
    disk: 25,
    region: {
      name: 'New York 3',
      slug: config.region || 'nyc3',
    },
    networks: {
      v4: [
        {
          ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          netmask: '255.255.255.0',
          gateway: '192.168.1.1',
          type: 'public',
        },
      ],
    },
  };

  console.log('✅ Mock droplet created:', mockDroplet);
  return mockDroplet;
};

/**
 * Check if DigitalOcean API is configured
 */
export const isDigitalOceanConfigured = (): boolean => {
  return !!DO_API_TOKEN && DO_API_TOKEN.length > 0;
};
