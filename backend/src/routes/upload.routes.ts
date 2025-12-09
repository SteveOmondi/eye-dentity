import { Router } from 'express';
import { uploadLogo, uploadProfilePhoto } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Upload logo - allow anonymous uploads for website builder
// In production, you might want to add rate limiting instead
router.post('/logo', upload.single('logo'), uploadLogo);

// Upload profile photo - allow anonymous uploads for website builder  
// In production, you might want to add rate limiting instead
router.post('/profile-photo', upload.single('profilePhoto'), uploadProfilePhoto);

export default router;
