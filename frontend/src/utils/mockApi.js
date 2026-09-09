import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import api from './api';
import { 
  getUserByEmail, 
  getUserById, 
  addUser,
  updateUserPlan,
  getActividades,
  getActivityById,
  getActivityByToken,
  addActivity,
  deleteActivity,
  getTemas,
  addScore,
  generateMockIaData
} from './mockDB';

// Configurar mock para la instancia 'api' y para axios global (por si acaso)
const mockApi = new MockAdapter(api, { delayResponse: 500 });
const mockGlobal = new MockAdapter(axios, { delayResponse: 500 });

const parseData = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

const getUserIdFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const clean = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (clean.startsWith('fake-jwt-token-')) {
    return clean.replace('fake-jwt-token-', '');
  }
  return clean;
};

const setupMocks = (mock) => {
  // AUTH
  mock.onPost(/\/auth\/login/).reply(config => {
    const { correo, password } = parseData(config.data);
    const user = getUserByEmail(correo);
    if (user && user.password === password) {
      return [200, {
        accessToken: 'fake-jwt-token-' + user.id,
        refreshToken: 'fake-refresh-token',
        user: { id: user.id, nombre: user.nombre, correo: user.correo, plan: user.plan }
      }];
    }
    return [401, { error: 'Credenciales inválidas' }];
  });

  mock.onPost(/\/auth\/register/).reply(config => {
    const data = parseData(config.data);
    const { nombre, apellido, correo, password } = data;
    if (!nombre || !correo || !password) {
      return [400, { error: 'Faltan datos requeridos' }];
    }
    const exists = getUserByEmail(correo);
    if (exists) {
      return [409, { error: 'El correo ya está registrado' }];
    }
    const newUser = addUser({ nombre, apellido: apellido || '', correo, password });
    return [201, {
      token: 'fake-jwt-token-' + newUser.id,
      refresh: 'fake-refresh-token',
      userId: newUser.id,
      user: newUser
    }];
  });

  mock.onGet(/\/auth\/profile/).reply(config => {
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    if (!authHeader) return [401, { error: 'No token' }];
    
    const userId = getUserIdFromHeader(authHeader);
    const user = getUserById(userId);
    if (user) {
      return [200, user];
    }
    return [404, { error: 'Usuario no encontrado' }];
  });

  mock.onPut(/\/auth\/profile\/plan/).reply(config => {
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    const userId = getUserIdFromHeader(authHeader);
    const { plan } = parseData(config.data);
    if (userId) {
      updateUserPlan(userId, plan);
      return [200, { message: 'Plan actualizado' }];
    }
    return [401, { error: 'No autorizado' }];
  });

  // TEMAS
  mock.onGet(/\/temas|http:\/\/localhost:3000\/api\/v1\/temas/).reply(() => {
    return [200, getTemas()];
  });

  // ACTIVIDADES (Docente)
  mock.onGet(/\/actividad\/historial/).reply(config => {
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    const userId = getUserIdFromHeader(authHeader) || 'usr-1';
    const acts = getActividades().filter(a => a.usuarioId === userId).map(a => ({
      ...a,
      creadoEn: a.createdAt
    }));
    return [200, { data: acts, total: acts.length, page: 1, limit: 10 }];
  });

  mock.onPost(/\/generar/).reply(config => {
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    const userId = getUserIdFromHeader(authHeader) || 'usr-1';
    const body = parseData(config.data);
    
    const newActivity = {
      id: 'act-' + Date.now(),
      temaId: body.temaId || 'tema-X',
      tipoMotor: body.tipoMotor || 'RPG',
      usuarioId: userId,
      tokenCorto: Math.random().toString(36).substring(2, 8).toUpperCase(),
      titulo: 'Nueva Actividad Generada',
      descripcion: body.descripcion || 'Descripción simulada',
      dataIa: generateMockIaData(body.tipoMotor || 'RPG'),
      scores: [],
      createdAt: new Date().toISOString()
    };
    addActivity(newActivity);
    return [200, { 
      message: 'Actividad generada exitosamente', 
      tokenCorto: newActivity.tokenCorto, 
      id: newActivity.id 
    }];
  });

  mock.onDelete(/\/actividad\/.+/).reply(config => {
    const url = config.url;
    const id = url.split('/').pop();
    deleteActivity(id);
    return [200, { message: 'Eliminado' }];
  });

  // JUEGO ESTUDIANTE
  mock.onGet(/.*\/actividad\/token\/.+\/ranking/).reply(config => {
    const url = config.url;
    const match = url.match(/\/actividad\/token\/(.+)\/ranking/);
    const token = match ? match[1] : null;
    const act = getActivityByToken(token);
    
    if (act && act.scores) {
      const scores = act.scores.map(s => ({
        nombre: s.nombre,
        seccion: s.seccion,
        score: s.aciertos * 10
      })).sort((a,b) => b.score - a.score);
      
      const bySection = scores.reduce((acc, curr) => {
        if(!acc[curr.seccion]) acc[curr.seccion] = [];
        acc[curr.seccion].push(curr);
        return acc;
      }, {});

      return [200, { general: scores, bySection }];
    }
    return [200, { general: [], bySection: {} }];
  });

  mock.onGet(/.*\/actividad\/token\/.+/).reply(config => {
    const url = config.url;
    // Evitar match con /ranking
    if(url.endsWith('/ranking') || url.endsWith('/score')) return [404, {}];
    
    const token = url.split('/').pop();
    const act = getActivityByToken(token);
    if (act) {
      return [200, {
        id: act.id,
        titulo: act.titulo,
        descripcion: act.descripcion,
        tipoMotor: act.tipoMotor,
        data: act.dataIa
      }];
    }
    return [404, { error: 'Actividad no encontrada' }];
  });

  mock.onPost(/.*\/actividad\/token\/.+\/score/).reply(config => {
    const url = config.url;
    const match = url.match(/\/actividad\/token\/(.+)\/score/);
    const token = match ? match[1] : null;
    const act = getActivityByToken(token);
    
    if (act) {
      const body = parseData(config.data);
      addScore(act.id, body);
      return [200, { message: 'Score guardado' }];
    }
    return [404, { error: 'Actividad no encontrada' }];
  });
};

setupMocks(mockApi);
setupMocks(mockGlobal);

export default mockApi;
