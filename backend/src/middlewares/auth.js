import jwt from 'jsonwebtoken';
import { db } from '../database.js';

const SECRET = 'mock-secret-key';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In a real app we verify using a secret. 
    // Here we just decode or check if it matches our mock format.
    // If we used jsonwebtoken to sign, we verify it.
    const decoded = jwt.verify(token, SECRET);
    
    // Verify user exists in mock DB
    const user = db.usuarios.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateMockToken = (userId) => {
  return jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
};

export const generateMockRefreshToken = (userId) => {
  return jwt.sign({ userId }, SECRET, { expiresIn: '7d' });
};
