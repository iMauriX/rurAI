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

export const getReporte = (req, res, next) => {
  try {
    const { id } = req.params;
    const actividad = db.actividades.find(a => a.id === id);
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Usar el ID como semilla para consistencia en las recargas
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalPartidas = (hash % 15) + 12; // 12 a 26 partidas
    const puntajePromedio = (hash % 21) + 70; // 70% a 90%
    const tasaFinalizacion = (hash % 16) + 80; // 80% a 95%
    const tiempoPromedio = `${(hash % 3) + 3}m ${(hash % 60)}s`;

    const estudiantes = [
      { nombre: 'Luis Choque', fecha: '2026-07-18', aciertos: '4/5', tiempo: '3m 42s' },
      { nombre: 'María Apaza', fecha: '2026-07-18', aciertos: '5/5', tiempo: '2m 58s' },
      { nombre: 'Jean Flores', fecha: '2026-07-17', aciertos: '3/5', tiempo: '4m 15s' },
      { nombre: 'Diana Quispe', fecha: '2026-07-17', aciertos: '5/5', tiempo: '3m 10s' },
      { nombre: 'Carlos Mamani', fecha: '2026-07-16', aciertos: '4/5', tiempo: '3m 55s' }
    ];

    res.status(200).json({
      actividadId: id,
      metrics: {
        totalPartidas,
        puntajePromedio: `${puntajePromedio}%`,
        tasaFinalizacion: `${tasaFinalizacion}%`,
        tiempoPromedio
      },
      estudiantes
    });
  } catch (error) {
    next(error);
  }
};
