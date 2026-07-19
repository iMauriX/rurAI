import { Router } from 'express';
import multer from 'multer';
import { generar, uploadPdf } from '../controllers/generacionController.js';
import { authMiddleware } from '../middlewares/auth.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/', authMiddleware, generar);
router.post('/upload-pdf', authMiddleware, upload.single('file'), uploadPdf);

export default router;
