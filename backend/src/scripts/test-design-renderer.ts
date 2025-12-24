
import TemplateRenderer, { DesignSystem } from '../services/template-renderer.service';
import { WebsiteContent } from '../services/content-generator.service';

const mockContent: WebsiteContent = {
    homepage: {
        headline: "Test Headline",
        subheadline: "Test Subheadline",
        introduction: "Test Intro",
        servicesOverview: "Test Overview"
    },
    about: { title: "About", content: "About content" },
    services: { title: "Services", introduction: "Intro", services: [] },
    contact: { title: "Contact", content: "Contact content", cta: "Call Me" },
    seo: { title: "SEO Title", description: "SEO Desc", keywords: [] }
};

const mockProfile = {
    name: "Dr. Test",
    profession: "Doctor",
    email: "test@example.com",
    logoUrl: "http://example.com/logo.png"
};

const mockDesign: DesignSystem = {
    theme: 'tech',
    layout: 'asymmetric', // This should add a class
    colors: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        background: '#000000',
        text: '#FFFFFF',
        textLight: '#CCCCCC'
    },
    fonts: {
        heading: 'Roboto',
        body: 'Open Sans',
        url: 'http://fonts.google.com/...'
    },
    shapes: {
        style: 'pill',
        radius: '20px'
    },
    rationale: "Because science."
};

async function test() {
    console.log("Testing Template Renderer with AI Design System...");

    try {
        // We need a valid template ID. Let's list templates first or mock loading.
        // Since we can't easily mock private loadTemplate without spying, 
        // we might fail if 'professional' template doesn't exist.
        // Let's assume 'professional' exists based on file listing earlier.
        const templateId = 'professional';

        const result = await TemplateRenderer.renderWebsite({
            templateId,
            content: mockContent,
            colorScheme: 'default',
            profileData: mockProfile,
            designSystem: mockDesign
        });

        console.log("Render Result HTML length:", result.html.length);
        console.log("Render Result CSS length:", result.css.length);

        // Verification checks
        if (result.css.includes('--color-primary: #FF0000')) {
            console.log("✅ Custom Primary Color applied");
        } else {
            console.error("❌ Custom Primary Color FALIED");
        }

        if (result.html.includes('layout-asymmetric')) {
            console.log("✅ Layout class applied");
        } else {
            console.error("❌ Layout class FAILED");
        }

        if (result.html.includes('shape-pill')) {
            console.log("✅ Shape class applied");
        } else {
            console.error("❌ Shape class FAILED");
        }

    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
