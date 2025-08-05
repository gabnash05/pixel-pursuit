import express from 'express';
import { register, login } from '../controllers/authController.js';
import { submitScan } from '../controllers/scanController.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { getProfile, getPoints } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/scans', authenticateToken, submitScan);
router.get('/leaderboard', getLeaderboard);
router.get('/profile', authenticateToken, getProfile);
router.get('/user/points', authenticateToken, getPoints);

export default router;
