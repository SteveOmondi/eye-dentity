import { Router } from 'express';
import { uploadLogo } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Upload logo - protected route
router.post('/logo', authenticate, upload.single('logo'), uploadLogo);

export default router;
