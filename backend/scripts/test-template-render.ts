import contentGeneratorService from '../src/services/content-generator.service';
import templateRendererService from '../src/services/template-renderer.service';
import testProfiles from '../src/data/test-profiles.json';
import * as fs from 'fs/promises';
import * as path from 'path';

async function testRender() {
    try {
        console.log('🚀 Starting Backend E2E Test: AI Content + Template Rendering');

        // Test with 2 profiles to see layout variety
        const profilesToTest = [testProfiles[0], testProfiles[1]]; // Lawyer, Doctor (or index 1)

        for (const profile of profilesToTest) {
            if (!profile) continue;

            // Generate 5 variations per profile
            for (let i = 0; i < 5; i++) {

                console.log(`\n\n--------------------------------------------------`);
                console.log(`👤 Using Profile: ${profile.name} (${profile.profession})`);

                // 2. Generate Content
                console.log('🤖 Generating Content...');

                const content = await contentGeneratorService.generateWebsiteContent(profile, 'gemini');

                // 3. Render Template
                console.log('🎨 Rendering Template (Check logs for Design System choices)...');
                const html = await templateRendererService.renderWebsite({
                    templateId: 'professional',
                    content,
                    colorScheme: 'navy',
                    profileData: {
                        name: profile.name,
                        profession: profile.profession,
                        email: profile.email,
                        phone: profile.phone,
                    },
                });

                // 4. Save Output
                const outputDir = path.join(__dirname, '../test-output');
                await fs.mkdir(outputDir, { recursive: true });
                const filename = `e2e-render-${profile.profession.toLowerCase().replace(' ', '-')}-${Date.now()}.html`;
                const filepath = path.join(outputDir, filename);
                await fs.writeFile(filepath, html, 'utf-8');
                console.log(`💾 Website saved: ${filename}`);
            }
        }

    } catch (error) {
        console.error('\n❌ E2E Test Failed:', error);
        process.exit(1);
    }
}

testRender();
