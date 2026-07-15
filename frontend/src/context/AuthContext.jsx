import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userPerfil');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (correo, password) => {
    const res = await api.post('/auth/login', { correo, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('userPerfil', JSON.stringify(res.data.perfil));
    setUser(res.data.perfil);
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    // Para simplificar, después del registro podríamos loguearlo automáticamente
    // pero el endpoint register ya devuelve tokens según la especificación
    localStorage.setItem('accessToken', res.data.token);
    localStorage.setItem('refreshToken', res.data.refresh);
    
    // Mock user profile
    const perfil = { id: res.data.userId, plan: 'Free' };
    localStorage.setItem('userPerfil', JSON.stringify(perfil));
    setUser(perfil);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userPerfil');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
