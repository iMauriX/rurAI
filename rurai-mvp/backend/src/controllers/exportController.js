import { db } from '../database.js';
import { generateDocx } from '../services/exportService.js';

export const exportar = async (req, res, next) => {
  try {
    const { actividadId } = req.params;
    const user = req.user;

    const actividad = db.actividades.find(a => a.id === actividadId && a.usuarioId === user.id);
    
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    const docxBuffer = await generateDocx(actividad);

    res.setHeader('Content-Disposition', `attachment; filename="${actividad.titulo.replace(/\s+/g, '_')}.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    res.send(docxBuffer);
  } catch (error) {
    next(error);
  }
};
