/**
 * Template Renderer Service
 * Handles template loading, content injection, and HTML generation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { WebsiteContent } from './content-generator.service';

export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
}

export interface TemplateData {
    id: string;
    name: string;
    category: string;
    htmlStructure: string;
    cssStyles: string;
    colorSchemes: Record<string, ColorScheme>;
}

export interface RenderOptions {
    templateId: string;
    content: WebsiteContent;
    colorScheme: string;
    profileData: {
        name: string;
        profession: string;
        email?: string;
        phone?: string;
        logoUrl?: string;
        profilePhotoUrl?: string;
        showParticles?: boolean;
    };
}

// Design System Interfaces
// Design System Interfaces
export interface DesignSystem {
    layout: 'standard' | 'split' | 'asymmetric';
    fonts: {
        heading: string;
        body: string;
        url: string;
    };
    shapes: {
        radius: string;
        style: 'sharp' | 'soft' | 'pill';
    };
    theme: 'light' | 'dark' | 'navy'; // New: Force background variation
}

export class TemplateRendererService {
    private templatesPath: string;

    constructor() {
        this.templatesPath = path.join(__dirname, '../../../templates');
    }

    /**
     * Load template from filesystem
     */
    async loadTemplate(templateId: string): Promise<TemplateData> {
        try {
            const templatePath = path.join(this.templatesPath, templateId);

            // Load template metadata
            const metadataPath = path.join(templatePath, 'template.json');
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

            // Load HTML structure
            const htmlPath = path.join(templatePath, 'index.html');
            const htmlStructure = await fs.readFile(htmlPath, 'utf-8');

            // Load CSS styles
            const cssPath = path.join(templatePath, 'styles.css');
            const cssStyles = await fs.readFile(cssPath, 'utf-8');

            // Load color schemes
            const colorSchemesPath = path.join(templatePath, 'color-schemes.json');
            const colorSchemes = JSON.parse(await fs.readFile(colorSchemesPath, 'utf-8'));

            return {
                id: templateId,
                name: metadata.name,
                category: metadata.category,
                htmlStructure,
                cssStyles,
                colorSchemes,
            };
        } catch (error) {
            console.error(`Error loading template ${templateId}:`, error);
            throw new Error(`Failed to load template: ${templateId}`);
        }
    }

    /**
     * Render complete website from template and content
     */
    async renderWebsite(options: RenderOptions): Promise<string> {
        try {
            // Load template
            const template = await this.loadTemplate(options.templateId);

            // Get color scheme
            const colors = template.colorSchemes[options.colorScheme] || template.colorSchemes['default'];

            // Apply theme (colors + animations + images)
            const { css: styledCSS, html: styledHTML, showParticles } = this.applyTheme(template.cssStyles, template.htmlStructure, colors, options.profileData.profession);

            // Update profile data with design choices
            options.profileData.showParticles = showParticles;

            // Inject content into HTML
            let html = this.injectContent(styledHTML, options.content, options.profileData);

            // Inject CSS
            html = html.replace('</head>', `<style>${styledCSS}</style>\n</head>`);

            // Inject SEO metadata
            html = this.injectSEO(html, options.content.seo);

            return html;
        } catch (error) {
            console.error('Error rendering website:', error);
            throw new Error('Failed to render website');
        }
    }

    /**
     * Apply theme (colors, images, animations) to CSS and HTML
     */
    private applyTheme(css: string, html: string, colors: ColorScheme, profession: string): { css: string, html: string, showParticles: boolean } {
        // 1. Generate Stock Image URL with Cache Buster
        const stockImage = `url('https://loremflickr.com/1200/800/${encodeURIComponent(profession).replace(/%20/g, ',')},business?lock=${Math.floor(Math.random() * 1000)}')`;

        // 2. Select Animation Scheme
        const animationSchemes = [
            {
                name: 'Classic',
                hero_headline: 'animate-slide-up',
                hero_text: 'animate-slide-up',
                hero_cta: 'animate-slide-up'
            },
            {
                name: 'Modern',
                hero_headline: 'animate-blur-reveal',
                hero_text: 'animate-blur-reveal',
                hero_cta: 'animate-blur-reveal'
            },
            {
                name: 'Bold',
                hero_headline: 'animate-zoom-in',
                hero_text: 'animate-slide-up', // Mix for readability
                hero_cta: 'animate-scale-in'
            }
        ];

        // 3. Generate Design System
        const design = this.generateDesignSystem(profession);
        console.log(`Selected Design: Layout=${design.layout}, Theme=${design.theme}, Fonts=${design.fonts.heading.split(',')[0]}, Shape=${design.shapes.style}`);


        // Randomly select one
        const scheme = animationSchemes[Math.floor(Math.random() * animationSchemes.length)];
        console.log(`Selected Animation Scheme: ${scheme.name}`);

        // 3. CSS Overrides
        const rootOverride = `
:root {
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-background: ${colors.background};
    --color-text: ${colors.text};
    --color-text-light: ${colors.textLight};
    --hero-bg: ${stockImage};
    --font-heading: ${design.fonts.heading};
    --font-body: ${design.fonts.body};
    --radius-card: ${design.shapes.radius};
    --radius-btn: ${design.shapes.style === 'pill' ? '999px' : design.shapes.radius};
    
    /* Theme Overrides */
    --color-background: ${design.theme === 'dark' ? '#111827' : design.theme === 'navy' ? '#0f172a' : '#ffffff'};
    --color-text: ${design.theme === 'light' ? '#1f2937' : '#f3f4f6'};
    --color-text-light: ${design.theme === 'light' ? '#6b7280' : '#9ca3af'};
}
`;
        // FIX: Inject overrides AFTER the original CSS so they take precedence
        const styledCSS = css + rootOverride;

        // 5. Inject Design Classes & Fonts
        let styledHTML = html;

        // Inject layout class and fonts into body/head
        styledHTML = styledHTML.replace('<body>', `<body class="layout-${design.layout} shape-${design.shapes.style}">`);
        styledHTML = styledHTML.replace('</head>', `<link href="${design.fonts.url}" rel="stylesheet">\n</head>`);

        styledHTML = styledHTML.replace(/\{\{anim\.hero_headline\}\}/g, scheme.hero_headline);
        styledHTML = styledHTML.replace(/\{\{anim\.hero_text\}\}/g, scheme.hero_text);
        styledHTML = styledHTML.replace(/\{\{anim\.hero_cta\}\}/g, scheme.hero_cta);

        // Default fallbacks for other placeholders if added later
        styledHTML = styledHTML.replace(/\{\{anim\.[^}]+\}\}/g, 'animate-fade-in');

        // 6. Handle Particles (Only show for standard layout)
        const showParticles = design.layout === 'standard';

        return { css: styledCSS, html: styledHTML, showParticles };
    }

    /**
     * Inject content into HTML template
     */
    private injectContent(
        html: string,
        content: WebsiteContent,
        profileData: RenderOptions['profileData']
    ): string {
        let injectedHTML = html;

        // Inject profile data
        injectedHTML = injectedHTML.replace(/\{\{name\}\}/g, profileData.name);
        injectedHTML = injectedHTML.replace(/\{\{email\}\}/g, profileData.email || '');
        injectedHTML = injectedHTML.replace(/\{\{phone\}\}/g, profileData.phone || '');

        // Inject logo
        if (profileData.logoUrl) {
            injectedHTML = injectedHTML.replace(/\{\{logoUrl\}\}/g, profileData.logoUrl);
        }

        // Inject profile photo
        if (profileData.profilePhotoUrl) {
            injectedHTML = injectedHTML.replace(/\{\{profilePhotoUrl\}\}/g, profileData.profilePhotoUrl);
        }

        // Inject homepage content
        injectedHTML = injectedHTML.replace(/\{\{homepage\.headline\}\}/g, content.homepage.headline);
        injectedHTML = injectedHTML.replace(/\{\{homepage\.subheadline\}\}/g, content.homepage.subheadline);
        injectedHTML = injectedHTML.replace(/\{\{homepage\.introduction\}\}/g, content.homepage.introduction);
        injectedHTML = injectedHTML.replace(/\{\{homepage\.servicesOverview\}\}/g, content.homepage.servicesOverview);

        // Inject about content
        injectedHTML = injectedHTML.replace(/\{\{about\.title\}\}/g, content.about.title);
        injectedHTML = injectedHTML.replace(/\{\{about\.content\}\}/g, this.formatParagraphs(content.about.content));

        // Inject services content
        injectedHTML = injectedHTML.replace(/\{\{services\.title\}\}/g, content.services.title);
        injectedHTML = injectedHTML.replace(/\{\{services\.introduction\}\}/g, content.services.introduction);
        injectedHTML = injectedHTML.replace(/\{\{services\.list\}\}/g, this.renderServicesList(content.services.services));

        // Inject contact content
        injectedHTML = injectedHTML.replace(/\{\{contact\.title\}\}/g, content.contact.title);
        injectedHTML = injectedHTML.replace(/\{\{contact\.content\}\}/g, this.formatParagraphs(content.contact.content));
        injectedHTML = injectedHTML.replace(/\{\{contact\.cta\}\}/g, content.contact.cta);

        // Process conditionals
        injectedHTML = this.processConditionals(injectedHTML, profileData);

        return injectedHTML;
    }

    /**
     * Process conditional blocks {{#if var}}...{{else}}...{{/if}}
     */
    private processConditionals(html: string, data: any): string {
        let processed = html;

        // Regex to match {{#if key}}...{{/if}} blocks, handling optional {{else}}
        // Captures: 1=key, 2=trueContent, 3=elseBlock (optional), 4=falseContent (optional)
        const regex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)(\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;

        processed = processed.replace(regex, (match, key, trueContent, elseBlock, falseContent) => {
            const value = data[key];

            if (value) {
                return trueContent;
            } else {
                return falseContent || '';
            }
        });

        return processed;
    }

    /**
     * Inject SEO metadata
     */
    private injectSEO(html: string, seo: WebsiteContent['seo']): string {
        let seoHTML = html;

        // Inject title
        seoHTML = seoHTML.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`);

        // Inject meta description
        const metaDescription = `<meta name="description" content="${seo.description}">`;
        seoHTML = seoHTML.replace('</head>', `${metaDescription}\n</head>`);

        // Inject meta keywords
        const metaKeywords = `<meta name="keywords" content="${seo.keywords.join(', ')}">`;
        seoHTML = seoHTML.replace('</head>', `${metaKeywords}\n</head>`);

        // Inject Open Graph tags
        const ogTags = `
    <meta property="og:title" content="${seo.title}">
    <meta property="og:description" content="${seo.description}">
    <meta property="og:type" content="website">
    `;
        seoHTML = seoHTML.replace('</head>', `${ogTags}\n</head>`);

        return seoHTML;
    }

    /**
     * Format paragraphs with proper HTML
     */
    private formatParagraphs(content: string): string {
        return content
            .split('\n\n')
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('\n');
    }

    /**
     * Render services list HTML
     */
    private renderServicesList(services: WebsiteContent['services']['services']): string {
        return services
            .map(
                service => `
        <div class="service-card">
          <h3>${service.name}</h3>
          <p>${service.description}</p>
          <ul class="benefits-list">
            ${service.benefits.map(benefit => `<li>${benefit}</li>`).join('\n')}
          </ul>
        </div>
      `
            )
            .join('\n');
    }

    /**
     * Generate static assets (CSS file)
     */
    async generateStaticAssets(
        templateId: string,
        colorScheme: string
    ): Promise<{ css: string }> {
        const template = await this.loadTemplate(templateId);
        const colors = template.colorSchemes[colorScheme] || template.colorSchemes['default'];
        const css = this.applyColorScheme(template.cssStyles, colors);

        return { css };
    }
    /**
     * Generate a random Design System configuration
     */
    private generateDesignSystem(profession: string): DesignSystem {
        const layouts: DesignSystem['layout'][] = ['standard', 'split', 'asymmetric'];
        const shapes: DesignSystem['shapes'][] = [
            { style: 'sharp', radius: '0px' },
            { style: 'soft', radius: '12px' },
            { style: 'pill', radius: '24px' }
        ];

        const fontPairings = [
            {
                heading: "'Playfair Display', serif",
                body: "'Lato', sans-serif",
                url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
            },
            {
                heading: "'Space Grotesk', sans-serif",
                body: "'Inter', sans-serif",
                url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap"
            },
            {
                heading: "'Oswald', sans-serif",
                body: "'Open Sans', sans-serif",
                url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Oswald:wght@500;700&display=swap"
            },
            {
                heading: "'Merriweather', serif",
                body: "'Merriweather Sans', sans-serif",
                url: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Merriweather+Sans:wght@400;700&display=swap"
            }
        ];

        // Random selections
        const layout = layouts[Math.floor(Math.random() * layouts.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const fonts = fontPairings[Math.floor(Math.random() * fontPairings.length)];
        const themes: DesignSystem['theme'][] = ['light', 'dark', 'navy'];
        const theme = themes[Math.floor(Math.random() * themes.length)];

        return {
            layout,
            fonts,
            shapes: shape,
            theme
        };
    }
}

export default new TemplateRendererService();
