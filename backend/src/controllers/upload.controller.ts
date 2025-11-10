import { Request, Response } from 'express';

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, you would upload this to DigitalOcean Spaces or S3
    // For now, we'll just return the local file path
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Business logo uploaded successfully',
      type: 'logo',
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, you would upload this to DigitalOcean Spaces or S3
    // For now, we'll just return the local file path
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Profile photo uploaded successfully',
      type: 'profilePhoto',
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};
