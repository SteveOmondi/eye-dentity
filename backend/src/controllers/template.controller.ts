import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTemplatesByProfession = async (req: Request, res: Response) => {
  try {
    const { profession } = req.params;

    // Map professions to template categories
    const categoryMap: Record<string, string> = {
      lawyer: 'professional',
      consultant: 'professional',
      accountant: 'professional',
      doctor: 'healthcare',
      dentist: 'healthcare',
      therapist: 'healthcare',
      designer: 'creative',
      photographer: 'creative',
      artist: 'creative',
    };

    const category = categoryMap[profession.toLowerCase()] || 'professional';

    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
        category,
      },
    });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates by profession error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
