import { Request, Response } from 'express';
import { z } from 'zod';
import {
  validateDomain,
  checkDomainAvailability,
  generateDomainSuggestions,
} from '../utils/domain';

// Validation schemas
const checkAvailabilitySchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
});

const suggestDomainsSchema = z.object({
  baseName: z.string().min(1, 'Base name is required'),
});

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { domain } = checkAvailabilitySchema.parse(req.body);

    // Validate domain format
    const validation = validateDomain(domain);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check availability (simulated for now)
    const result = await checkDomainAvailability(domain);

    res.json({
      domain,
      available: result.available,
      price: result.price,
      message: result.available
        ? 'Domain is available!'
        : 'Domain is already taken',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Domain availability check error:', error);
    res.status(500).json({ error: 'Failed to check domain availability' });
  }
};

export const suggestDomains = async (req: Request, res: Response) => {
  try {
    const { baseName } = suggestDomainsSchema.parse(req.body);

    // Generate suggestions
    const suggestions = generateDomainSuggestions(baseName);

    // Check availability for each suggestion (in parallel)
    const results = await Promise.all(
      suggestions.map(async (domain) => {
        const availability = await checkDomainAvailability(domain);
        return {
          domain,
          available: availability.available,
          price: availability.price,
        };
      })
    );

    // Filter to only available domains and limit to 5
    const availableDomains = results.filter((r) => r.available).slice(0, 5);

    res.json({
      baseName,
      suggestions: availableDomains,
      message: `Found ${availableDomains.length} available alternatives`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Domain suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate domain suggestions' });
  }
};
