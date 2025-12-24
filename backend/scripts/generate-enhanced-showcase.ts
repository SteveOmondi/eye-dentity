
import { ContentGeneratorService } from '../src/services/content-generator.service';
import { TemplateRendererService, DesignSystem } from '../src/services/template-renderer.service';
import * as fs from 'fs/promises';
import * as path from 'path';

async function generateEnhancedShowcase() {
    console.log('🚀 Starting "Enhanced" AI Design Showcase Generation...');

    const renderer = new TemplateRendererService();
    const generator = new ContentGeneratorService();

    // Defined based on the new "Award-Winning" prompt logic
    const profiles = [
        {
            name: 'Kensington & Co.',
            profession: 'Estate Lawyer',
            bio: 'Protecting generational wealth with discretion and dignity.',
            photo: 'https://placehold.co/400x500/4a0404/f5f5dc?text=K&C', // Burgundy placeholder
            logo: 'https://placehold.co/150x50/4a0404/f5f5dc?text=Kensington',
            design: {
                theme: 'classic',
                layout: 'standard',
                fonts: {
                    heading: "'Playfair Display', serif",
                    body: "'Lora', serif",
                    url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap"
                },
                shapes: { style: 'sharp', radius: '0px' },
                colors: { primary: '#4a0404', secondary: '#f5f5dc', accent: '#d4af37', background: '#fdfbf7', text: '#2c2c2c' }, // Burgundy, Cream, Gold
                rationale: "Departing from standard navy, we use deep burgundy and cream to evoke old-money heritage and timeless authority."
            } as DesignSystem
        },
        {
            name: 'NEON PULSE',
            profession: 'Underground DJ',
            bio: 'Deep house and melodic techno for the soul.',
            photo: 'https://placehold.co/400x400/120024/00bcd4?text=PULSE',
            logo: 'https://placehold.co/150x50/120024/00bcd4?text=NEON',
            design: {
                theme: 'tech',
                layout: 'asymmetric', // Unbalanced layout for edgy feel
                fonts: {
                    heading: "'Space Grotesk', sans-serif",
                    body: "'Darker Grotesque', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Darker+Grotesque:wght@400;600&display=swap"
                },
                shapes: { style: 'brutalist', radius: '0px' },
                colors: { primary: '#00bcd4', secondary: '#120024', accent: '#d500f9', background: '#0a0015', text: '#e0e0e0' }, // Deep Purple, Electric Cyan, Magenta
                rationale: "Dark mode with electric cyan and magenta accents captures the energy of a nightlife rave without relying on generic green code aesthetics."
            } as DesignSystem
        },
        {
            name: 'Earth & Grain',
            profession: 'Sourdough Bakery',
            bio: 'Slow-fermented breads using ancient grains.',
            photo: 'https://placehold.co/400x400/bc6c25/efefef?text=Bread',
            logo: 'https://placehold.co/150x50/bc6c25/efefef?text=EG',
            design: {
                theme: 'flat',
                layout: 'split', // Split to show texture of bread
                fonts: {
                    heading: "'Cormorant Garamond', serif",
                    body: "'Montserrat', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Montserrat:wght@300;400;500&display=swap"
                },
                shapes: { style: 'soft', radius: '12px' },
                colors: { primary: '#bc6c25', secondary: '#dda15e', accent: '#606c38', background: '#fefae0', text: '#283618' }, // Terracotta, Sage, Cream
                rationale: "Replaced the cliché bakery pink with warm terracotta and sage green to emphasize organic ingredients and rustic warmth."
            } as DesignSystem
        },
        {
            name: 'Nova Flow',
            profession: 'FinTech Startup',
            bio: 'Banking without boundaries.',
            photo: 'https://placehold.co/400x400/0f172a/38bdf8?text=NOVA',
            logo: 'https://placehold.co/150x50/0f172a/38bdf8?text=NOVA',
            design: {
                theme: 'gradient',
                layout: 'standard',
                fonts: {
                    heading: "'Outfit', sans-serif",
                    body: "'Inter', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Inter:wght@300;400;600&display=swap"
                },
                shapes: { style: 'glass', radius: '24px' },
                colors: { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa', background: '#f8fafc', text: '#0f172a' }, // Modern Blue stack
                rationale: "Used glassmorphism and crisp sans-serifs to convey transparency and modern friction-less finance."
            } as DesignSystem
        },
        {
            name: 'Linen & Loom',
            profession: 'Sustainable Fashion',
            bio: 'Ethically sourced minimalism.',
            photo: 'https://placehold.co/400x500/d6ccc2/333?text=Linen',
            logo: 'https://placehold.co/150x50/d6ccc2/333?text=L&L',
            design: {
                theme: 'minimal',
                layout: 'asymmetric',
                fonts: {
                    heading: "'Tenor Sans', sans-serif",
                    body: "'Lato', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Lato:wght@300;400&display=swap"
                },
                shapes: { style: 'sharp', radius: '0px' },
                colors: { primary: '#8d7f73', secondary: '#e3d5ca', accent: '#d5bdaf', background: '#f5ebe0', text: '#3d3834' }, // Earthy Neutrals
                rationale: "A monochromatic palette of earth tones combined with an asymmetric layout reflects the organic yet structured nature of slow fashion."
            } as DesignSystem
        }
    ];

    for (const p of profiles) {
        console.log(`\n🎨 Generating: ${p.profession}`);
        console.log(`💡 Rationale: ${p.design.rationale}`);
        console.log(`🖌️  Theme: ${p.design.theme} | Layout: ${p.design.layout} | Colors: ${p.design.colors?.primary}`);

        const content = generator.generateFallbackContent({
            name: p.name,
            profession: p.profession,
            bio: p.bio
        });

        const html = await renderer.renderWebsite({
            templateId: 'professional',
            content,
            colorScheme: 'default',
            profileData: {
                name: p.name,
                profession: p.profession,
                // bio is not in RenderOptions.profileData interface, removing it. 
                // It is already used in content generation above.
                logoUrl: p.logo,
                profilePhotoUrl: p.photo
            },
            designSystem: p.design
        });

        const filename = `enhanced-${p.profession.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}.html`;
        const outputPath = path.join(__dirname, '../test-output', filename);
        await fs.writeFile(outputPath, html);
        console.log(`✅ Saved: ${filename}`);
    }
}

generateEnhancedShowcase().catch(console.error);
