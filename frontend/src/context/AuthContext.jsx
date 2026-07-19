import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      localStorage.setItem('userPerfil', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetchProfile();
      } else {
        const storedUser = localStorage.getItem('userPerfil');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (correo, password) => {
    const res = await api.post('/auth/login', { correo, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    
    // Fetch full profile to get all fields
    const fullProfile = await api.get('/auth/profile');
    localStorage.setItem('userPerfil', JSON.stringify(fullProfile.data));
    setUser(fullProfile.data);
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken', res.data.token);
    localStorage.setItem('refreshToken', res.data.refresh);
    
    // Fetch full profile to get all fields
    const fullProfile = await api.get('/auth/profile');
    localStorage.setItem('userPerfil', JSON.stringify(fullProfile.data));
    setUser(fullProfile.data);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    localStorage.setItem('userPerfil', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const updatePlan = async (plan) => {
    const res = await api.put('/auth/profile/plan', { plan });
    localStorage.setItem('userPerfil', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userPerfil');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchProfile, updateProfile, updatePlan }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
