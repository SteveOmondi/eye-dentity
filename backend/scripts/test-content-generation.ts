/**
 * Test script for AI content generation
 * Usage: npx tsx scripts/test-content-generation.ts [--profile <name>] [--provider <claude|openai|gemini>]
 */

import { ContentGeneratorService } from '../src/services/content-generator.service';
import testProfiles from '../src/data/test-profiles.json';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TestOptions {
    profile?: string;
    provider?: 'claude' | 'openai' | 'gemini';
    all?: boolean;
}

async function parseArgs(): Promise<TestOptions> {
    const args = process.argv.slice(2);
    const options: TestOptions = {
        provider: 'gemini',
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--profile' && args[i + 1]) {
            options.profile = args[i + 1];
            i++;
        } else if (args[i] === '--provider' && args[i + 1]) {
            options.provider = args[i + 1] as 'claude' | 'openai' | 'gemini';
            i++;
        } else if (args[i] === '--all') {
            options.all = true;
        }
    }

    return options;
}

async function testContentGeneration(
    profileData: any,
    provider: 'claude' | 'openai' | 'gemini'
) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing content generation for: ${profileData.name}`);
    console.log(`Profession: ${profileData.profession}`);
    console.log(`Provider: ${provider.toUpperCase()}`);
    console.log('='.repeat(80));

    const contentGenerator = new ContentGeneratorService();

    try {
        const startTime = Date.now();

        // Generate content
        const content = await contentGenerator.generateWebsiteContent(
            profileData,
            provider
        );

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`\n✅ Content generated successfully in ${duration}s\n`);

        // Display generated content
        console.log('📄 HOMEPAGE:');
        console.log(`  Headline: ${content.homepage.headline}`);
        console.log(`  Subheadline: ${content.homepage.subheadline}`);
        console.log(`  Introduction: ${content.homepage.introduction.substring(0, 100)}...`);

        console.log('\n📖 ABOUT:');
        console.log(`  Title: ${content.about.title}`);
        console.log(`  Content: ${content.about.content.substring(0, 150)}...`);

        console.log('\n🛠️ SERVICES:');
        console.log(`  Title: ${content.services.title}`);
        console.log(`  Services count: ${content.services.services.length}`);
        content.services.services.forEach((service, index) => {
            console.log(`  ${index + 1}. ${service.name}`);
        });

        console.log('\n📧 CONTACT:');
        console.log(`  Title: ${content.contact.title}`);
        console.log(`  CTA: ${content.contact.cta}`);

        console.log('\n🔍 SEO:');
        console.log(`  Title: ${content.seo.title}`);
        console.log(`  Description: ${content.seo.description}`);
        console.log(`  Keywords: ${content.seo.keywords.join(', ')}`);

        // Save to file
        const outputDir = path.join(__dirname, '../test-output');
        await fs.mkdir(outputDir, { recursive: true });

        const filename = `${profileData.profession.toLowerCase()}-${provider}-${Date.now()}.json`;
        const filepath = path.join(outputDir, filename);

        await fs.writeFile(filepath, JSON.stringify(content, null, 2), 'utf-8');
        console.log(`\n💾 Content saved to: ${filepath}`);

        return { success: true, content, duration };
    } catch (error: any) {
        console.error(`\n❌ Error generating content:`, error.message);

        // Try fallback content
        console.log('\n🔄 Generating fallback content...');
        const fallbackContent = contentGenerator.generateFallbackContent(profileData);
        console.log('✅ Fallback content generated');

        return { success: false, error: error.message, fallbackContent };
    }
}

async function main() {
    const options = await parseArgs();

    console.log('🚀 AI Content Generation Test Suite');
    console.log('====================================\n');

    // Check for API keys
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    console.log('API Keys Status:');
    console.log(`  Claude: ${hasClaudeKey ? '✅' : '❌ Missing ANTHROPIC_API_KEY'}`);
    console.log(`  OpenAI: ${hasOpenAIKey ? '✅' : '❌ Missing OPENAI_API_KEY'}`);
    console.log(`  Gemini: ${hasGeminiKey ? '✅' : '❌ Missing GEMINI_API_KEY'}\n`);

    if (!hasClaudeKey && !hasOpenAIKey && !hasGeminiKey) {
        console.error('❌ No API keys found. Please set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in your .env file');
        process.exit(1);
    }

    // Select profiles to test
    let profilesToTest = testProfiles;

    if (options.profile && !options.all) {
        const profile = testProfiles.find(
            (p) => p.name.toLowerCase().includes(options.profile!.toLowerCase()) ||
                p.profession.toLowerCase().includes(options.profile!.toLowerCase())
        );

        if (!profile) {
            console.error(`❌ Profile not found: ${options.profile}`);
            console.log('\nAvailable profiles:');
            testProfiles.forEach((p) => console.log(`  - ${p.name} (${p.profession})`));
            process.exit(1);
        }

        profilesToTest = [profile];
    }

    // Run tests
    const results = [];

    for (const profile of profilesToTest) {
        const result = await testContentGeneration(profile, options.provider!);
        results.push({
            profile: profile.name,
            profession: profile.profession,
            provider: options.provider,
            ...result,
        });

        // Wait a bit between requests to avoid rate limiting
        if (profilesToTest.length > 1) {
            console.log('\n⏳ Waiting 2 seconds before next test...\n');
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\nTotal tests: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (successful > 0) {
        const avgDuration = results
            .filter((r) => r.success)
            .reduce((sum, r) => sum + parseFloat(r.duration || '0'), 0) / successful;
        console.log(`⏱️  Average duration: ${avgDuration.toFixed(2)}s`);
    }

    console.log('\n' + '='.repeat(80));

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
