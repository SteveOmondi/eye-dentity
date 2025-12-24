/**
 * Content Generator Service
 * Handles AI-powered content generation for websites
 */

import {
    getHomepageHeroPrompt,
    getAboutPagePrompt,
    getServicesPagePrompt,
    getContactPagePrompt,
    getSEOMetadataPrompt,
    getDesignSystemPrompt,
    type PromptContext
} from '../config/ai-prompts';
import { sendMessage } from './llm-provider.service';

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
    logoUrl?: string; // [NEW]
    profilePhotoUrl?: string; // [NEW]
}

export class ContentGeneratorService {
    /**
     * Generate complete website content using AI
     */
    async generateWebsiteContent(
        profileData: ProfileData,
        provider: 'claude' | 'openai' | 'gemini' = 'gemini',
        apiKey?: string
    ): Promise<WebsiteContent> {
        try {
            console.log(`Starting parallel content generation for ${profileData.profession} using ${provider}`);
            const startTime = Date.now();

            // Prepare context
            const context: PromptContext = {
                name: profileData.name,
                profession: profileData.profession,
                bio: profileData.bio,
                services: profileData.services,
                phone: profileData.phone,
                email: profileData.email,
                location: profileData.location,
            };

            // Generate all sections in parallel
            const [homepage, about, services, contact, seo] = await Promise.all([
                this.generateSection(provider, getHomepageHeroPrompt(context), apiKey, 'homepage'),
                this.generateSection(provider, getAboutPagePrompt(context), apiKey, 'about'),
                this.generateSection(provider, getServicesPagePrompt(context), apiKey, 'services'),
                this.generateSection(provider, getContactPagePrompt(context), apiKey, 'contact'),
                this.generateSection(provider, getSEOMetadataPrompt(context), apiKey, 'seo')
            ]);

            const duration = Date.now() - startTime;
            console.log(`Content generation completed in ${duration}ms`);

            // Construct final object
            const content: WebsiteContent = {
                homepage,
                about,
                services,
                contact,
                seo
            };

            // Validate structure
            this.validateContentStructure(content);

            return content;
        } catch (error) {
            console.error('Error generating website content:', error);
            // Fallback is handled by the caller or we can throw
            throw new Error('Failed to generate website content');
        }
    }

    /**
     * Generate visual design system using AI
     */
    async generateDesignSystem(
        profileData: ProfileData,
        provider: 'claude' | 'openai' | 'gemini' = 'gemini',
        apiKey?: string
    ): Promise<any> {
        try {
            console.log(`🎨 Start AI Design Generation for ${profileData.profession} using ${provider}`);
            const context: PromptContext = {
                name: profileData.name,
                profession: profileData.profession,
                bio: profileData.bio,
                logoUrl: profileData.logoUrl,
                profilePhotoUrl: profileData.profilePhotoUrl,
            };

            const prompt = getDesignSystemPrompt(context);

            // Re-use the generateSection logic which handles parsing
            const designSystem = await this.generateSection(provider, prompt, apiKey, 'design-system');

            return designSystem;
        } catch (error) {
            console.error('Error generating design system:', error);
            // Return null or undefined, caller should fallback to random
            return null;
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

    /**
     * Helper to generate a single section
     */
    private async generateSection(
        provider: 'claude' | 'openai' | 'gemini',
        prompt: string,
        apiKey: string | undefined,
        sectionName: string
    ): Promise<any> {
        try {
            const messages = [{
                role: 'user' as const,
                content: prompt
            }];

            const response = await sendMessage(provider, messages, `You are a professional website content generator.`, apiKey);

            // Try to parse JSON
            try {
                // First try direct parse
                return JSON.parse(response);
            } catch (e) {
                // Try to find JSON in markdown
                const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1]);
                }

                // Try to find JSON object boundaries
                const start = response.indexOf('{');
                const end = response.lastIndexOf('}');
                if (start !== -1 && end !== -1 && end > start) {
                    return JSON.parse(response.substring(start, end + 1));
                }

                throw e;
            }
        } catch (error) {
            console.error(`Error generating section ${sectionName}:`, error);
            throw error;
        }
    }
}

export default new ContentGeneratorService();
