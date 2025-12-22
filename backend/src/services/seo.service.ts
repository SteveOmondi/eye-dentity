/**
 * Advanced SEO Service
 *
 * Provides location-based and industry-specific SEO optimization
 * including meta tags, schema markup, and content optimization.
 */

export interface SEOOptimizationRequest {
  profession: string;
  businessName: string;
  location: string;
  services: string[];
  industry: string;
  targetKeywords?: string[];
}

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
}

export interface SchemaMarkup {
  type: string;
  data: Record<string, any>;
}

/**
 * Generate SEO-optimized meta tags
 */
export const generateMetaTags = async (
  request: SEOOptimizationRequest
): Promise<SEOMetaTags> => {
  const locationKeyword = request.location ? ` in ${request.location}` : '';

  return {
    title: `${request.businessName} - ${request.profession}${locationKeyword} | Expert Services`,
    description: `Professional ${request.profession.toLowerCase()} services${locationKeyword}. ${request.services.slice(0, 3).join(', ')}. Contact us for expert assistance.`,
    keywords: [
      request.profession.toLowerCase(),
      ...request.services.map(s => s.toLowerCase()),
      request.location.toLowerCase(),
      `${request.profession.toLowerCase()} near me`,
      `best ${request.profession.toLowerCase()}`,
    ],
    ogTitle: `${request.businessName} - Your Trusted ${request.profession}${locationKeyword}`,
    ogDescription: `Expert ${request.profession.toLowerCase()} services. ${request.services[0]} and more. Serving ${request.location}.`,
  };
};

/**
 * Generate Schema.org markup for local business
 */
export const generateSchemaMarkup = (
  request: SEOOptimizationRequest
): SchemaMarkup[] => {
  const schemas: SchemaMarkup[] = [];

  // LocalBusiness schema
  schemas.push({
    type: 'LocalBusiness',
    data: {
      '@context': 'https://schema.org',
      '@type': getBusinessType(request.profession),
      'name': request.businessName,
      'description': `Professional ${request.profession} services in ${request.location}`,
      'url': `https://${request.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      'telephone': '+1-555-0100',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': request.location,
        'addressCountry': 'US',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '0.0',
        'longitude': '0.0',
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '17:00',
      },
      'priceRange': '$$',
    },
  });

  // Service schema for each service offered
  request.services.slice(0, 3).forEach(service => {
    schemas.push({
      type: 'Service',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'serviceType': service,
        'provider': {
          '@type': 'Organization',
          'name': request.businessName,
        },
        'areaServed': {
          '@type': 'City',
          'name': request.location,
        },
      },
    });
  });

  return schemas;
};

/**
 * Generate location-specific content
 */
export const generateLocationContent = async (
  request: SEOOptimizationRequest
): Promise<{
  headline: string;
  content: string;
  localKeywords: string[];
}> => {
  const localKeywords = [
    `${request.profession} in ${request.location}`,
    `${request.location} ${request.profession}`,
    `${request.profession} near ${request.location}`,
    `best ${request.profession} ${request.location}`,
    `${request.location} ${request.services[0]}`,
  ];

  return {
    headline: `Expert ${request.profession} Services in ${request.location}`,
    content: `Welcome to ${request.businessName}, your trusted ${request.profession.toLowerCase()} serving ${request.location} and surrounding areas. We specialize in ${request.services.join(', ')}. Our experienced team is dedicated to providing exceptional service to the ${request.location} community.`,
    localKeywords,
  };
};

/**
 * Get business type for Schema.org
 */
function getBusinessType(profession: string): string {
  const typeMap: Record<string, string> = {
    'lawyer': 'Attorney',
    'dentist': 'Dentist',
    'doctor': 'Physician',
    'accountant': 'AccountingService',
    'consultant': 'ProfessionalService',
    'therapist': 'MedicalBusiness',
    'plumber': 'Plumber',
    'electrician': 'Electrician',
  };

  return typeMap[profession.toLowerCase()] || 'ProfessionalService';
}

/**
 * Analyze and suggest SEO improvements
 */
export const analyzeSEO = async (
  websiteContent: string,
  targetKeywords: string[]
): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check keyword density
  const keywordDensity = targetKeywords.map(keyword => {
    const count = (websiteContent.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const words = websiteContent.split(/\s+/).length;
    return { keyword, density: (count / words) * 100 };
  });

  keywordDensity.forEach(kd => {
    if (kd.density < 0.5) {
      issues.push(`Low keyword density for "${kd.keyword}" (${kd.density.toFixed(2)}%)`);
      recommendations.push(`Increase usage of "${kd.keyword}" throughout the content`);
    } else if (kd.density > 3) {
      issues.push(`Keyword stuffing detected for "${kd.keyword}" (${kd.density.toFixed(2)}%)`);
      recommendations.push(`Reduce usage of "${kd.keyword}" to avoid penalties`);
    }
  });

  // Calculate score
  let score = 100;
  score -= issues.length * 10;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues,
    recommendations,
  };
};
