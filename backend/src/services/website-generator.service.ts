import { prisma } from '../lib/prisma';
import ContentGenerator, { ProfileData } from './content-generator.service';
import TemplateRenderer, { ColorScheme } from './template-renderer.service';
import DesignEngine from './design-engine.service';
import { deployWebsite } from './deployment.service';
import { sendWebsiteLiveEmail } from './email.service';
import { sendWebsiteLiveNotification } from './telegram.service';
import fs from 'fs/promises';
import path from 'path';

export interface WebsiteGenerationRequest {
  userId: string;
  orderId: string;
  profileData: ProfileData;
  templateId?: string;
  useAIDesign?: boolean;
  colorScheme: ColorScheme;
  domain: string;
}

export interface WebsiteGenerationResult {
  websiteId: string;
  status: 'GENERATED' | 'ERROR';
  deploymentUrl?: string;
  error?: string;
}

/**
 * Main website generation orchestrator
 * This function coordinates the entire website generation workflow
 */
export const generateWebsite = async (
  request: WebsiteGenerationRequest
): Promise<WebsiteGenerationResult> => {
  const { userId, orderId, profileData, templateId, colorScheme, domain, useAIDesign } = request;

  try {
    // 1. Create website record in database with GENERATING status
    const website = await prisma.website.create({
      data: {
        userId,
        templateId: templateId || undefined,
        domain,
        colorScheme: colorScheme as any,
        status: 'GENERATING',
        emailHosting: false, // This will be updated from order data
      },
    });

    console.log(`Starting website generation for ${domain} (Website ID: ${website.id})`);

    try {
      // 2. Generate content using AI
      console.log('Step 1: Generating AI content...');
      // Use the profile data directly
      const extendedProfileData = {
        ...profileData,
        logoUrl: profileData.logoUrl,
        profilePhotoUrl: profileData.profilePhotoUrl
      };

      const generatedContent = await ContentGenerator.generateWebsiteContent(extendedProfileData, 'claude');
      console.log('AI content generated successfully');

      // 2.5 Generate Intent and Design Genome
      console.log('Step 1.5: Generating Design Intent and Genome...');
      const intentInput = `${profileData.profession}. ${profileData.bio || ''}`;
      const intent = await DesignEngine.understandIntent(intentInput);
      const genomeSeed = `${userId}-${domain}-${Date.now()}`;
      const genome = DesignEngine.initializeGenome(genomeSeed);
      const tokens = await DesignEngine.generateTokens(intent, genome);
      const layoutGraph = await DesignEngine.generateLayoutGraph(intent);

      console.log('Design Genome and Tokens generated');

      // 3. Resolve template (use default for AI Forge if none selected)
      const effectiveTemplateId = templateId || (useAIDesign ? 'modern-geometric' : undefined);

      if (!effectiveTemplateId) {
        throw new Error('Template ID is required when AI Forge is not active');
      }

      // 4. Render website by merging content with template
      console.log('Step 3: Rendering website with design system...');
      const renderedWebsite = await TemplateRenderer.renderWebsite({
        templateId: effectiveTemplateId,
        content: generatedContent,
        colorScheme: typeof colorScheme === 'string' ? colorScheme : (colorScheme as any).name || 'default',
        profileData: extendedProfileData,
        designTokens: tokens,
        layoutGraph: layoutGraph
      });

      // 5. Save website files to disk
      console.log('Step 4: Saving website files...');
      const websiteDir = await saveWebsiteFiles(website.id, renderedWebsite, domain);

      // 6. Store generated content in database
      await prisma.website.update({
        where: { id: website.id },
        data: {
          content: generatedContent as any,
          intent: intent as any,
          genome: genome as any,
          tokens: tokens as any,
          layoutGraph: layoutGraph as any,
          genomeSeed,
          status: 'GENERATED',
          updatedAt: new Date(),
        } as any,
      });

      console.log(`Website generation completed for ${domain}`);

      // 7. Get hosting plan from order (for deployment configuration)
      let hostingPlan = 'basic';
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });
        if (order) {
          hostingPlan = order.hostingPlan;
        }
      }

      // 8. Deploy website
      console.log('Step 5: Deploying website...');
      const deploymentResult = await deployWebsite({
        websiteId: website.id,
        domain,
        sourceDir: websiteDir,
        hostingPlan: hostingPlan as 'basic' | 'pro' | 'premium',
      });

      console.log(`Website deployment ${deploymentResult.success ? 'successful' : 'failed'} for ${domain}`);

      // 9. Send notifications if deployment successful
      if (deploymentResult.success && deploymentResult.deploymentUrl) {
        // Get user details for notifications
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          // Send email to customer
          await sendWebsiteLiveEmail(user.email, user.name || 'Customer', {
            domain,
            deploymentUrl: deploymentResult.deploymentUrl,
          });

          // Send Telegram notification to admin
          await sendWebsiteLiveNotification({
            domain,
            userEmail: user.email,
            deploymentUrl: deploymentResult.deploymentUrl,
          });
        }
      }

      return {
        websiteId: website.id,
        status: 'GENERATED',
        deploymentUrl: deploymentResult.deploymentUrl || `/sites/${domain}`,
      };
    } catch (error: any) {
      // Update website status to ERROR
      await prisma.website.update({
        where: { id: website.id },
        data: {
          status: 'ERROR',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Website generation failed:', error);
    return {
      websiteId: '',
      status: 'ERROR',
      error: error.message || 'Unknown error occurred',
    };
  }
};

/**
 * Save website files to disk
 */
async function saveWebsiteFiles(
  _websiteId: string,
  renderedWebsite: any,
  domain: string
): Promise<string> {
  // Create website directory
  const websitesDir = path.join(__dirname, '../../websites');
  const websiteDir = path.join(websitesDir, domain);

  // Ensure directories exist
  await fs.mkdir(websitesDir, { recursive: true });
  await fs.mkdir(websiteDir, { recursive: true });

  // Save HTML file
  await fs.writeFile(
    path.join(websiteDir, 'index.html'),
    renderedWebsite.html,
    'utf-8'
  );

  // Save CSS file
  await fs.writeFile(
    path.join(websiteDir, 'styles.css'),
    renderedWebsite.css,
    'utf-8'
  );

  // Create assets directory if there are assets
  // Note: RenderedWebsite from TemplateRenderer doesn't currently return assets object like the old one,
  // but we can assume we might need to handle logo/photo copying if we were doing that.
  // The old code checked renderedWebsite.assets.
  const assetsDir = path.join(websiteDir, 'assets');
  await fs.mkdir(assetsDir, { recursive: true });

  console.log(`Website files saved to: ${websiteDir}`);
  return websiteDir;
}

/**
 * Get website generation status
 */
export const getWebsiteStatus = async (websiteId: string) => {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
  });

  if (!website) {
    throw new Error('Website not found');
  }

  return website;
};

/**
 * Regenerate website (for updates or fixes)
 */
export const regenerateWebsite = async (websiteId: string): Promise<WebsiteGenerationResult> => {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      template: true,
    },
  });

  if (!website) {
    throw new Error('Website not found');
  }

  if (!website.user.profile) {
    throw new Error('User profile not found');
  }

  // Update status to GENERATING
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'GENERATING' },
  });

  // Prepare profile data
  const profileData: ProfileData = {
    name: website.user.name || '',
    email: website.user.email,
    profession: website.user.profile.profession,
    bio: website.user.profile.bio || undefined,
    phone: website.user.profile.phone || undefined,
    services: website.user.profile.services as string[] || [],
    logoUrl: website.user.profile.logoUrl || undefined,
    profilePhotoUrl: website.user.profile.profilePhotoUrl || undefined,
  };

  // Generate website
  return generateWebsite({
    userId: website.userId,
    orderId: '', // No order for regeneration
    profileData,
    templateId: website.templateId,
    colorScheme: website.colorScheme as unknown as ColorScheme,
    domain: website.domain,
  });
};

/**
 * Delete website and its files
 */
export const deleteWebsite = async (websiteId: string): Promise<void> => {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
  });

  if (!website) {
    throw new Error('Website not found');
  }

  // Delete website files
  const websiteDir = path.join(__dirname, '../../websites', website.domain);
  try {
    await fs.rm(websiteDir, { recursive: true, force: true });
    console.log(`Deleted website files: ${websiteDir}`);
  } catch (error) {
    console.error('Failed to delete website files:', error);
  }

  // Delete from database
  await prisma.website.delete({
    where: { id: websiteId },
  });
};

/**
 * Iterate on website design based on user feedback
 */
export const iterateWebsite = async (
  websiteId: string,
  feedback: string
): Promise<WebsiteGenerationResult> => {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!website) {
    throw new Error('Website not found');
  }

  // Update status to GENERATING
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'GENERATING' },
  });

  console.log(`Iterating on website ${website.domain} with feedback: ${feedback}`);

  // 1. Load existing state
  const intent = website.intent as any;
  const genome = website.genome as any;
  const profileData: ProfileData = {
    name: website.user.name || '',
    email: website.user.email,
    profession: website.user.profile?.profession || 'Professional',
    bio: website.user.profile?.bio || undefined,
    logoUrl: website.user.profile?.logoUrl || undefined,
    profilePhotoUrl: website.user.profile?.profilePhotoUrl || undefined,
  };

  // 2. Mutate Genome based on feedback
  // In a full implementation, we'd use AI to determine the delta.
  // For now, we'll suggest common mutations or use AI to get the delta.
  const prompt = `Based on this feedback: "${feedback}", what attributes of the design genome should change?
  Current Genome: ${JSON.stringify(genome)}
  Available attributes: contrastBias, roundness, whitespacePreference, fontModernity, motionTolerance.
  Return ONLY a JSON delta (e.g., {"contrastBias": 0.8}).`;

  const deltaResponse = await DesignEngine.understandIntent(prompt); // Reusing intent logic for simplicity
  const delta = typeof deltaResponse === 'object' ? deltaResponse : {};

  const updatedGenome = DesignEngine.mutateGenome(genome, delta);

  // 3. Regenerate tokens and layout
  const tokens = await DesignEngine.generateTokens(intent, updatedGenome);
  const layoutGraph = await DesignEngine.generateLayoutGraph(intent);

  // 4. Render and Save
  const renderedWebsite = await TemplateRenderer.renderWebsite({
    templateId: website.templateId,
    content: website.content as any,
    colorScheme: typeof website.colorScheme === 'string' ? website.colorScheme : 'default',
    profileData,
    designTokens: tokens,
    layoutGraph
  });

  await saveWebsiteFiles(website.id, renderedWebsite, website.domain);

  // 5. Update DB
  await prisma.website.update({
    where: { id: website.id },
    data: {
      genome: updatedGenome as any,
      tokens: tokens as any,
      layoutGraph: layoutGraph as any,
      status: 'GENERATED',
      updatedAt: new Date(),
    } as any,
  });

  return {
    websiteId: website.id,
    status: 'GENERATED',
  };
};
