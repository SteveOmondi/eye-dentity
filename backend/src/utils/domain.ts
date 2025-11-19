// Domain validation and suggestion utilities

export const validateDomain = (domain: string): { valid: boolean; error?: string } => {
  // Remove protocol if present
  const cleanDomain = domain.replace(/^https?:\/\//, '').trim().toLowerCase();

  // Check if empty
  if (!cleanDomain) {
    return { valid: false, error: 'Domain name is required' };
  }

  // Check length (min 3, max 63 characters per label, max 253 total)
  if (cleanDomain.length < 3 || cleanDomain.length > 253) {
    return { valid: false, error: 'Domain must be between 3 and 253 characters' };
  }

  // Regex for valid domain format
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

  if (!domainRegex.test(cleanDomain)) {
    return { valid: false, error: 'Invalid domain format. Use letters, numbers, and hyphens only' };
  }

  // Check for valid TLD
  const tld = cleanDomain.split('.').pop();
  if (tld && tld.length < 2) {
    return { valid: false, error: 'Invalid top-level domain' };
  }

  return { valid: true };
};

export const generateDomainSuggestions = (baseName: string): string[] => {
  // Clean the base name
  const clean = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');

  const suggestions: string[] = [];

  // Common TLDs to suggest
  const tlds = ['.com', '.net', '.io', '.co', '.org', '.app', '.dev'];

  // Strategy 1: Different TLDs
  tlds.forEach((tld) => {
    if (!baseName.includes(tld)) {
      suggestions.push(`${clean}${tld}`);
    }
  });

  // Strategy 2: Add prefixes
  const prefixes = ['my', 'get', 'try', 'use', 'go'];
  prefixes.forEach((prefix) => {
    suggestions.push(`${prefix}${clean}.com`);
  });

  // Strategy 3: Add suffixes
  const suffixes = ['hq', 'hub', 'pro', 'site', 'online'];
  suffixes.forEach((suffix) => {
    suggestions.push(`${clean}${suffix}.com`);
  });

  // Strategy 4: Numbers
  suggestions.push(`${clean}247.com`);
  suggestions.push(`${clean}365.com`);

  // Remove duplicates and limit to 10
  return [...new Set(suggestions)].slice(0, 10);
};

export const extractDomainParts = (domain: string): { name: string; tld: string } => {
  const cleanDomain = domain.replace(/^https?:\/\//, '').trim().toLowerCase();
  const parts = cleanDomain.split('.');
  const tld = parts.slice(-1)[0];
  const name = parts.slice(0, -1).join('.');
  return { name, tld };
};

// Simulated domain availability check
// In production, this would call a domain registrar API (Cloudflare, GoDaddy, etc.)
export const checkDomainAvailability = async (
  domain: string
): Promise<{ available: boolean; price?: number; error?: string }> => {
  // Validate domain format first
  const validation = validateDomain(domain);
  if (!validation.valid) {
    return { available: false, error: validation.error };
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For demo purposes, simulate availability based on domain length and TLD
  const { name, tld } = extractDomainParts(domain);

  // Very short names (< 5 chars) are usually taken
  if (name.length < 5) {
    return { available: false };
  }

  // Common TLDs with common names are usually taken
  const commonTlds = ['com', 'net', 'org'];
  if (commonTlds.includes(tld) && name.length < 8) {
    return { available: false };
  }

  // Simulate pricing based on TLD
  const pricing: Record<string, number> = {
    com: 12.99,
    net: 11.99,
    org: 10.99,
    io: 34.99,
    co: 24.99,
    app: 14.99,
    dev: 14.99,
  };

  const price = pricing[tld] || 15.99;

  // Simulate random availability (70% available for demo)
  const available = Math.random() > 0.3;

  return { available, price: available ? price : undefined };
};
