import { Router } from 'express';
import {
  getAllTemplates,
  getTemplateById,
  getTemplatesByProfession,
} from '../controllers/template.controller';

const router = Router();

// Public routes - no authentication required for browsing templates
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.get('/profession/:profession', getTemplatesByProfession);

export default router;
