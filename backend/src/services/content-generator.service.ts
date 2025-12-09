/**
 * Content Generator Service
 * Handles AI-powered content generation for websites
 */

import { getCompleteWebsitePrompt, type PromptContext } from '../config/ai-prompts';
import { LLMProviderService } from './llm-provider.service';

export interface WebsiteContent {
    homepage: {
        headline: string;
        subheadline: string;
        introduction: string;
        servicesOverview: string;
    };
    about: {
        title: string;
        content: string;
    };
    services: {
        title: string;
        introduction: string;
        services: Array<{
            name: string;
            description: string;
            benefits: string[];
        }>;
    };
    contact: {
        title: string;
        content: string;
        cta: string;
    };
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}

export interface ProfileData {
    name: string;
    profession: string;
    bio?: string;
    services?: string[];
    phone?: string;
    email?: string;
    location?: string;
}

export class ContentGeneratorService {
    private llmProvider: LLMProviderService;

    constructor() {
        this.llmProvider = new LLMProviderService();
    }

    /**
     * Generate complete website content using AI
     */
    async generateWebsiteContent(
        profileData: ProfileData,
        provider: 'claude' | 'openai' | 'gemini' = 'claude',
        apiKey?: string
    ): Promise<WebsiteContent> {
        try {
            // Prepare context for prompt
            const context: PromptContext = {
                name: profileData.name,
                profession: profileData.profession,
                bio: profileData.bio,
                services: profileData.services,
                phone: profileData.phone,
                email: profileData.email,
                location: profileData.location,
            };

            // Generate prompt
            const prompt = getCompleteWebsitePrompt(context);

            // Call LLM provider
            const response = await this.llmProvider.generateContent(prompt, provider, apiKey);

            // Parse and validate response
            const content = this.parseAndValidateContent(response);

            return content;
        } catch (error) {
            console.error('Error generating website content:', error);
            throw new Error('Failed to generate website content');
        }
    }

    /**
     * Parse and validate AI-generated content
     */
    private parseAndValidateContent(response: string): WebsiteContent {
        try {
            // Try to parse JSON from response
            const content = JSON.parse(response);

            // Validate structure
            this.validateContentStructure(content);

            return content as WebsiteContent;
        } catch (error) {
            console.error('Error parsing AI response:', error);

            // Try to extract JSON from markdown code blocks
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    const content = JSON.parse(jsonMatch[1]);
                    this.validateContentStructure(content);
                    return content as WebsiteContent;
                } catch (e) {
                    // Fall through to error
                }
            }

            throw new Error('Invalid content format from AI');
        }
    }

    /**
     * Validate content structure
     */
    private validateContentStructure(content: any): void {
        const requiredSections = ['homepage', 'about', 'services', 'contact', 'seo'];

        for (const section of requiredSections) {
            if (!content[section]) {
                throw new Error(`Missing required section: ${section}`);
            }
        }

        // Validate homepage
        if (!content.homepage.headline || !content.homepage.subheadline || !content.homepage.introduction) {
            throw new Error('Invalid homepage structure');
        }

        // Validate about
        if (!content.about.title || !content.about.content) {
            throw new Error('Invalid about page structure');
        }

        // Validate services
        if (!content.services.title || !Array.isArray(content.services.services)) {
            throw new Error('Invalid services page structure');
        }

        // Validate contact
        if (!content.contact.title || !content.contact.content || !content.contact.cta) {
            throw new Error('Invalid contact page structure');
        }

        // Validate SEO
        if (!content.seo.title || !content.seo.description || !Array.isArray(content.seo.keywords)) {
            throw new Error('Invalid SEO metadata structure');
        }
    }

    /**
     * Generate fallback content if AI generation fails
     */
    generateFallbackContent(profileData: ProfileData): WebsiteContent {
        const { name, profession, bio, services, email, phone } = profileData;

        return {
            homepage: {
                headline: `${name} - Professional ${profession}`,
                subheadline: `Experienced ${profession} providing quality services`,
                introduction: bio || `Welcome! I'm ${name}, a dedicated ${profession} committed to delivering exceptional results.`,
                servicesOverview: services && services.length > 0
                    ? `I offer a range of professional services including ${services.join(', ')}.`
                    : `I provide comprehensive ${profession.toLowerCase()} services tailored to your needs.`,
            },
            about: {
                title: `About ${name}`,
                content: bio || `I am a professional ${profession} with extensive experience in the field. My commitment is to provide the highest quality service to every client.`,
            },
            services: {
                title: 'Services',
                introduction: 'Explore the professional services I offer:',
                services: services && services.length > 0
                    ? services.map(service => ({
                        name: service,
                        description: `Professional ${service.toLowerCase()} services tailored to your specific needs.`,
                        benefits: [
                            'Expert guidance and support',
                            'Personalized approach',
                            'Quality results',
                        ],
                    }))
                    : [
                        {
                            name: 'Professional Services',
                            description: `Comprehensive ${profession.toLowerCase()} services.`,
                            benefits: [
                                'Expert consultation',
                                'Customized solutions',
                                'Reliable support',
                            ],
                        },
                    ],
            },
            contact: {
                title: 'Get in Touch',
                content: `I'd love to hear from you. Whether you have a question or need assistance, feel free to reach out.${email ? ` Email me at ${email}` : ''}${phone ? ` or call ${phone}` : ''}.`,
                cta: 'Contact Me',
            },
            seo: {
                title: `${name} - ${profession}`,
                description: `Professional ${profession} services. ${bio ? bio.substring(0, 100) : `Contact ${name} for expert ${profession.toLowerCase()} services.`}`,
                keywords: [profession, name, 'professional services', 'expert', 'consultation'],
            },
        };
    }

    /**
     * Enhance content with additional details
     */
    async enhanceContent(
        baseContent: WebsiteContent,
        profileData: ProfileData
    ): Promise<WebsiteContent> {
        // Add contact information to contact page if available
        if (profileData.email || profileData.phone) {
            let contactInfo = baseContent.contact.content;

            if (profileData.email) {
                contactInfo += `\n\nEmail: ${profileData.email}`;
            }

            if (profileData.phone) {
                contactInfo += `\n\nPhone: ${profileData.phone}`;
            }

            baseContent.contact.content = contactInfo;
        }

        return baseContent;
    }
}

export default new ContentGeneratorService();
