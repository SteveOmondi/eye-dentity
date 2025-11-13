import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMetaAuthorizationUrl,
  handleMetaCallback,
  createMarketingCampaign,
  getCampaigns,
  updateCampaignStatusController,
  generateContent,
  generateCalendar,
  getBudgetStatusController,
  updateCampaignBudget,
  getBudgetRecommendationsController,
  enforceBudgetLimitsController,
  getMetaPixel,
} from '../controllers/marketing.controller';

const router = Router();

// All marketing routes require authentication
router.use(authenticate);

/**
 * Meta Integration Routes
 */

/**
 * @route   GET /api/marketing/meta/auth-url
 * @desc    Get Meta OAuth authorization URL
 * @access  Private
 */
router.get('/meta/auth-url', getMetaAuthorizationUrl);

/**
 * @route   POST /api/marketing/meta/callback
 * @desc    Handle Meta OAuth callback
 * @access  Private
 */
router.post('/meta/callback', handleMetaCallback);

/**
 * @route   GET /api/marketing/meta/pixel/:websiteId
 * @desc    Get Meta Pixel code for website
 * @access  Private
 */
router.get('/meta/pixel/:websiteId', getMetaPixel);

/**
 * Campaign Management Routes
 */

/**
 * @route   POST /api/marketing/campaigns
 * @desc    Create a new marketing campaign
 * @access  Private
 */
router.post('/campaigns', createMarketingCampaign);

/**
 * @route   GET /api/marketing/campaigns/:websiteId
 * @desc    Get all campaigns for a website
 * @access  Private
 */
router.get('/campaigns/:websiteId', getCampaigns);

/**
 * @route   PUT /api/marketing/campaigns/:campaignId/status
 * @desc    Update campaign status (active/paused/completed)
 * @access  Private
 */
router.put('/campaigns/:campaignId/status', updateCampaignStatusController);

/**
 * Content Generation Routes
 */

/**
 * @route   POST /api/marketing/content/generate
 * @desc    Generate social media content using AI
 * @access  Private
 */
router.post('/content/generate', generateContent);

/**
 * @route   POST /api/marketing/content/calendar
 * @desc    Generate weekly content calendar
 * @access  Private
 */
router.post('/content/calendar', generateCalendar);

/**
 * Budget Management Routes
 */

/**
 * @route   GET /api/marketing/budget/:websiteId
 * @desc    Get budget status and spending forecast
 * @access  Private
 */
router.get('/budget/:websiteId', getBudgetStatusController);

/**
 * @route   PUT /api/marketing/budget/:campaignId
 * @desc    Update campaign budget
 * @access  Private
 */
router.put('/budget/:campaignId', updateCampaignBudget);

/**
 * @route   GET /api/marketing/budget/:websiteId/recommendations
 * @desc    Get budget optimization recommendations
 * @access  Private
 */
router.get('/budget/:websiteId/recommendations', getBudgetRecommendationsController);

/**
 * @route   POST /api/marketing/budget/:websiteId/enforce
 * @desc    Manually enforce budget limits (pause campaigns if needed)
 * @access  Private
 */
router.post('/budget/:websiteId/enforce', enforceBudgetLimitsController);

export default router;
