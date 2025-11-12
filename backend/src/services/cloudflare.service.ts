import axios from 'axios';

const CF_API_BASE_URL = 'https://api.cloudflare.com/client/v4';
const CF_API_KEY = process.env.CLOUDFLARE_API_KEY || '';
const CF_API_EMAIL = process.env.CLOUDFLARE_API_EMAIL || '';
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '';

// Configure axios instance for Cloudflare API
const cfApi = axios.create({
  baseURL: CF_API_BASE_URL,
  headers: {
    'X-Auth-Email': CF_API_EMAIL,
    'X-Auth-Key': CF_API_KEY,
    'Content-Type': 'application/json',
  },
});

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT' | 'MX';
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
}

export interface CloudflareResponse {
  success: boolean;
  result?: any;
  errors?: any[];
}

/**
 * Add DNS record to Cloudflare
 */
export const addDNSRecord = async (record: DNSRecord): Promise<CloudflareResponse> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    const response = await cfApi.post(`/zones/${CF_ZONE_ID}/dns_records`, {
      type: record.type,
      name: record.name,
      content: record.content,
      ttl: record.ttl || 1, // 1 = automatic
      proxied: record.proxied !== undefined ? record.proxied : true, // Enable CDN by default
    });

    console.log(`✅ DNS record created for ${record.name}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create DNS record:', error.response?.data || error.message);
    throw new Error(`Failed to create DNS record: ${error.message}`);
  }
};

/**
 * Update DNS record
 */
export const updateDNSRecord = async (
  recordId: string,
  record: Partial<DNSRecord>
): Promise<CloudflareResponse> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    const response = await cfApi.put(`/zones/${CF_ZONE_ID}/dns_records/${recordId}`, record);
    console.log(`✅ DNS record updated: ${recordId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update DNS record:', error.response?.data || error.message);
    throw new Error(`Failed to update DNS record: ${error.message}`);
  }
};

/**
 * Delete DNS record
 */
export const deleteDNSRecord = async (recordId: string): Promise<void> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    await cfApi.delete(`/zones/${CF_ZONE_ID}/dns_records/${recordId}`);
    console.log(`✅ DNS record deleted: ${recordId}`);
  } catch (error: any) {
    console.error('Failed to delete DNS record:', error.response?.data || error.message);
    throw new Error(`Failed to delete DNS record: ${error.message}`);
  }
};

/**
 * List DNS records for domain
 */
export const listDNSRecords = async (domain?: string): Promise<any[]> => {
  if (!isCloudflareConfigured()) {
    return [];
  }

  try {
    const params = domain ? { name: domain } : {};
    const response = await cfApi.get(`/zones/${CF_ZONE_ID}/dns_records`, { params });
    return response.data.result || [];
  } catch (error: any) {
    console.error('Failed to list DNS records:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Enable SSL/TLS for domain
 */
export const enableSSL = async (sslMode: 'off' | 'flexible' | 'full' | 'strict' = 'full'): Promise<void> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    await cfApi.patch(`/zones/${CF_ZONE_ID}/settings/ssl`, {
      value: sslMode,
    });
    console.log(`✅ SSL enabled with mode: ${sslMode}`);
  } catch (error: any) {
    console.error('Failed to enable SSL:', error.response?.data || error.message);
    throw new Error(`Failed to enable SSL: ${error.message}`);
  }
};

/**
 * Enable CDN (Cloudflare proxy)
 * This is done via the 'proxied' parameter when creating DNS records
 */
export const enableCDN = async (domain: string, ipAddress: string): Promise<void> => {
  // Check if DNS record exists
  const records = await listDNSRecords(domain);
  const existingRecord = records.find((r) => r.name === domain && r.type === 'A');

  if (existingRecord) {
    // Update existing record to enable proxy
    await updateDNSRecord(existingRecord.id, { proxied: true });
  } else {
    // Create new A record with proxy enabled
    await addDNSRecord({
      type: 'A',
      name: domain,
      content: ipAddress,
      proxied: true,
    });
  }

  console.log(`✅ CDN enabled for ${domain}`);
};

/**
 * Set security level
 */
export const setSecurityLevel = async (
  level: 'off' | 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack'
): Promise<void> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    await cfApi.patch(`/zones/${CF_ZONE_ID}/settings/security_level`, {
      value: level,
    });
    console.log(`✅ Security level set to: ${level}`);
  } catch (error: any) {
    console.error('Failed to set security level:', error.response?.data || error.message);
    throw new Error(`Failed to set security level: ${error.message}`);
  }
};

/**
 * Create page rule for caching
 */
export const createPageRule = async (url: string, rules: any): Promise<void> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    await cfApi.post(`/zones/${CF_ZONE_ID}/pagerules`, {
      targets: [
        {
          target: 'url',
          constraint: {
            operator: 'matches',
            value: url,
          },
        },
      ],
      actions: rules,
      priority: 1,
      status: 'active',
    });
    console.log(`✅ Page rule created for ${url}`);
  } catch (error: any) {
    console.error('Failed to create page rule:', error.response?.data || error.message);
    throw new Error(`Failed to create page rule: ${error.message}`);
  }
};

/**
 * Enable cache everything for static assets
 */
export const enableCacheOptimization = async (domain: string): Promise<void> => {
  const cacheRules = [
    {
      id: 'cache_level',
      value: 'aggressive',
    },
    {
      id: 'edge_cache_ttl',
      value: 7200, // 2 hours
    },
  ];

  await createPageRule(`*${domain}/*`, cacheRules);
  console.log(`✅ Cache optimization enabled for ${domain}`);
};

/**
 * Purge cache for domain
 */
export const purgeCache = async (domain?: string): Promise<void> => {
  if (!isCloudflareConfigured()) {
    throw new Error('Cloudflare API not configured');
  }

  try {
    const payload = domain
      ? { files: [`https://${domain}/*`] }
      : { purge_everything: true };

    await cfApi.post(`/zones/${CF_ZONE_ID}/purge_cache`, payload);
    console.log(`✅ Cache purged${domain ? ` for ${domain}` : ' (everything)'}`);
  } catch (error: any) {
    console.error('Failed to purge cache:', error.response?.data || error.message);
    throw new Error(`Failed to purge cache: ${error.message}`);
  }
};

/**
 * Setup complete Cloudflare configuration for a new website
 */
export const setupCloudflareForWebsite = async (
  domain: string,
  ipAddress: string
): Promise<void> => {
  console.log(`🔧 Setting up Cloudflare for ${domain}...`);

  try {
    // 1. Add A record with CDN enabled
    await addDNSRecord({
      type: 'A',
      name: domain,
      content: ipAddress,
      proxied: true, // Enable CDN
    });

    // 2. Add www subdomain
    await addDNSRecord({
      type: 'CNAME',
      name: `www.${domain}`,
      content: domain,
      proxied: true,
    });

    // 3. Enable SSL
    await enableSSL('full');

    // 4. Set security level to medium
    await setSecurityLevel('medium');

    // 5. Enable cache optimization
    await enableCacheOptimization(domain);

    console.log(`✅ Cloudflare setup completed for ${domain}`);
  } catch (error: any) {
    console.error(`Failed to setup Cloudflare for ${domain}:`, error.message);
    throw error;
  }
};

/**
 * Mock implementation for development
 */
export const mockSetupCloudflare = async (domain: string, ipAddress: string): Promise<void> => {
  console.log('🔧 Mock: Setting up Cloudflare');
  console.log(`   Domain: ${domain}`);
  console.log(`   IP Address: ${ipAddress}`);
  console.log('✅ Mock Cloudflare setup completed');
};

/**
 * Check if Cloudflare API is configured
 */
export const isCloudflareConfigured = (): boolean => {
  return !!(CF_API_KEY && CF_API_EMAIL && CF_ZONE_ID);
};

/**
 * Check DNS propagation status
 */
export const checkDNSPropagation = async (domain: string): Promise<boolean> => {
  // This is a simplified check
  // In production, you'd query multiple DNS servers worldwide
  try {
    const records = await listDNSRecords(domain);
    return records.length > 0;
  } catch (error) {
    return false;
  }
};
