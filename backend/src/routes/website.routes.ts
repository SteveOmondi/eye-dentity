import { Router } from 'express';
import {
  triggerWebsiteGeneration,
  getWebsite,
  getUserWebsites,
  regenerateWebsiteHandler,
  deleteWebsiteHandler,
} from '../controllers/website.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/websites/generate
 * @desc    Trigger website generation
 * @access  Private
 */
router.post('/generate', authenticate, triggerWebsiteGeneration);

/**
 * @route   GET /api/websites/:websiteId
 * @desc    Get website details
 * @access  Private
 */
router.get('/:websiteId', authenticate, getWebsite);

/**
 * @route   GET /api/websites
 * @desc    Get all websites for authenticated user
 * @access  Private
 */
router.get('/', authenticate, getUserWebsites);

/**
 * @route   POST /api/websites/:websiteId/regenerate
 * @desc    Regenerate website
 * @access  Private
 */
router.post('/:websiteId/regenerate', authenticate, regenerateWebsiteHandler);

/**
 * @route   DELETE /api/websites/:websiteId
 * @desc    Delete website
 * @access  Private
 */
router.delete('/:websiteId', authenticate, deleteWebsiteHandler);

export default router;
