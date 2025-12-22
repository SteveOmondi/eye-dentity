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
        email?: string;
        phone?: string;
        logoUrl?: string;
        profilePhotoUrl?: string;
    };
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

            // Apply color scheme to CSS
            const styledCSS = this.applyColorScheme(template.cssStyles, colors);

            // Inject content into HTML
            let html = this.injectContent(template.htmlStructure, options.content, options.profileData);

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
     * Apply color scheme to CSS
     */
    private applyColorScheme(css: string, colors: ColorScheme): string {
        // Create a :root block to override the default variables
        const rootOverride = `
:root {
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-background: ${colors.background};
    --color-text: ${colors.text};
    --color-text-light: ${colors.textLight};
}
`;
        // Prepend the override to the CSS
        return rootOverride + css;
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
}

export default new TemplateRendererService();
