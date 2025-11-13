import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  exportResume,
  exportCompanyProfile,
  exportWebsite,
  exportUserData,
  getResumeTemplates,
} from '../controllers/export.controller';

const router = express.Router();

// All export routes require authentication
router.use(authenticate);

// Resume export
router.get('/resume/:userId', exportResume);
router.post('/resume/:userId', exportResume);

// Company profile export
router.get('/company-profile/:userId', exportCompanyProfile);

// Website files export
router.get('/website/:websiteId', exportWebsite);

// User data export
router.get('/data/:userId', exportUserData);

// Get available resume templates
router.get('/resume-templates', getResumeTemplates);

export default router;
