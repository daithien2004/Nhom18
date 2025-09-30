import express from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
  getUserStatus,
  getOtherUserProfile,
} from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import multer from 'multer';
import { validateBody } from '../middlewares/validation.js';
import { updateUserSchema } from '../schemas/authSchemas.js';

const router = express.Router();

// RESTful user routes
router.get('/me', auth, getProfile);
router.put('/me', validateBody(updateUserSchema), auth, updateProfile);
router.get('/:userId', auth, getOtherUserProfile);

// multer lưu file tạm vào uploads/
const upload = multer({ dest: 'uploads/' });

router.put('/me/avatar', auth, upload.single('avatar'), updateAvatar);
router.put('/me/cover', auth, upload.single('coverPhoto'), updateCoverPhoto);
router.get('/:userId/status', auth, getUserStatus);

export default router;
