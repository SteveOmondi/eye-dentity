
import { ContentGeneratorService } from '../src/services/content-generator.service';
import { TemplateRendererService } from '../src/services/template-renderer.service';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock specific design to simulate AI output
const mockAIDesign = {
    theme: 'flat',
    layout: 'standard', // Use standard to test basic injection
    colors: {
        primary: '#FF69B4', // Hot Pink for high visibility
        secondary: '#FFC0CB',
        accent: '#FFFF00',
        background: '#FFF0F5',
        text: '#333333'
    },
    fonts: {
        heading: "'Pacifico', cursive", // Distinct font
        body: "'Quicksand', sans-serif",
        url: "https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@400;700&display=swap"
    },
    shapes: {
        style: 'soft',
        radius: '20px'
    }
};

async function testAIDesignFlow() {
    console.log('🚀 Starting AI Design Flow Test...');

    // 1. Simulate Content Generation (Mocked for speed/cost)
    const contentGenerator = new ContentGeneratorService();
    const profileData = {
        name: 'Cupcake Queen',
        profession: 'Pastry Chef',
        bio: 'Baking the world a better place.'
    };

    // In real app: const design = await contentGenerator.generateDesignSystem(profileData);
    // Here we use mock to prove the injection works
    console.log('🤖 Simulating AI Design Generation...');
    const designSystem = mockAIDesign;
    console.log('✨ AI Generated Design:', JSON.stringify(designSystem, null, 2));

    // 2. Render Website with Injected Design
    const renderer = new TemplateRendererService();
    const content = contentGenerator.generateFallbackContent(profileData);

    const html = await renderer.renderWebsite({
        templateId: 'professional',
        content,
        colorScheme: 'blue', // Should be overridden or ignored in parts
        profileData,
        designSystem: designSystem as any // Cast to satisfy strict type if needed
    });

    // 3. Save Output
    const outputPath = path.join(__dirname, '../test-output/ai-design-test.html');
    await fs.writeFile(outputPath, html);
    console.log(`💾 Saved AI-Design Website to: ${outputPath}`);

    // 4. Verification
    if (html.includes('Pacifico') && html.includes('#FF69B4')) {
        console.log('✅ SUCCESS: AI Design (Pacifico Font & Pink Color) injected correctly!');
    } else {
        console.error('❌ FAILURE: AI Design elements not found in output.');
    }
}

testAIDesignFlow().catch(console.error);
