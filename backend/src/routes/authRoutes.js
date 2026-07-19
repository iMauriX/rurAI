import { Router } from 'express';
import { register, login, refresh, getProfile, updateProfile, updatePlan } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/profile/plan', authMiddleware, updatePlan);

export default router;
