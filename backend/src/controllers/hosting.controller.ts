import { Request, Response } from 'express';
import { HOSTING_PLANS } from '../data/hosting-plans';

export const getHostingPlans = async (req: Request, res: Response) => {
  try {
    res.json({
      plans: HOSTING_PLANS,
      message: 'Hosting plans retrieved successfully',
    });
  } catch (error) {
    console.error('Get hosting plans error:', error);
    res.status(500).json({ error: 'Failed to retrieve hosting plans' });
  }
};

export const getHostingPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plan = HOSTING_PLANS.find((p) => p.id === id);

    if (!plan) {
      return res.status(404).json({ error: 'Hosting plan not found' });
    }

    res.json({
      plan,
      message: 'Hosting plan retrieved successfully',
    });
  } catch (error) {
    console.error('Get hosting plan error:', error);
    res.status(500).json({ error: 'Failed to retrieve hosting plan' });
  }
};
