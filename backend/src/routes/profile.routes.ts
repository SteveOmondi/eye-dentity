import { Router } from 'express';
import {
  createProfile,
  updateProfile,
  getProfile,
  getProfileById,
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication
router.post('/', authenticate, createProfile);
router.put('/', authenticate, updateProfile);
router.get('/me', authenticate, getProfile);
router.get('/:userId', authenticate, getProfileById);

export default router;
