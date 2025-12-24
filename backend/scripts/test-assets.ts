
import { ContentGeneratorService } from '../src/services/content-generator.service';
import { TemplateRendererService } from '../src/services/template-renderer.service';
import * as fs from 'fs/promises';
import * as path from 'path';

async function testAssetInjection() {
    console.log('🚀 Starting Asset Injection Test...');

    const contentGenerator = new ContentGeneratorService();
    // Simulate user provided assets (placeholders)
    const profileData = {
        name: 'Asset Tester',
        profession: 'Visual Artist',
        logoUrl: 'https://placehold.co/150x50/333/fff?text=MyLogo',
        profilePhotoUrl: 'https://placehold.co/400x400/2563eb/fff?text=Photo'
    };

    const renderer = new TemplateRendererService();
    const content = contentGenerator.generateFallbackContent(profileData);

    // Use an AI design to verify variables work
    const designSystem = {
        theme: 'minimal' as const,
        layout: 'split' as const,
        fonts: { heading: 'Arial', body: 'Arial', url: '' },
        shapes: { style: 'pill' as const, radius: '99px' },
        colors: { primary: '#000', secondary: '#fff', accent: '#f00', background: '#fff', text: '#000', textLight: '#666' }
    };

    const html = await renderer.renderWebsite({
        templateId: 'professional',
        content,
        colorScheme: 'default',
        profileData,
        designSystem
    });

    const outputPath = path.join(__dirname, '../test-output/asset-test.html');
    await fs.writeFile(outputPath, html);
    console.log(`💾 Saved Asset Test Website to: ${outputPath}`);

    // Verification
    let pass = true;
    if (!html.includes(profileData.logoUrl)) {
        console.error('❌ FAILURE: Logo URL not found in output.');
        pass = false;
    }
    if (!html.includes(profileData.profilePhotoUrl)) {
        console.error('❌ FAILURE: Profile Photo URL not found in output.');
        pass = false;
    }
    if (pass) {
        console.log('✅ SUCCESS: Logo and Profile Photo injected correctly!');
    }
}

testAssetInjection().catch(console.error);
