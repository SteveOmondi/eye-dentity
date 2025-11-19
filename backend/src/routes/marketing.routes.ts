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
  getLinkedInAuthorizationUrl,
  handleLinkedInCallback,
  getGoogleAdsAuthorizationUrl,
  handleGoogleAdsCallback,
  getKeywordSuggestions,
  launchMultiChannelCampaignController,
  getCrossChannelPerformanceController,
  autoReallocateBudgetController,
  pauseUnderperformingController,
  getSEOMetaTags,
  getSchemaMarkup,
  getLocationContent,
  analyzeSEOController,
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

/**
 * LinkedIn Integration Routes
 */

/**
 * @route   GET /api/marketing/linkedin/auth-url
 * @desc    Get LinkedIn OAuth authorization URL
 * @access  Private
 */
router.get('/linkedin/auth-url', getLinkedInAuthorizationUrl);

/**
 * @route   POST /api/marketing/linkedin/callback
 * @desc    Handle LinkedIn OAuth callback
 * @access  Private
 */
router.post('/linkedin/callback', handleLinkedInCallback);

/**
 * Google Ads Integration Routes
 */

/**
 * @route   GET /api/marketing/google-ads/auth-url
 * @desc    Get Google Ads OAuth authorization URL
 * @access  Private
 */
router.get('/google-ads/auth-url', getGoogleAdsAuthorizationUrl);

/**
 * @route   POST /api/marketing/google-ads/callback
 * @desc    Handle Google Ads OAuth callback
 * @access  Private
 */
router.post('/google-ads/callback', handleGoogleAdsCallback);

/**
 * @route   POST /api/marketing/google-ads/keywords
 * @desc    Get keyword suggestions for Google Ads campaigns
 * @access  Private
 */
router.post('/google-ads/keywords', getKeywordSuggestions);

/**
 * Cross-Channel Campaign Management Routes
 */

/**
 * @route   POST /api/marketing/cross-channel/launch
 * @desc    Launch multi-channel campaign across Meta, LinkedIn, and Google Ads
 * @access  Private
 */
router.post('/cross-channel/launch', launchMultiChannelCampaignController);

/**
 * @route   GET /api/marketing/cross-channel/performance/:websiteId
 * @desc    Get cross-channel performance comparison
 * @access  Private
 */
router.get('/cross-channel/performance/:websiteId', getCrossChannelPerformanceController);

/**
 * @route   POST /api/marketing/cross-channel/reallocate/:websiteId
 * @desc    Trigger automatic budget reallocation based on performance
 * @access  Private
 */
router.post('/cross-channel/reallocate/:websiteId', autoReallocateBudgetController);

/**
 * @route   POST /api/marketing/cross-channel/pause-underperforming/:websiteId
 * @desc    Pause underperforming campaigns automatically
 * @access  Private
 */
router.post('/cross-channel/pause-underperforming/:websiteId', pauseUnderperformingController);

/**
 * SEO Optimization Routes
 */

/**
 * @route   POST /api/marketing/seo/meta-tags
 * @desc    Generate SEO meta tags for website
 * @access  Private
 */
router.post('/seo/meta-tags', getSEOMetaTags);

/**
 * @route   POST /api/marketing/seo/schema
 * @desc    Generate Schema.org markup for website
 * @access  Private
 */
router.post('/seo/schema', getSchemaMarkup);

/**
 * @route   POST /api/marketing/seo/location-content
 * @desc    Generate location-specific SEO content
 * @access  Private
 */
router.post('/seo/location-content', getLocationContent);

/**
 * @route   GET /api/marketing/seo/analyze/:websiteId
 * @desc    Analyze website SEO and provide recommendations
 * @access  Private
 */
router.get('/seo/analyze/:websiteId', analyzeSEOController);

export default router;
