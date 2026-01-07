import { Request, Response } from 'express';
import ProfileDiscovery from '../services/profile-discovery.service';
import fs from 'fs/promises';

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      message: 'Business logo uploaded successfully',
      type: 'logo',
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      message: 'Profile photo uploaded successfully',
      type: 'profilePhoto',
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
};

export const parseResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const { provider = 'gemini' } = req.body;

    // 1. Extract text
    const text = await ProfileDiscovery.extractTextFromFile(req.file.path, req.file.mimetype);

    // 2. Parse with AI
    const profileData = await ProfileDiscovery.parseProfileData(text, provider);

    // 3. Cleanup: Delete the uploaded file after processing
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary resume file:', unlinkError);
    }

    return res.json({
      message: 'Resume parsed successfully',
      profileData
    });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse resume' });
  }
};
