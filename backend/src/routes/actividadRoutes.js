import { Router } from 'express';
import { getByToken, getHistorial, deleteActividad, getReporte, submitScore, getRanking } from '../controllers/actividadController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/token/:token', getByToken);
router.post('/token/:token/score', submitScore);
router.get('/token/:token/ranking', getRanking);

router.get('/historial', authMiddleware, getHistorial);
router.get('/:id/reporte', authMiddleware, getReporte);
router.delete('/:id', authMiddleware, deleteActividad);

export default router;
