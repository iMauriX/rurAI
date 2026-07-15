import { Router } from 'express';
import { getByToken, getHistorial, deleteActividad } from '../controllers/actividadController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/token/:token', getByToken);
router.get('/historial', authMiddleware, getHistorial);
router.delete('/:id', authMiddleware, deleteActividad);

export default router;
