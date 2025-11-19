import { Router } from 'express';
import { checkAvailability, suggestDomains } from '../controllers/domain.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Domain routes - require authentication
router.post('/check-availability', authenticate, checkAvailability);
router.post('/suggest', authenticate, suggestDomains);

export default router;
