import { db } from '../database.js';
import { generateMockToken, generateMockRefreshToken } from '../middlewares/auth.js';

export const register = (req, res, next) => {
  try {
    const { nombre, apellido, correo, password } = req.body;
    
    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const exists = db.usuarios.find(u => u.correo === correo);
    if (exists) {
      return res.status(409).json({ error: 'Correo ya existe' });
    }

    const newUserId = `usr-${db.usuarios.length + 1}`;
    const newUser = {
      id: newUserId,
      nombre,
      apellido,
      correo,
      password,
      plan: 'Free',
      generacionesMes: 0
    };

    db.usuarios.push(newUser);

    const token = generateMockToken(newUserId);
    const refresh = generateMockRefreshToken(newUserId);

    res.status(201).json({
      status: 'success',
      userId: newUserId,
      token,
      refresh
    });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => {
  try {
    const { correo, password } = req.body;
    
    const user = db.usuarios.find(u => u.correo === correo && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const accessToken = generateMockToken(user.id);
    const refreshToken = generateMockRefreshToken(user.id);

    res.status(200).json({
      accessToken,
      refreshToken,
      perfil: {
        id: user.id,
        plan: user.plan
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = (req, res, next) => {
  try {
    const { refresh } = req.body;
    if (!refresh) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }

    // Simplificado para el mock: aceptamos cualquier string como refresh
    const accessToken = generateMockToken('usr-mock'); // En un caso real, validaríamos el refresh token
    const refreshToken = generateMockRefreshToken('usr-mock');

    res.status(200).json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};
