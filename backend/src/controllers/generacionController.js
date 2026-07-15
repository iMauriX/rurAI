import { db } from '../database.js';
import { generateUniqueToken } from '../services/tokenService.js';
import { generateMockContent } from '../services/iaService.js';

export const generar = async (req, res, next) => {
  try {
    const { temaId, motor, params } = req.body;
    const user = req.user;

    // Check freemium limits
    if (user.generacionesMes >= 15) {
      return res.status(403).json({ error: 'Límite de generaciones mensuales alcanzado' });
    }

    const tema = db.temas.find(t => t.id === temaId);
    if (!tema) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    // Simulamos que si ya generó una actividad exacta, devolvemos del cache
    // Para el MVP, simplemente buscamos si hay una del mismo tema, motor y usuario
    const existente = db.actividades.find(a => 
      a.temaId === temaId && 
      a.tipoMotor === motor && 
      a.usuarioId === user.id
    );

    if (existente) {
      return res.status(200).json({
        actividadId: existente.id,
        tipoMotor: existente.tipoMotor,
        data: existente.dataIa,
        token: existente.tokenCorto,
        cache: true
      });
    }

    // Generar nuevo contenido (simulación de latencia de IA)
    const dataIa = await generateMockContent(motor, params);

    // Incrementar límite de usuario
    user.generacionesMes += 1;

    // Crear nueva actividad
    const nuevaActividad = {
      id: `act-${db.actividades.length + 1}-${Date.now()}`,
      temaId: tema.id,
      tipoMotor: motor,
      usuarioId: user.id,
      tokenCorto: generateUniqueToken(db.actividades),
      titulo: `${tema.nombre} en acción`,
      descripcion: `Juego de tipo ${motor} para aprender ${tema.nombre}`,
      dataIa,
      createdAt: new Date().toISOString()
    };

    db.actividades.push(nuevaActividad);

    res.status(200).json({
      actividadId: nuevaActividad.id,
      tipoMotor: motor,
      data: dataIa,
      token: nuevaActividad.tokenCorto,
      cache: false
    });
  } catch (error) {
    next(error);
  }
};
