import { db } from '../database.js';

export const getByToken = (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Buscar actividad por tokenCorto o por ID completo
    const actividad = db.actividades.find(a => a.tokenCorto === token || a.id === token);
    
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.status(200).json({
      id: actividad.id,
      tipoMotor: actividad.tipoMotor,
      data: actividad.dataIa,
      titulo: actividad.titulo,
      descripcion: actividad.descripcion
    });
  } catch (error) {
    next(error);
  }
};

export const getHistorial = (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const historial = db.actividades
      .filter(a => a.usuarioId === userId)
      .map(a => ({
        id: a.id,
        titulo: a.titulo,
        tipoMotor: a.tipoMotor,
        createdAt: a.createdAt,
        tokenCorto: a.tokenCorto
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      data: historial,
      total: historial.length,
      page: 1,
      limit: 10
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActividad = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const index = db.actividades.findIndex(a => a.id === id && a.usuarioId === userId);
    
    if (index !== -1) {
      db.actividades.splice(index, 1);
    }
    
    res.status(200).json({ message: 'Actividad eliminada' });
  } catch (error) {
    next(error);
  }
};
