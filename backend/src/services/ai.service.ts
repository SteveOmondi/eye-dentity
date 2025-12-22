import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
// Helper to get Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
  return new Anthropic({ apiKey });
};

// Helper to get OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey });
};

// Helper to get Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenerativeAI(apiKey);
};

export interface ProfileData {
  name: string;
  email: string;
  profession: string;
  bio?: string;
  phone?: string;
  services?: string[];
  logoUrl?: string;
  profilePhotoUrl?: string;
}

export interface GeneratedContent {
  homepage: {
    hero: string;
    introduction: string;
    highlights: string[];
  };
  about: {
    title: string;
    content: string;
    mission?: string;
  };
  services: {
    title: string;
    description: string;
    servicesList: Array<{
      name: string;
      description: string;
    }>;
  };
  contact: {
    title: string;
    content: string;
  };
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

/**
 * Generate website content using Claude (Anthropic)
 */
export const generateContentWithClaude = async (
  profileData: ProfileData
): Promise<GeneratedContent> => {
  const prompt = buildContentGenerationPrompt(profileData);

  try {
    const message = await getAnthropicClient().messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    const content = parseGeneratedContent(responseText);
    return content;
  } catch (error) {
    console.error('Claude content generation error:', error);
    throw new Error('Failed to generate content with Claude');
  }
};

/**
 * Generate website content using OpenAI
 */
export const generateContentWithOpenAI = async (
  profileData: ProfileData
): Promise<GeneratedContent> => {
  const prompt = buildContentGenerationPrompt(profileData);

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional website content writer. Generate SEO-optimized, engaging content for professional websites.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const content = parseGeneratedContent(responseText);
    return content;
  } catch (error) {
    console.error('OpenAI content generation error:', error);
    throw new Error('Failed to generate content with OpenAI');
  }
};

/**
 * Generate website content using Gemini
 */
export const generateContentWithGemini = async (
  profileData: ProfileData
): Promise<GeneratedContent> => {
  const prompt = buildContentGenerationPrompt(profileData);

  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const content = parseGeneratedContent(responseText);
    return content;
  } catch (error) {
    console.error('Gemini content generation error:', error);
    throw new Error('Failed to generate content with Gemini');
  }
};

/**
 * Main content generation function
 * Uses Claude by default, falls back to OpenAI if Claude fails
 */
export const generateWebsiteContent = async (
  profileData: ProfileData,
  preferredProvider: 'claude' | 'openai' | 'gemini' = 'gemini'
): Promise<GeneratedContent> => {
  try {
    if (preferredProvider === 'gemini') {
      return await generateContentWithGemini(profileData);
    } else if (preferredProvider === 'claude') {
      return await generateContentWithClaude(profileData);
    } else {
      return await generateContentWithOpenAI(profileData);
    }
  } catch (error) {
    console.error(`Primary provider (${preferredProvider}) failed, trying fallback...`);

    // Fallback logic
    try {
      if (preferredProvider === 'gemini') {
        // Fallback for Gemini: try Claude
        return await generateContentWithClaude(profileData);
      } else if (preferredProvider === 'claude') {
        // Fallback for Claude: try Gemini
        return await generateContentWithGemini(profileData);
      } else {
        // Fallback for OpenAI: try Gemini
        return await generateContentWithGemini(profileData);
      }
    } catch (fallbackError) {
      console.error('Fallback AI provider failed, trying final alternative...');

      try {
        // Last resort
        if (preferredProvider !== 'openai' && preferredProvider !== 'claude') {
          return await generateContentWithOpenAI(profileData);
        } else if (preferredProvider === 'openai') {
          return await generateContentWithClaude(profileData);
        } else {
          return await generateContentWithOpenAI(profileData);
        }
      } catch (finalError) {
        console.error('All AI providers failed:', finalError);
        throw new Error('Failed to generate website content with all providers');
      }
    }
  }
};

/**
 * Build the content generation prompt
 */
function buildContentGenerationPrompt(profileData: ProfileData): string {
  const { name, profession, bio, services } = profileData;

  return `Generate professional website content for ${name}, a ${profession}.

Profile Information:
- Name: ${name}
- Profession: ${profession}
${bio ? `- Bio: ${bio}` : ''}
${services && services.length > 0 ? `- Services: ${services.join(', ')}` : ''}

Generate comprehensive, SEO-optimized website content in JSON format with the following structure:

{
  "homepage": {
    "hero": "Engaging hero section headline (1 sentence)",
    "introduction": "Brief introduction paragraph (2-3 sentences)",
    "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"]
  },
  "about": {
    "title": "About section title",
    "content": "Detailed about section (2-3 paragraphs)",
    "mission": "Mission statement (1 sentence)"
  },
  "services": {
    "title": "Services section title",
    "description": "Services overview (1-2 sentences)",
    "servicesList": [
      {
        "name": "Service name",
        "description": "Service description (2-3 sentences)"
      }
    ]
  },
  "contact": {
    "title": "Contact section title",
    "content": "Contact section content (1-2 sentences)"
  },
  "meta": {
    "title": "SEO meta title (60 characters max)",
    "description": "SEO meta description (155 characters max)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
}

Guidelines:
1. Make content professional and engaging
2. Optimize for SEO with relevant keywords
3. Tailor content to the profession
4. Keep tone appropriate for the profession
5. Make it persuasive and conversion-focused
6. Ensure content is unique and not generic

Return ONLY the JSON object, no additional text or formatting.`;
}

/**
 * Parse generated content from AI response
 */
function parseGeneratedContent(responseText: string): GeneratedContent {
  try {
    // Remove markdown code blocks if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const content = JSON.parse(jsonText);

    // Validate structure
    if (!content.homepage || !content.about || !content.services || !content.contact || !content.meta) {
      throw new Error('Invalid content structure');
    }

    return content as GeneratedContent;
  } catch (error) {
    console.error('Failed to parse generated content:', error);
    console.error('Response text:', responseText);

    // Return fallback content
    return generateFallbackContent(responseText);
  }
}

/**
 * Generate fallback content if AI parsing fails
 */
function generateFallbackContent(aiResponse: string): GeneratedContent {
  return {
    homepage: {
      hero: 'Welcome to My Professional Website',
      introduction: aiResponse.substring(0, 200) || 'Professional services tailored to your needs.',
      highlights: [
        'Expert Professional Services',
        'Proven Track Record',
        'Client-Focused Approach',
      ],
    },
    about: {
      title: 'About Me',
      content: aiResponse.substring(0, 500) || 'Professional with extensive experience in the field.',
      mission: 'Delivering excellence in every project.',
    },
    services: {
      title: 'Services',
      description: 'Comprehensive professional services.',
      servicesList: [
        {
          name: 'Consultation',
          description: 'Expert consultation services tailored to your needs.',
        },
        {
          name: 'Implementation',
          description: 'Professional implementation and execution.',
        },
      ],
    },
    contact: {
      title: 'Get In Touch',
      content: 'Ready to work together? Get in touch to discuss your project.',
    },
    meta: {
      title: 'Professional Services | Expert Solutions',
      description: 'Professional services and expert solutions tailored to your needs.',
      keywords: ['professional', 'services', 'expert', 'consultation', 'solutions'],
    },
  };
}
