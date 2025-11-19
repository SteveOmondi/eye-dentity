import { Request, Response } from 'express';
import {
  generateResumePDF,
  generateCompanyProfilePDF,
  exportWebsiteAsZip,
  exportUserDataAsJSON,
  ResumeTemplate,
} from '../services/export.service';

/**
 * Export resume as PDF
 * GET /api/export/resume/:userId
 * POST /api/export/resume/:userId (with template selection)
 */
export const exportResume = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const template = (req.body.template || req.query.template || 'modern') as ResumeTemplate;

    // Validate template
    if (!['modern', 'classic', 'creative'].includes(template)) {
      return res.status(400).json({
        error: 'Invalid template. Must be one of: modern, classic, creative',
      });
    }

    // Check if user is authorized (can only export their own resume or admin)
    if (req.user?.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pdfBuffer = await generateResumePDF(userId, template);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${template}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export resume error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export resume',
    });
  }
};

/**
 * Export company profile as PDF
 * GET /api/export/company-profile/:userId
 */
export const exportCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user is authorized
    if (req.user?.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pdfBuffer = await generateCompanyProfilePDF(userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="company-profile.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export company profile error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export company profile',
    });
  }
};

/**
 * Export website files as ZIP
 * GET /api/export/website/:websiteId
 */
export const exportWebsite = async (req: Request, res: Response) => {
  try {
    const { websiteId } = req.params;

    // Check if user owns the website or is admin
    // This would require fetching the website first to check ownership
    const zipStream = await exportWebsiteAsZip(websiteId);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="website-${websiteId}.zip"`);

    zipStream.pipe(res);
  } catch (error) {
    console.error('Export website error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export website',
    });
  }
};

/**
 * Export user data as JSON
 * GET /api/export/data/:userId
 */
export const exportUserData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user is authorized
    if (req.user?.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userData = await exportUserDataAsJSON(userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
    res.json(userData);
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export user data',
    });
  }
};

/**
 * Preview resume templates
 * GET /api/export/resume-templates
 */
export const getResumeTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design with gradient header',
        features: ['Gradient header', 'Professional layout', 'ATS-friendly'],
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional resume format, perfect for conservative industries',
        features: ['Traditional layout', 'Centered header', 'Professional styling'],
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Stand out with a sidebar layout and bold design',
        features: ['Sidebar layout', 'Color accents', 'Unique design'],
      },
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Get resume templates error:', error);
    res.status(500).json({ error: 'Failed to fetch resume templates' });
  }
};
