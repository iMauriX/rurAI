import { Router } from 'express';
import { generar } from '../controllers/generacionController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/', authMiddleware, generar);

export default router;
