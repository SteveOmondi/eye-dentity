import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export interface DeploymentConfig {
  websiteId: string;
  domain: string;
  sourceDir: string;
  hostingPlan: 'basic' | 'pro' | 'premium';
}

export interface DeploymentResult {
  success: boolean;
  deploymentUrl?: string;
  ipAddress?: string;
  error?: string;
}

/**
 * Deploy website to static hosting
 * For development: Serves from local filesystem
 * For production: Can be extended to deploy to DigitalOcean, Netlify, etc.
 */
export const deployWebsite = async (config: DeploymentConfig): Promise<DeploymentResult> => {
  const { websiteId, domain, sourceDir, hostingPlan } = config;

  try {
    console.log(`Starting deployment for ${domain}...`);

    // Update website status to DEPLOYING
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'DEPLOYING' },
    });

    // Step 1: Validate source directory exists
    const sourcePath = path.resolve(sourceDir);
    await fs.access(sourcePath);

    // Step 2: Create deployment directory (simulates CDN/hosting)
    const deploymentDir = path.join(__dirname, '../../deployments', domain);
    await fs.mkdir(deploymentDir, { recursive: true });

    // Step 3: Copy website files to deployment directory
    await copyDirectory(sourcePath, deploymentDir);

    // Step 4: Create nginx-style config (for future use)
    const nginxConfig = generateNginxConfig(domain, deploymentDir);
    await fs.writeFile(
      path.join(deploymentDir, 'nginx.conf'),
      nginxConfig,
      'utf-8'
    );

    // Step 5: Generate deployment manifest
    const manifest = {
      domain,
      websiteId,
      hostingPlan,
      deployedAt: new Date().toISOString(),
      files: await getFileList(deploymentDir),
    };

    await fs.writeFile(
      path.join(deploymentDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    // Step 6: Simulate deployment URL (in production, this would be actual URL)
    const deploymentUrl = `http://localhost:8080/${domain}`;
    const ipAddress = '127.0.0.1'; // In production, this would be droplet IP

    // Step 7: Update website status to LIVE
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: 'LIVE',
        deploymentUrl,
        dropletIp: ipAddress,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ Deployment successful for ${domain}`);
    console.log(`   Deployment URL: ${deploymentUrl}`);

    return {
      success: true,
      deploymentUrl,
      ipAddress,
    };
  } catch (error: any) {
    console.error(`❌ Deployment failed for ${domain}:`, error);

    // Update website status to ERROR
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        status: 'ERROR',
        errorMessage: `Deployment failed: ${error.message}`,
      },
    });

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Undeploy website (cleanup)
 */
export const undeployWebsite = async (websiteId: string): Promise<void> => {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
  });

  if (!website) {
    throw new Error('Website not found');
  }

  // Delete deployment directory
  const deploymentDir = path.join(__dirname, '../../deployments', website.domain);
  try {
    await fs.rm(deploymentDir, { recursive: true, force: true });
    console.log(`Deleted deployment directory: ${deploymentDir}`);
  } catch (error) {
    console.error('Failed to delete deployment directory:', error);
  }

  // Update website status
  await prisma.website.update({
    where: { id: websiteId },
    data: {
      status: 'GENERATED',
      deploymentUrl: null,
      dropletIp: null,
      publishedAt: null,
    },
  });
};

/**
 * Check deployment health
 */
export const checkDeploymentHealth = async (websiteId: string): Promise<boolean> => {
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
  });

  if (!website || !website.deploymentUrl) {
    return false;
  }

  // Check if deployment directory exists
  const deploymentDir = path.join(__dirname, '../../deployments', website.domain);
  try {
    await fs.access(deploymentDir);
    await fs.access(path.join(deploymentDir, 'index.html'));
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get deployment logs
 */
export const getDeploymentLogs = async (websiteId: string): Promise<string[]> => {
  // In production, this would fetch logs from deployment system
  // For now, return mock logs
  return [
    `[${new Date().toISOString()}] Deployment started`,
    `[${new Date().toISOString()}] Files copied to deployment directory`,
    `[${new Date().toISOString()}] Nginx configuration generated`,
    `[${new Date().toISOString()}] Deployment completed successfully`,
  ];
};

/**
 * Copy directory recursively
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Get list of files in directory
 */
async function getFileList(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function scan(currentDir: string, basePath: string = '') {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        await scan(path.join(currentDir, entry.name), relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }

  await scan(dir);
  return files;
}

/**
 * Generate Nginx configuration
 */
function generateNginxConfig(domain: string, rootPath: string): string {
  return `# Nginx configuration for ${domain}
server {
    listen 80;
    server_name ${domain} www.${domain};

    root ${rootPath};
    index index.html;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
}

# HTTPS redirect (when SSL is configured)
# server {
#     listen 443 ssl http2;
#     server_name ${domain} www.${domain};
#
#     ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
#
#     root ${rootPath};
#     index index.html;
#
#     # ... same configuration as above ...
# }
`;
}
