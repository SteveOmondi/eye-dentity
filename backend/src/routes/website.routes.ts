import { Router } from 'express';
import {
  triggerWebsiteGeneration,
  getWebsite,
  getUserWebsites,
  regenerateWebsiteHandler,
  iterateWebsiteHandler,
  deleteWebsiteHandler,
} from '../controllers/website.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/websites/preview
 * @desc    Generate a preview of the website
 * @access  Public
 */
import { generatePreview } from '../controllers/website.controller';
router.post('/preview', generatePreview);

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

router.post('/:websiteId/regenerate', authenticate, regenerateWebsiteHandler);

/**
 * @route   POST /api/websites/:websiteId/iterate
 * @desc    Iterate on website design based on feedback
 * @access  Private
 */
router.post('/:websiteId/iterate', authenticate, iterateWebsiteHandler);

/**
 * @route   DELETE /api/websites/:websiteId
 * @desc    Delete website
 * @access  Private
 */
router.delete('/:websiteId', authenticate, deleteWebsiteHandler);

export default router;
