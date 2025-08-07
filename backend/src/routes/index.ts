import express from 'express';
import { register, login } from '../controllers/authController.js';
import { submitScan } from '../controllers/scanController.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { getProfile, getPoints } from '../controllers/profileController.js';
import { createAdminAccount, generateQrStrings } from '../controllers/adminController.js';

import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/admin/create', createAdminAccount);
router.post('/admin/generate-qr-strings', authenticateToken, requireAdmin, generateQrStrings);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/scan', authenticateToken, submitScan);
router.get('/leaderboard', authenticateToken, getLeaderboard);
router.get('/profile', authenticateToken, getProfile);
router.get('/profile/points', authenticateToken, getPoints);

export default router;
