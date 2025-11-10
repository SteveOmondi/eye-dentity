import { Router } from 'express';
import { uploadLogo, uploadProfilePhoto } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Upload logo - protected route
router.post('/logo', authenticate, upload.single('logo'), uploadLogo);

// Upload profile photo - protected route
router.post('/profile-photo', authenticate, upload.single('profilePhoto'), uploadProfilePhoto);

export default router;
