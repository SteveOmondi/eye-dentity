import { Router } from 'express';
import { getHostingPlans, getHostingPlanById } from '../controllers/hosting.controller';

const router = Router();

// Public routes - anyone can view hosting plans
router.get('/', getHostingPlans);
router.get('/:id', getHostingPlanById);

export default router;
