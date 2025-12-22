import contentGeneratorService from '../src/services/content-generator.service';
import templateRendererService from '../src/services/template-renderer.service';
import testProfiles from '../src/data/test-profiles.json';
import * as fs from 'fs/promises';
import * as path from 'path';

async function testRender() {
    try {
        console.log('🚀 Starting Backend E2E Test: AI Content + Template Rendering');

        // 1. Select Profile
        const profile = testProfiles[0]; // Lawyer
        console.log(`\n👤 Using Profile: ${profile.name} (${profile.profession})`);

        // 2. Generate Content (Parallel)
        console.log('\n🤖 Step 1: Generating Content with Gemini...');
        const startTime = Date.now();
        const content = await contentGeneratorService.generateWebsiteContent(profile, 'gemini');
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Content generated in ${duration}s`);

        // 3. Render Template
        console.log('\n🎨 Step 2: Rendering Template...');
        const html = await templateRendererService.renderWebsite({
            templateId: 'professional',
            content,
            colorScheme: 'navy',
            profileData: {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
            },
        });
        console.log('✅ Template rendered successfully');

        // 4. Save Output
        const outputDir = path.join(__dirname, '../test-output');
        await fs.mkdir(outputDir, { recursive: true });

        const filename = `e2e-render-${profile.profession.toLowerCase()}-${Date.now()}.html`;
        const filepath = path.join(outputDir, filename);

        await fs.writeFile(filepath, html, 'utf-8');
        console.log(`\n💾 Website saved to: ${filepath}`);

    } catch (error) {
        console.error('\n❌ E2E Test Failed:', error);
        process.exit(1);
    }
}

testRender();
