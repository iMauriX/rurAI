import { Router } from 'express';
import { exportar } from '../controllers/exportController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/:actividadId', authMiddleware, exportar);

export default router;
