
import { ContentGeneratorService } from '../src/services/content-generator.service';
import { TemplateRendererService, DesignSystem } from '../src/services/template-renderer.service';
import * as fs from 'fs/promises';
import * as path from 'path';

async function generateShowcase() {
    console.log('🚀 Starting Professional Showcase Generation...');

    const renderer = new TemplateRendererService();
    const generator = new ContentGeneratorService();

    // Define Diverse Profiles with Specific "AI-Simulated" Designs
    const profiles = [
        {
            name: 'Sarah Chen',
            profession: 'Urban Architect',
            bio: 'Designing the future of sustainable city living.',
            photo: 'https://placehold.co/400x500/e5e5e5/333?text=Architect',
            logo: 'https://placehold.co/150x50/e5e5e5/333?text=CHEN+ARCH',
            // Simulated AI Design: Minimal + Split
            design: {
                theme: 'minimal',
                layout: 'split',
                fonts: {
                    heading: "'Montserrat', sans-serif",
                    body: "'Quicksand', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Quicksand:wght@400;500;600&display=swap"
                },
                shapes: { style: 'sharp', radius: '0px' },
                colors: { primary: '#000000', secondary: '#ffffff', accent: '#333333', background: '#ffffff', text: '#000000' }
            } as DesignSystem
        },
        {
            name: 'CyberDefend Inc',
            profession: 'Cyber Security',
            bio: 'Next-generation threat detection and elimination.',
            photo: 'https://placehold.co/400x400/0f172a/38bdf8?text=SECURE',
            logo: 'https://placehold.co/150x50/0f172a/38bdf8?text=CYBER',
            // Simulated AI Design: Tech + Z-Pattern + Neon
            design: {
                theme: 'tech',
                layout: 'standard', // Tech forces Z-pattern via CSS on standard/hero
                fonts: {
                    heading: "'Oswald', sans-serif",
                    body: "'JetBrains Mono', monospace",
                    url: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap"
                },
                shapes: { style: 'brutalist', radius: '0px' },
                // Let the theme engine handle colors for Tech usually, but we can force it
                colors: { primary: '#38bdf8', secondary: '#0f172a', accent: '#22d3ee', background: '#0f172a', text: '#f8fafc' }
            } as DesignSystem
        },
        {
            name: 'Sweet Tooth',
            profession: 'Artisan Bakery',
            bio: 'Handcrafted pastries and sourdough breads made with love.',
            photo: 'https://placehold.co/400x400/FFF0F5/FF69B4?text=Bake',
            logo: 'https://placehold.co/150x50/FFF0F5/FF69B4?text=SWEET',
            // Simulated AI Design: Flat + Sidebar + Pink
            design: {
                theme: 'flat',
                layout: 'standard', // Flat forces Sidebar via CSS
                fonts: {
                    heading: "'Oswald', sans-serif", // Using available fonts
                    body: "'Raleway', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Raleway:wght@400;500;600&display=swap"
                },
                shapes: { style: 'soft', radius: '16px' },
                colors: { primary: '#FF69B4', secondary: '#FFC0CB', accent: '#FFFF00', background: '#FFF5F7', text: '#4A4A4A' }
            } as DesignSystem
        },
        {
            name: 'Vanguard Legal',
            profession: 'Corporate Law',
            bio: 'Protecting your business interests with precision.',
            photo: 'https://placehold.co/400x400/1e293b/fff?text=Law',
            logo: 'https://placehold.co/150x50/1e293b/fff?text=VANGUARD',
            // Simulated AI Design: Gradient + Card
            design: {
                theme: 'gradient',
                layout: 'standard', // Gradient forces Card via CSS
                fonts: {
                    heading: "'Montserrat', sans-serif",
                    body: "'Quicksand', sans-serif",
                    url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Quicksand:wght@400;500;600&display=swap"
                },
                shapes: { style: 'glass', radius: '24px' },
                colors: { primary: '#4f46e5', secondary: '#818cf8', accent: '#c7d2fe', background: '#eef2ff', text: '#1e1b4b' }
            } as DesignSystem
        }
    ];

    for (const p of profiles) {
        console.log(`Generating: ${p.profession} (${p.design.theme})...`);
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
                bio: p.bio,
                logoUrl: p.logo,
                profilePhotoUrl: p.photo
            },
            designSystem: p.design
        });

        const filename = `showcase-${p.profession.toLowerCase().replace(/ /g, '-')}.html`;
        const outputPath = path.join(__dirname, '../test-output', filename);
        await fs.writeFile(outputPath, html);
        console.log(`✅ Saved: ${filename}`);
    }
}

generateShowcase().catch(console.error);
