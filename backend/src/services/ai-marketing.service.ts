/**
 * AI Marketing Content Generation Service
 *
 * This service uses Claude AI to generate marketing content including:
 * - Social media posts
 * - Ad copy
 * - Weekly content calendars
 * - Hashtag suggestions
 * - A/B testing variations
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface MarketingContentRequest {
  profession: string;
  businessName: string;
  industry: string;
  targetAudience?: string;
  services?: string[];
  tone?: 'professional' | 'casual' | 'inspirational';
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  postType?: 'educational' | 'promotional' | 'testimonial' | 'behind-the-scenes';
}

export interface GeneratedPost {
  content: string;
  hashtags: string[];
  callToAction?: string;
  imagePrompt?: string;
}

export interface ContentCalendar {
  week: number;
  posts: Array<{
    day: string;
    time: string;
    platform: string;
    content: string;
    hashtags: string[];
    postType: string;
  }>;
}

/**
 * Check if AI service is configured
 */
export const isAIConfigured = (): boolean => {
  return !!process.env.ANTHROPIC_API_KEY;
};

/**
 * Generate a single social media post
 */
export const generateSocialPost = async (
  request: MarketingContentRequest
): Promise<GeneratedPost> => {
  if (!isAIConfigured()) {
    console.log('⚠️  AI not configured, using mock content');
    return generateMockPost(request);
  }

  try {
    const prompt = buildPostPrompt(request);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return parsePostResponse(response, request.platform);
  } catch (error) {
    console.error('AI post generation error:', error);
    return generateMockPost(request);
  }
};

/**
 * Generate weekly content calendar
 */
export const generateContentCalendar = async (
  request: MarketingContentRequest,
  weeks: number = 1
): Promise<ContentCalendar[]> => {
  if (!isAIConfigured()) {
    console.log('⚠️  AI not configured, using mock calendar');
    return generateMockCalendar(request, weeks);
  }

  try {
    const prompt = buildCalendarPrompt(request, weeks);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return parseCalendarResponse(response, weeks);
  } catch (error) {
    console.error('AI calendar generation error:', error);
    return generateMockCalendar(request, weeks);
  }
};

/**
 * Generate hashtag suggestions
 */
export const generateHashtags = async (
  profession: string,
  industry: string,
  postContent: string,
  count: number = 10
): Promise<string[]> => {
  if (!isAIConfigured()) {
    return generateMockHashtags(profession, industry);
  }

  try {
    const prompt = `Generate ${count} relevant hashtags for a ${profession} in the ${industry} industry.

Post content: "${postContent}"

Return ONLY the hashtags, one per line, starting with #. Make them specific, relevant, and a mix of popular and niche tags.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return response
      .split('\n')
      .filter((line) => line.trim().startsWith('#'))
      .slice(0, count);
  } catch (error) {
    console.error('Hashtag generation error:', error);
    return generateMockHashtags(profession, industry);
  }
};

/**
 * Generate A/B test variations
 */
export const generateABVariations = async (
  originalPost: string,
  variations: number = 3
): Promise<string[]> => {
  if (!isAIConfigured()) {
    return generateMockVariations(originalPost, variations);
  }

  try {
    const prompt = `Generate ${variations} different variations of this social media post for A/B testing.

Original post:
"${originalPost}"

Each variation should:
1. Maintain the same core message
2. Use different wording and structure
3. Test different angles or hooks
4. Be suitable for the same platform

Return ONLY the variations, numbered 1-${variations}.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return response
      .split(/\n\d+\.\s+/)
      .filter((v) => v.trim())
      .map((v) => v.trim())
      .slice(0, variations);
  } catch (error) {
    console.error('A/B variation generation error:', error);
    return generateMockVariations(originalPost, variations);
  }
};

/**
 * Generate ad copy for paid campaigns
 */
export const generateAdCopy = async (
  request: MarketingContentRequest,
  objective: 'awareness' | 'traffic' | 'conversions'
): Promise<{
  headline: string;
  primaryText: string;
  description: string;
  callToAction: string;
}> => {
  if (!isAIConfigured()) {
    return generateMockAdCopy(request, objective);
  }

  try {
    const prompt = `Create ad copy for ${request.profession} (${request.businessName}) in the ${request.industry} industry.

Campaign objective: ${objective}
Platform: ${request.platform}
Tone: ${request.tone || 'professional'}
Target audience: ${request.targetAudience || 'general public'}
Services: ${request.services?.join(', ') || 'various services'}

Generate:
1. Headline (max 40 characters)
2. Primary text (1-2 sentences, compelling and engaging)
3. Description (1 sentence supporting detail)
4. Call to action (action-oriented phrase)

Format as JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    return parseAdCopyResponse(response);
  } catch (error) {
    console.error('Ad copy generation error:', error);
    return generateMockAdCopy(request, objective);
  }
};

/**
 * Build post generation prompt
 */
function buildPostPrompt(request: MarketingContentRequest): string {
  const platformGuidelines = {
    facebook: 'conversational, can be longer (2-3 paragraphs)',
    instagram: 'engaging, emoji-friendly, visual-focused',
    linkedin: 'professional, value-driven, industry insights',
    twitter: 'concise, witty, under 280 characters',
  };

  return `Create a ${request.platform} post for ${request.businessName}, a ${request.profession} in the ${request.industry} industry.

Post type: ${request.postType || 'promotional'}
Tone: ${request.tone || 'professional'}
Target audience: ${request.targetAudience || 'potential clients'}
Services: ${request.services?.join(', ') || 'professional services'}

Platform guidelines: ${platformGuidelines[request.platform]}

Generate:
1. Main post content
2. 5-10 relevant hashtags
3. Call-to-action
4. Image prompt (describe what image should accompany this post)

Format:
POST:
[content here]

HASHTAGS:
[hashtags here]

CTA:
[call to action]

IMAGE:
[image description]`;
}

/**
 * Build calendar generation prompt
 */
function buildCalendarPrompt(request: MarketingContentRequest, weeks: number): string {
  return `Create a ${weeks}-week content calendar for ${request.businessName}, a ${request.profession} in the ${request.industry} industry.

Platform: ${request.platform}
Posting frequency: 3-4 times per week
Mix of content types: educational, promotional, behind-the-scenes, testimonial

For each post, provide:
- Day and optimal posting time
- Content type
- Post content
- Hashtags

Format as JSON array.`;
}

/**
 * Parse post response from AI
 */
function parsePostResponse(response: string, platform: string): GeneratedPost {
  const sections = response.split(/POST:|HASHTAGS:|CTA:|IMAGE:/i);

  return {
    content: sections[1]?.trim() || 'Great content coming soon!',
    hashtags: sections[2]
      ?.split('\n')
      .filter((h) => h.trim().startsWith('#'))
      .map((h) => h.trim()) || [],
    callToAction: sections[3]?.trim(),
    imagePrompt: sections[4]?.trim(),
  };
}

/**
 * Parse calendar response from AI
 */
function parseCalendarResponse(response: string, weeks: number): ContentCalendar[] {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch {
    // Fallback to mock if parsing fails
    return generateMockCalendar({ profession: '', businessName: '', industry: '', platform: 'facebook' }, weeks);
  }
}

/**
 * Parse ad copy response
 */
function parseAdCopyResponse(response: string): {
  headline: string;
  primaryText: string;
  description: string;
  callToAction: string;
} {
  try {
    return JSON.parse(response);
  } catch {
    return {
      headline: 'Transform Your Business Today',
      primaryText: 'Discover professional services tailored to your needs.',
      description: 'Get started with a free consultation.',
      callToAction: 'Learn More',
    };
  }
}

/**
 * Generate mock post (fallback)
 */
function generateMockPost(request: MarketingContentRequest): GeneratedPost {
  const postTemplates = {
    educational: `💡 Did you know? As a ${request.profession}, I help clients achieve their goals through ${request.services?.[0] || 'expert services'}. Here's a quick tip...`,
    promotional: `🎉 Special offer! ${request.businessName} is now offering ${request.services?.[0] || 'premium services'}. Limited time only!`,
    testimonial: `⭐ "Working with ${request.businessName} was a game-changer!" - Happy Client. See what our clients are saying!`,
    'behind-the-scenes': `👋 Behind the scenes at ${request.businessName}! Here's a glimpse into how we deliver exceptional ${request.services?.[0] || 'service'}.`,
  };

  return {
    content: postTemplates[request.postType || 'promotional'],
    hashtags: generateMockHashtags(request.profession, request.industry),
    callToAction: 'Contact us today!',
    imagePrompt: `Professional image showing ${request.profession} at work in ${request.industry} setting`,
  };
}

/**
 * Generate mock hashtags
 */
function generateMockHashtags(profession: string, industry: string): string[] {
  const professionTag = profession.toLowerCase().replace(/\s+/g, '');
  const industryTag = industry.toLowerCase().replace(/\s+/g, '');

  return [
    `#${professionTag}`,
    `#${industryTag}`,
    '#smallbusiness',
    '#entrepreneur',
    '#professionalservices',
    '#businessgrowth',
    '#success',
    '#motivation',
  ];
}

/**
 * Generate mock calendar
 */
function generateMockCalendar(request: MarketingContentRequest, weeks: number): ContentCalendar[] {
  const calendars: ContentCalendar[] = [];
  const days = ['Monday', 'Wednesday', 'Friday'];
  const postTypes = ['educational', 'promotional', 'testimonial'];

  for (let week = 1; week <= weeks; week++) {
    const posts = days.map((day, index) => ({
      day,
      time: '10:00 AM',
      platform: request.platform,
      content: generateMockPost({ ...request, postType: postTypes[index] as any }).content,
      hashtags: generateMockHashtags(request.profession, request.industry),
      postType: postTypes[index],
    }));

    calendars.push({ week, posts });
  }

  return calendars;
}

/**
 * Generate mock variations
 */
function generateMockVariations(original: string, count: number): string[] {
  const variations = [
    original.replace(/\./g, '!'),
    original.split(' ').reverse().join(' '),
    `🔥 ${original}`,
  ];

  return variations.slice(0, count);
}

/**
 * Generate mock ad copy
 */
function generateMockAdCopy(
  request: MarketingContentRequest,
  objective: string
): {
  headline: string;
  primaryText: string;
  description: string;
  callToAction: string;
} {
  const objectives = {
    awareness: {
      headline: `Discover ${request.businessName}`,
      primaryText: `Professional ${request.profession} services that deliver results.`,
      description: `Trusted by clients in ${request.industry}.`,
      callToAction: 'Learn More',
    },
    traffic: {
      headline: `Visit ${request.businessName}`,
      primaryText: `Explore our ${request.services?.[0] || 'services'} and find the perfect solution.`,
      description: `Your trusted ${request.profession} partner.`,
      callToAction: 'Visit Website',
    },
    conversions: {
      headline: `Get Started Today`,
      primaryText: `Transform your business with expert ${request.profession} services.`,
      description: `Limited spots available. Book now!`,
      callToAction: 'Book Now',
    },
  };

  return objectives[objective as keyof typeof objectives];
}
